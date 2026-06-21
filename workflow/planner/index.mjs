import {createHash} from 'node:crypto';

export const CAUSES=['contract','schema','canonical-observation','harness','compiler','substrate','emitter','package','docs','deploy','unknown'];
const volatile=new Set(['timestamp','recordedAt','startedAt','finishedAt','duration','durationMs','runId','attempt']);
export function canonical(value){
  if(Array.isArray(value)) return value.map(canonical).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
  if(value&&typeof value==='object') return Object.fromEntries(Object.entries(value).filter(([k])=>!volatile.has(k)).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,canonical(v)]));
  return value;
}
export function digest(value){return createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex')}
export function classify(failure={}){
  const explicit=failure.cause??failure.category;
  if(CAUSES.includes(explicit))return explicit;
  const text=[failure.code,failure.message,failure.command,...(failure.paths??[])].filter(Boolean).join(' ').toLowerCase();
  const rules=[
    ['contract',/contract/],['schema',/schema|validation|malformed/],['canonical-observation',/canonical.?observation|evidence mismatch|snapshot/],
    ['harness',/harness|browser|playwright|webdriver/],['compiler',/compiler|compile|typescript|rust|zig|golang/],['substrate',/substrate|runtime|node|network|filesystem/],
    ['emitter',/emitter|generated output|codegen/],['package',/package|npm|tarball|manifest/],['docs',/docs?|link/],['deploy',/deploy|release|publish/]
  ];
  return rules.find(([,r])=>r.test(text))?.[0]??'unknown';
}
export function failureFingerprint(failure){return digest({cause:classify(failure),code:failure.code??null,message:failure.message??null,command:failure.command??null,paths:failure.paths??[],capability:failure.capability??null})}
function intersects(a=[],b=[]){return a.some(x=>b.some(y=>x===y||x.startsWith(y.endsWith('/')?y:y+'/')||y.startsWith(x.endsWith('/')?x:x+'/')))}
export function assertOwnership(tasks,ownership={}){
  for(const task of tasks){if(!task.scopes?.length)throw Error(`task ${task.id} has no exact scopes`);const allowed=ownership[task.owner]??[];if(!task.scopes.every(p=>allowed.some(a=>p===a||p.startsWith(a.endsWith('/')?a:a+'/'))))throw Error(`task ${task.id} exceeds ownership for ${task.owner}`)}return true;
}
export function guardAntiWeakening(baseline,candidate){
  if(!baseline||!candidate)throw Error('gate guard requires baseline and candidate');
  const b=new Map((baseline.gates??[]).map(g=>[g.id,g]));const c=new Map((candidate.gates??[]).map(g=>[g.id,g]));
  for(const [id,g] of b){const n=c.get(id);if(!n)throw Error(`gate removed: ${id}`);if(g.required!==false&&n.required===false)throw Error(`gate optionalized: ${id}`)}
  if((candidate.inventory??41)<(baseline.inventory??41))throw Error('inventory reduction below 41');
  for(const k of ['skips','suppressions','filters','exceptions','allowlists'])if((candidate[k]?.length??0)>(baseline[k]?.length??0))throw Error(`new ${k} forbidden`);
  if(baseline.canonicalEvidenceDigest!==candidate.canonicalEvidenceDigest)throw Error('canonical evidence mutation');return true;
}
function attemptFor(f,history){return 1+history.filter(h=>h.fingerprint===failureFingerprint(f)).length}
export function plan(input){
  if(!input||!Array.isArray(input.failures)||!input.workflow||!input.capabilities||!input.ownership)throw Error('malformed planner evidence');
  if(input.expectedInputDigest&&input.expectedInputDigest!==digest({...input,expectedInputDigest:undefined}))throw Error('stale input digest');
  if(input.baselinePolicy||input.candidatePolicy)guardAntiWeakening(input.baselinePolicy,input.candidatePolicy);
  const history=input.receipts??[];const raw=input.failures.map(f=>({...f,cause:classify(f),fingerprint:failureFingerprint(f),attempt:attemptFor(f,history)}));
  const harnessGroups=new Map();for(const f of raw.filter(x=>x.cause==='harness'&&x.capability)){const key=f.fingerprint+'|'+f.capability;harnessGroups.set(key,[...(harnessGroups.get(key)??[]),f])}
  const promoted=new Set([...harnessGroups].filter(([,xs])=>new Set(xs.map(x=>x.component)).size>1).map(([k])=>k));
  const failures=raw.filter(f=>!promoted.has(f.fingerprint+'|'+f.capability));
  for(const [key,xs] of harnessGroups)if(promoted.has(key))failures.push({...xs[0],id:`shared-${xs[0].capability}`,component:null,components:[...new Set(xs.map(x=>x.component))].sort(),scopes:input.capabilities[xs[0].capability]?.scopes??xs[0].scopes,owner:input.capabilities[xs[0].capability]?.owner??xs[0].owner,promoted:true});
  const tasks=failures.map((f,i)=>{const mode=f.attempt===1?'repair':f.attempt===2?'diagnostic':'escalate';return {id:f.id??`${f.cause}-${f.component??i}-${f.fingerprint.slice(0,8)}`,cause:f.cause,fingerprint:f.fingerprint,attempt:f.attempt,mode,owner:f.owner,scopes:[...(f.scopes??[])].sort(),commands:mode==='escalate'?[]:[...(f.commands??[])],budget:{attempts:1,seconds:f.budgetSeconds??900,parallelism:mode==='diagnostic'?1:(f.parallelism??1)},receipts:{path:`.workflow/planner/receipts/${input.runId}/${f.id??f.fingerprint}.json`,requires:['status','fingerprint','inputDigest','outputDigest']},success:f.success??'declared gates pass',stop:mode==='escalate'?'escalate without mutation':'on success or budget exhaustion',forbidden:['scope expansion','gate weakening','canonical evidence mutation'],components:f.components}}).sort((a,b)=>a.id.localeCompare(b.id));
  assertOwnership(tasks,input.ownership);
  const slots={...input.slots,browser:input.slots?.browser??1};const remaining={...slots};const waves=[];for(const task of tasks){const capability=raw.find(f=>f.fingerprint===task.fingerprint)?.capability??'default';const need=task.mode==='diagnostic'?1:(input.capabilities[capability]?.slots??1);let wave=waves.find(w=>(remaining[`${w.index}:${capability}`]??slots[capability]??slots.default??1)>=need&&!w.tasks.some(t=>intersects(t.scopes,task.scopes)));if(!wave){wave={index:waves.length,tasks:[]};waves.push(wave)}wave.tasks.push(task);remaining[`${wave.index}:${capability}`]=(remaining[`${wave.index}:${capability}`]??slots[capability]??slots.default??1)-need}
  const payload={version:1,inputDigest:digest(input),tasks,waves,halt:tasks.some(t=>t.cause==='unknown'||t.mode==='escalate')};return {...payload,planDigest:digest(payload)};
}
