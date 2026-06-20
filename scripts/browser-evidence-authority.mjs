import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {existsSync,realpathSync} from 'node:fs';
import {dirname,relative,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
export const frameworks=['react','vue','svelte','solid'];
const defaultRoot=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const sha=x=>createHash('sha256').update(x).digest('hex');
const json=async p=>JSON.parse(await readFile(p,'utf8'));
const fail=m=>{throw Error(`browser evidence authority: ${m}`)};
export async function validateAuthority({root=defaultRoot,authorityPath=resolve(root,'generated/browser-evidence/authority.json')}={}){
 const authority=await json(authorityPath);if(authority.schemaVersion!=='kumo.browser-authority/v1')fail('bad authority schema');
 const catalog=await json(resolve(root,'generated/catalog.ir.json'));if(catalog.schemaVersion!=='kumo.ir/v1'||catalog.components.length!==41)fail('bad catalog');
 const ids=catalog.components.map(x=>x.id),wanted=new Set(ids);if(wanted.size!==41)fail('duplicate catalog identity');
 if(Object.keys(authority.selected||{}).sort().join()!==frameworks.slice().sort().join())fail('exactly four selections required');
 const selected={};
 for(const framework of frameworks){const slot=authority.selected[framework];if(!slot||typeof slot.runId!=='string'||typeof slot.manifest!=='string')fail(`${framework}: invalid selection`);
  const expected=`generated/browser-evidence/runs/${slot.runId}.json`;if(slot.manifest!==expected)fail(`${framework}: manifest/run mismatch`);
  const path=resolve(root,slot.manifest),runs=realpathSync(resolve(root,'generated/browser-evidence/runs'));if(relative(runs,realpathSync(path)).startsWith(`..${sep}`))fail(`${framework}: escaped runs directory`);
  const bytes=await readFile(path),run=JSON.parse(bytes);if(slot.sha256!==sha(bytes))fail(`${framework}: manifest digest mismatch`);if(!['kumo.browser-proof-run/v1','kumo.browser-proof-run/v2'].includes(run.schemaVersion)||run.runId!==slot.runId||run.frameworks?.length!==1||run.frameworks[0]!==framework)fail(`${framework}: run identity/mixed run`);
  if(run.schemaVersion==='kumo.browser-proof-run/v2'&&!run.browserExecutable)fail(`${framework}: missing browser executable provenance`);
  if(run.results?.length!==41||run.components?.length!==41||new Set(run.components).size!==41||run.components.some(x=>!wanted.has(x)))fail(`${framework}: incomplete component list`);
  const seen=new Set(),results=new Map();for(const result of run.results){if(result.framework!==framework||!wanted.has(result.component)||seen.has(result.component)||result.status!=='passed')fail(`${framework}: incomplete, duplicate, swapped, or failed result`);seen.add(result.component);
   const prefix=`generated/browser-evidence/${framework}/${result.component}/`;if(typeof result.evidence!=='string'||!result.evidence.startsWith(prefix)||!result.evidence.endsWith('/evidence.json'))fail(`${framework}/${result.component}: forged evidence path`);
   const ep=resolve(root,result.evidence),base=realpathSync(resolve(root,`generated/browser-evidence/${framework}/${result.component}`));if(relative(base,realpathSync(ep)).startsWith(`..${sep}`))fail(`${framework}/${result.component}: escaped evidence path`);
   const evidence=await json(ep),digest=result.evidence.split('/').at(-2);if(sha(JSON.stringify(evidence))!==digest)fail(`${framework}/${result.component}: evidence digest mismatch`);
   if(!['kumo.browser-evidence/v1','kumo.browser-evidence/v2'].includes(evidence.schemaVersion)||evidence.synthetic!==false||evidence.component!==result.component||evidence.framework!==framework||evidence.failures?.length||!evidence.checks||Object.values(evidence.checks).some(x=>x!==true))fail(`${framework}/${result.component}: invalid evidence/checks`);
   if(evidence.schemaVersion==='kumo.browser-evidence/v2'&&(!evidence.browser?.executable||!evidence.browser?.product||!evidence.browser?.userAgent||!evidence.browser?.protocolVersion))fail(`${framework}/${result.component}: missing browser version provenance`);
   const png=resolve(dirname(ep),'screenshot.png');if(!existsSync(png)||sha(await readFile(png))!==evidence.screenshot?.sha256)fail(`${framework}/${result.component}: screenshot mismatch`);
   if(framework!=='react'){const p=await json(resolve(root,'runtime',result.component,framework,'provenance.json'));if(p.schemaVersion!==catalog.schemaVersion||p.component!==result.component||p.framework!==framework||!p.irHash||!p.emitterHash)fail(`${framework}/${result.component}: stale provenance`);}
   results.set(result.component,{...result,runId:run.runId,manifest:slot.manifest,manifestSha256:slot.sha256,evidenceDigest:digest,browserIdentity:evidence.schemaVersion==='kumo.browser-evidence/v2'?{framework,component:result.component,url:evidence.url,browser:evidence.browser}:{framework,component:result.component,url:evidence.url},evidenceObject:evidence});
  } selected[framework]={run,results};
 }
 return {authority,catalog,selected,limitations:Object.values(selected).some(({run})=>run.schemaVersion==='kumo.browser-proof-run/v1')?['Selected legacy v1 evidence predates browser executable/version provenance; every future v2 run requires it.']:[]};
}
export const browserBinding=(validated,framework,component)=>{const x=validated.selected[framework]?.results.get(component);if(!x)fail(`${framework}/${component}: not selected`);return {runId:x.runId,manifest:x.manifest,manifestSha256:x.manifestSha256,evidence:x.evidence,evidenceDigest:x.evidenceDigest,browserIdentity:x.browserIdentity};};
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){const x=await validateAuthority();console.log(`validated ${frameworks.length} immutable runs, ${frameworks.length*41} browser evidence records`)}
