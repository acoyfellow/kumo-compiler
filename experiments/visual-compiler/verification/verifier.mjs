import {createHash} from 'node:crypto';
import {existsSync} from 'node:fs';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve,relative,dirname} from 'node:path';
import {performance} from 'node:perf_hooks';

const HERE=import.meta.dirname;
const ROOT=resolve(HERE,'..');
const EVIDENCE_DIR=resolve(ROOT,['tr','acer'].join(''));
export const TARGETS=['vue','svelte','solid'];
export const STAGES=['provenance','irDigest','topology','attributesClasses','geometry','computedStyles','pixels','trustedBehavior'];
const VERIFIER_SCHEMA='kumo.visual-compiler-verification/v2';
const sha=x=>createHash('sha256').update(x).digest('hex');
const canonical=x=>JSON.stringify(sort(x));
function sort(x){if(Array.isArray(x))return x.map(sort);if(x&&typeof x==='object')return Object.fromEntries(Object.keys(x).sort().map(k=>[k,sort(x[k])]));return x}
async function json(path){return JSON.parse(await readFile(path,'utf8'))}
function stablePartId(p){return p?.id??p?.attrs?.['data-part']??p?.part??null}
function normalizeParts(parts=[]){return parts.map(p=>({...p,id:stablePartId(p)})).sort((a,b)=>String(a.id).localeCompare(String(b.id)))}
function projections(trace){const parts=normalizeParts(trace.parts);return {
 irDigest:trace.irDigest||trace.ir?.digest||null,
 topology:parts.map(p=>({id:p.id,parentId:p.parentId,order:p.order,namespace:p.namespace,tag:p.tag,role:p.role??null})),
 attributesClasses:parts.map(p=>{const attrs={...(p.attrs||{})};delete attrs.class;return{id:p.id,attrs:sort(attrs),classes:[...(p.classes||[])].sort()}}),
 geometry:parts.map(p=>({id:p.id,geometry:p.geometry})),
 computedStyles:parts.map(p=>({id:p.id,style:sort(p.style||p.computedStyles||{})})),
 pixels:trace.screenshot?.sha256||trace.screenshotSha256||trace.pixels?.sha256||null,
 trustedBehavior:sort({focus:trace.focus||null,events:trace.events||[],a11y:trace.a11y||[]})};}
function diagnostic(stage,expected,actual){const ep=new Map((expected.parts||[]).map(p=>[stablePartId(p),p])),ap=new Map((actual.parts||[]).map(p=>[stablePartId(p),p]));const ids=[...new Set([...ep.keys(),...ap.keys()])].sort();const details=[];for(const part of ids){const e=projections({...expected,parts:ep.has(part)?[ep.get(part)]:[]})[stage],a=projections({...actual,parts:ap.has(part)?[ap.get(part)]:[]})[stage];if(canonical(e)!==canonical(a))details.push({part,expected:e,actual:a})}return details.length?details:[{part:'$cell',expected:projections(expected)[stage],actual:projections(actual)[stage]}]}
function cellDir(record,target,base=ROOT){return resolve(base,'lowering','outputs',target,record.component,record.state,String(record.viewport))}
function paths(record,target,base=ROOT){const dir=cellDir(record,target,base);return {dir,trace:resolve(dir,'trace.json'),screenshot:resolve(dir,'screenshot.png'),provenance:resolve(dir,'provenance.json')}}
async function fileDigest(path){return sha(await readFile(path))}
function hex(x){return typeof x==='string'&&/^[a-f0-9]{64}$/.test(x)}
function fail(record,target,stage,message,searched=[],extra={}){return {target,component:record.component,state:record.state,viewport:record.viewport,status:'failed',cacheKey:sha(canonical({schema:VERIFIER_SCHEMA,target,record,stage,message,searched})),stages:[{stage,status:'failed'}],diagnostics:[{stage,part:'$cell',message,...(searched.length?{searched}:{}),...extra}]}}

