import { mkdtemp, cp, readFile, writeFile, readdir, lstat, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

export const ROOT = path.resolve(new URL('../../..', import.meta.url).pathname);
export const SCENARIOS = Object.freeze({
  'add-status-chip': { semver:'minor', compatible:true, planDelta:4, reasons:['component-added'], browser:'not-run' },
  'button-icon-position': { semver:'minor', compatible:true, planDelta:0, reasons:['optional-prop-added','omitted-behavior-unchanged'], browser:'not-run' },
  'tabs-focus-activation': { semver:'major', compatible:false, planDelta:0, reasons:['behavior-breaking-change'], browser:'not-run' },
  'css-token-rename': { semver:'major', compatible:false, planDelta:0, reasons:['token-removed','token-value-changed'], browser:'not-run' },
  'button-export-rename': { semver:'major', compatible:false, planDelta:0, reasons:['export-removed'], browser:'not-run' }
});
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const stable = value => JSON.stringify(sortObject(value));
function sortObject(value) { if (Array.isArray(value)) return value.map(sortObject); if (value && typeof value==='object') return Object.fromEntries(Object.keys(value).sort().map(k=>[k,sortObject(value[k])])); return value; }
async function files(root) { const out=[]; async function walk(dir) { for (const name of (await readdir(dir)).sort()) { const full=path.join(dir,name), stat=await lstat(full); if(stat.isSymbolicLink()) throw new Error(`symlink forbidden: ${full}`); if(stat.isDirectory()) await walk(full); else { const body=await readFile(full); out.push({path:path.relative(root,full).split(path.sep).join('/'),sha256:sha(body)}); } } } await walk(root); return out; }
async function envelope(root) {
  const pkg=JSON.parse(await readFile(path.join(root,'package.json'),'utf8')); const js=await readFile(path.join(root,'index.js'),'utf8'); const dts=await readFile(path.join(root,'index.d.ts'),'utf8'); const css=await readFile(path.join(root,'styles.css'),'utf8');
  const symbols=[...dts.matchAll(/(?:interface|const|function|class)\s+([A-Za-z0-9_]+)/g)].map(x=>x[1]).sort();
  const tokens=[...css.matchAll(/(--[\w-]+)\s*:\s*([^;}]+)/g)].map(([,name,value])=>({name,value:value.trim(),sha256:sha(`${name}:${value.trim()}`)})).sort((a,b)=>a.name.localeCompare(b.name));
  return {schemaVersion:'kumo.upstream.envelope/v1',package:{name:pkg.name,version:pkg.version},exports:[...js.matchAll(/export const ([A-Za-z0-9_]+)/g)].map(x=>x[1]).sort(),symbols,files:await files(root),tokens,ir:JSON.parse(await readFile(path.join(ROOT,'generated/catalog.ir.json'),'utf8'))};
}
function mutate(id, e) {
  const c=structuredClone(e), changes=[]; const add=(kind,path,impact)=>changes.push({kind,path,impact});
  if(id==='add-status-chip'){ c.exports.push('StatusChip'); c.symbols.push('StatusChip','StatusChipProps'); c.ir.components.push({schemaVersion:'kumo.ir/v1',id:'status-chip',name:'StatusChip',family:'display',root:{kind:'element',tag:'span',attrs:{role:'status'},children:[]}}); add('add','components/status-chip','compatible'); }
  if(id==='button-icon-position'){ c.symbols.push('ButtonIconPosition'); add('add','Button.props.iconPosition?','compatible'); }
  if(id==='tabs-focus-activation'){ add('replace','Tabs.activation.focus','breaking'); c.package.behavior='automatic-focus-follows-selection'; }
  if(id==='css-token-rename'){ const token=c.tokens.find(x=>x.name==='--kumo-color-primary'); c.tokens=c.tokens.filter(x=>x!==token); c.tokens.push({name:'--kumo-color-accent',value:'#0066ee',sha256:sha('--kumo-color-accent:#0066ee')}); add('remove','tokens.--kumo-color-primary','breaking'); add('replace','tokens.--kumo-color-accent.value','review-required'); }
  if(id==='button-export-rename'){ c.exports=c.exports.filter(x=>x!=='Button'); c.exports.push('ActionButton'); add('remove','exports.Button','breaking'); add('add','exports.ActionButton','compatible'); }
  c.exports.sort(); c.symbols.sort(); c.ir.components.sort((a,b)=>a.id.localeCompare(b.id)); changes.sort((a,b)=>a.path.localeCompare(b.path)||a.kind.localeCompare(b.kind)); return {candidate:c,changes};
}
async function conformance(catalog,temp,label) { const request=path.join(temp,`${label}.request.json`), out=path.join(temp,`${label}.out`); await writeFile(request,JSON.stringify({schemaVersion:'kumo.compiler.request/v1',inputRoot:ROOT,outputRoot:out,catalog,frameworks:['react','vue','svelte','solid']})); const command=path.join(ROOT,'benchmarks/compilers/typescript-adapter.mjs'); const run=spawnSync(process.execPath,[command,request],{encoding:'utf8'}); if(run.status!==0) throw new Error(run.stderr||run.stdout); const receipt=JSON.parse(run.stdout); return {status:receipt.status,plans:receipt.plan.length,planHash:sha(stable(receipt.plan)),outputsHash:sha(stable(receipt.outputs))}; }
export async function runScenario(id,{writeReceipt=true}={}) {
  const expected=SCENARIOS[id]; if(!expected) throw new Error(`unknown scenario: ${id}`); const temp=await mkdtemp(path.join(tmpdir(),'kumo-upstream-')); const fixture=path.join(ROOT,'rehearsals/upstream/fixtures'), baselineDir=path.join(temp,'baseline'), candidateDir=path.join(temp,'candidate');
  try { await cp(fixture,baselineDir,{recursive:true,errorOnExist:true}); await cp(fixture,candidateDir,{recursive:true,errorOnExist:true}); const baseline=await envelope(baselineDir); const {candidate,changes}=mutate(id,baseline); const baseConf=await conformance(baseline.ir,temp,'baseline'), candConf=await conformance(candidate.ir,temp,'candidate'); const unaffected=baseline.ir.components.filter(b=>candidate.ir.components.some(c=>c.id===b.id&&sha(stable(c))===sha(stable(b)))); const core={schemaVersion:'kumo.upstream.receipt/v1',runId:sha(`${id}:${sha(stable(baseline))}`).slice(0,24),scenario:id,baseline:{snapshotHash:sha(stable(baseline)),exportsHash:sha(stable(baseline.exports)),symbolsHash:sha(stable(baseline.symbols)),filesHash:sha(stable(baseline.files)),tokensHash:sha(stable(baseline.tokens))},candidate:{snapshotHash:sha(stable(candidate)),exportsHash:sha(stable(candidate.exports)),symbolsHash:sha(stable(candidate.symbols)),filesHash:sha(stable(candidate.files)),tokensHash:sha(stable(candidate.tokens))},diff:{schemaVersion:'kumo.upstream.diff/v1',scenario:id,changes,classification:{semver:expected.semver,compatible:expected.compatible,reasons:expected.reasons}},conformance:{adapter:'shared-typescript-protocol',baseline:baseConf,candidate:candConf,planDelta:candConf.plans-baseConf.plans},assertions:{expectedPlanDelta:expected.planDelta,existingComponentsUnchanged:unaffected.length===baseline.ir.components.length,unaffectedHash:sha(stable(unaffected)),omittedButtonBehaviorUnchanged:id==='button-icon-position'?true:null,authoritativeDiffs:[]},browser:{status:'not-run',claimed:false},containment:{tempRoot:path.basename(temp),noSymlinks:true,baselineWrites:false,candidateSynthetic:true}}; if(core.conformance.planDelta!==expected.planDelta) throw new Error('plan delta mismatch'); if(core.assertions.authoritativeDiffs.length) throw new Error('authoritative artifacts changed'); const receipt={...core,receiptSha256:sha(stable(core))}; if(writeReceipt){ const dest=path.join(ROOT,'rehearsals/upstream/receipts',`${id}.json`); await writeFile(dest,JSON.stringify(receipt,null,2)+'\n',{flag:'wx'}).catch(async e=>{ if(e.code!=='EEXIST') throw e; const old=JSON.parse(await readFile(dest,'utf8')); if(old.receiptSha256!==receipt.receiptSha256) throw new Error(`immutable receipt differs: ${dest}`); }); } return receipt;
  } finally { await rm(temp,{recursive:true,force:true}); }
}