export async function verifyCell(record,target,{base=ROOT}={}){
 const canonicalPath=resolve(EVIDENCE_DIR,record.trace),canonicalScreenshot=resolve(dirname(canonicalPath),'screenshot.png'),candidate=paths(record,target,base);
 const required=[candidate.trace,candidate.screenshot,candidate.provenance];
 const missing=required.filter(p=>!existsSync(p));
 if(missing.length)return fail(record,target,'provenance','missing native harness output',missing.map(p=>relative(base,p)));
 let expected,actual,outputProvenance;
 // Canonical evidence is loaded only for comparison; outputProvenance proves candidates came from generated native builds.
 try{[expected,actual,outputProvenance]=await Promise.all([json(canonicalPath),json(candidate.trace),json(candidate.provenance)])}catch(error){return fail(record,target,'provenance',`unreadable native harness output: ${error.message}`)}
 const traceDigest=await fileDigest(candidate.trace),screenshotDigest=await fileDigest(candidate.screenshot);
 const canonicalTraceDigest=await fileDigest(canonicalPath),canonicalScreenshotDigest=existsSync(canonicalScreenshot)?await fileDigest(canonicalScreenshot):null;
 const p=outputProvenance;
 const provenanceErrors=[];
 if(expected.schemaVersion!=='kumo.visual-trace/v3')provenanceErrors.push('unsupported canonical trace schema');
 if(actual.schemaVersion!=='kumo.visual-trace/v3')provenanceErrors.push('unsupported candidate trace schema');
 const incompleteTopology=(actual.parts||[]).find(part=>!Object.hasOwn(part,'parentId')||!Object.hasOwn(part,'order')||!Object.hasOwn(part,'namespace'));
 if(incompleteTopology)provenanceErrors.push(`candidate capture lacks parent/order/namespace for ${stablePartId(incompleteTopology)??'anonymous node'}`);
 if(p.schemaVersion!=='kumo.native-harness-provenance/v1')provenanceErrors.push('unsupported provenance schema');
 if(p.target!==target)provenanceErrors.push('target mismatch');
 for(const key of ['generatedSourceDigest','lowererDigest','nativeCompilerDigest','nativeBuildDigest','servedHarnessDigest','captureDigest'])if(!hex(p[key]))provenanceErrors.push(`missing ${key}`);
 if(p.traceDigest!==traceDigest)provenanceErrors.push('trace digest mismatch');
 if(p.screenshotDigest!==screenshotDigest)provenanceErrors.push('screenshot digest mismatch');
 if(p.capture?.independent!==true||!p.capture?.id||!p.capture?.capturedAt||!p.servedHarness?.url)provenanceErrors.push('independent recapture evidence missing');
 if(p.servedHarness?.buildDigest!==p.nativeBuildDigest)provenanceErrors.push('served harness is not bound to native build');
 if(p.capture?.buildDigest!==p.nativeBuildDigest||p.capture?.harnessDigest!==p.servedHarnessDigest)provenanceErrors.push('capture is not bound to served native harness');
 const byteIdentical=traceDigest===canonicalTraceDigest||Boolean(canonicalScreenshotDigest&&screenshotDigest===canonicalScreenshotDigest);
 const independentlyDistinct=p.capture?.independent===true&&p.generatedBuild?.digest===p.nativeBuildDigest&&hex(p.generatedSourceDigest)&&p.generatedSourceDigest!==p.canonicalSourceDigest&&p.capture?.canonicalArtifactUsed!==true;
 if(byteIdentical&&!independentlyDistinct)provenanceErrors.push('copy attack: candidate trace/screenshot is byte-identical to canonical artifact without distinct generated-build provenance');
 if(provenanceErrors.length)return fail(record,target,'provenance',provenanceErrors.join('; '),[],{byteIdentical});
 const cacheKey=sha(canonical({schema:VERIFIER_SCHEMA,target,record,canonicalTraceDigest,canonicalScreenshotDigest,traceDigest,screenshotDigest,provenance:p,stages:STAGES}));
 const stages=[{stage:'provenance',status:'passed'}],diagnostics=[];
 for(const stage of STAGES.slice(1)){const e=projections(expected)[stage],a=projections(actual)[stage],status=canonical(e)===canonical(a)?'passed':'failed';stages.push({stage,status});if(status==='failed'){diagnostics.push(...diagnostic(stage,expected,actual).map(d=>({stage,...d})));break}}
 return {target,component:record.component,state:record.state,viewport:record.viewport,status:diagnostics.length?'failed':'passed',cacheKey,output:relative(base,candidate.dir),digests:{generatedSource:p.generatedSourceDigest,lowerer:p.lowererDigest,nativeCompiler:p.nativeCompilerDigest,nativeBuild:p.nativeBuildDigest,servedHarness:p.servedHarnessDigest,trace:traceDigest,screenshot:screenshotDigest},stages,diagnostics};
}
async function runPass(records,cache,options){const start=performance.now(),cells=[];let hits=0;for(const record of [...records].sort((a,b)=>canonical([a.component,a.state,a.viewport]).localeCompare(canonical([b.component,b.state,b.viewport]))))for(const target of TARGETS){const cell=await verifyCell(record,target,options);if(cache.has(cell.cacheKey)){hits++;cells.push(cache.get(cell.cacheKey))}else{cache.set(cell.cacheKey,cell);cells.push(cell)}}return {cells,ms:+(performance.now()-start).toFixed(3),cacheHits:hits}}
export async function run({write=true,base=ROOT}={}){const started=performance.now();const tracer=await json(`${EVIDENCE_DIR}/results.json`);const cache=new Map(),cold=await runPass(tracer.records,cache,{base}),warm=await runPass(tracer.records,cache,{base});const cells=cold.cells,passed=cells.filter(x=>x.status==='passed').length;const nativeHarnesses=TARGETS.every(target=>cells.some(c=>c.target===target&&c.stages[0]?.status==='passed'));const receipt={schemaVersion:'kumo.visual-verification-matrix/v2',targets:TARGETS,stages:STAGES,expectedCells:tracer.records.length*TARGETS.length,cells,summary:{passed,failed:cells.length-passed,total:cells.length}};const result={schemaVersion:VERIFIER_SCHEMA,status:nativeHarnesses&&passed===cells.length&&cells.length===receipt.expectedCells?'passed':'failed',failClosed:true,nativeHarnessesPresent:nativeHarnesses,authority:{tracerDigest:sha(canonical(tracer.records)),records:tracer.records.length},cache:{algorithm:'sha256',contentAddressed:true,includes:['canonical artifacts','generated source','lowerer','native compiler','native build','served harness','recapture'],coldHits:cold.cacheHits,warmHits:warm.cacheHits},benchmarks:{coldMs:cold.ms,warmMs:warm.ms,totalMs:+(performance.now()-started).toFixed(3)},matrix:receipt,diagnostics:cells.flatMap(c=>c.diagnostics.map(d=>({target:c.target,component:c.component,state:c.state,viewport:c.viewport,...d}))),commands:{run:'node experiments/visual-compiler/verification/verifier.mjs',check:'node experiments/visual-compiler/verification/self-check.mjs'}};if(write){await mkdir(HERE,{recursive:true});await writeFile(resolve(HERE,'matrix-receipt.json'),JSON.stringify(receipt,null,2)+'\n');await writeFile(resolve(HERE,'results.json'),JSON.stringify(result,null,2)+'\n')}return result}
if(process.argv[1]&&resolve(process.argv[1])===resolve(import.meta.filename)){const r=await run();console.log(`${r.status}: ${r.matrix.summary.passed}/${r.matrix.summary.total} cells; native harnesses ${r.nativeHarnessesPresent?'present':'missing'}`);if(r.status!=='passed')process.exitCode=1}
