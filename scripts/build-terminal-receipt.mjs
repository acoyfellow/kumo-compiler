#!/usr/bin/env node
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { canonicalJsonBytes, sha256Bytes, writeImmutableReceipt, IMMUTABLE_RECEIPT_SCHEMA_VERSION } from './lib/immutable-receipts.mjs';

const EXPECTED_AUTHORITY=Object.freeze({canonicalPackage:'@cloudflare/kumo@2.5.2',canonicalBrowserCells:164,canonicalImmutable:true,scope:{classified:45,executable:41,upstreamBlocked:['PageHeader','ResourceListPage'],supplemental:['Chart','Flow']},downstreamPackages:['@acoyfellow/kumo-vue@0.0.1','@acoyfellow/kumo-svelte@0.0.1','@acoyfellow/kumo-solid@0.0.1']});
const BAD=new Set(['failed','blocked','pending','not-run','not_run','notrun','diagnostic','unknown']);
const SHA=/^[a-f0-9]{64}$/;
const fail=(errors,message)=>errors.push(message);
const exact=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function scanStatuses(value,path,errors){
 if(Array.isArray(value))return value.forEach((v,i)=>scanStatuses(v,`${path}[${i}]`,errors));
 if(!value||typeof value!=='object')return;
 for(const [key,item] of Object.entries(value)){
  const here=`${path}.${key}`;
  if((key==='status'||key==='result')&&typeof item==='string'&&BAD.has(item.toLowerCase()))fail(errors,`${here} is ${item}`);
  scanStatuses(item,here,errors);
 }
}
function assertCount(errors,condition,message){if(!condition)fail(errors,message)}

/** Pure fail-closed validation. Input receipts are parsed JSON plus currentCommit. */
export function validateTerminalInputs(input){
 const errors=[]; const {authority,canonical,frameworks,readiness,examples,docs,kitchenSink,release,production,progress,currentCommit}=input??{};
 if(!exact(authority?.authority,EXPECTED_AUTHORITY))fail(errors,'terminal authority identity/scope/downstream packages do not exactly match');
 assertCount(errors,canonical?.status==='passed'&&canonical?.contracted===41&&canonical?.vectorsPassed===124&&canonical?.vectorsTotal===124&&canonical?.browserCells===164&&canonical?.immutable===true,'canonical prerequisite must prove 41 contracts, 124/124 vectors, and immutable 164-cell authority');
 for(const name of ['vue','svelte','solid']){const item=frameworks?.[name];assertCount(errors,item?.status==='passed'&&item?.vectorsPassed===124&&item?.vectorsTotal===124&&item?.components===41,`${name} must pass 124/124 vectors for 41 components`)}
 assertCount(errors,readiness?.count===41&&readiness?.implementationReadyCount===41,'readiness must be 41/41');
 assertCount(errors,Array.isArray(readiness?.components)&&readiness.components.length===41&&readiness.components.every(c=>c.implementationReady===true),'all readiness models must be implementation-ready');
 assertCount(errors,examples?.status==='passed'&&examples?.componentCount===41&&examples?.targetCount===3&&examples?.passedCount===123,'examples must pass 41x3');
 assertCount(errors,docs?.status==='passed'&&docs?.componentReferenceCoverage?.covered===41&&docs?.componentReferenceCoverage?.total===41&&docs?.diataxis?.covered===docs?.diataxis?.total&&docs?.diataxis?.total>=4,'docs must cover 41/41 and complete Diataxis');
 assertCount(errors,kitchenSink?.readiness==='41/41'&&['vue','svelte','solid'].every(f=>SHA.test(kitchenSink?.packages?.[f]?.sha256??''))&&Array.isArray(kitchenSink?.imports)&&kitchenSink.imports.length>0&&Array.isArray(kitchenSink?.omissions)&&kitchenSink.omissions.length>0&&kitchenSink.omissions.every(o=>o.component&&o.reason),'kitchen-sink must include package hashes, imports, and visible omission reasons');
 assertCount(errors,release?.status==='passed'&&release?.runMode==='terminal-detached-clean-copies'&&release?.independentRuns===2&&String(release?.environment?.node??'').startsWith('22.')&&String(release?.environment?.npm??'').startsWith('11.'),'release must be latest terminal-detached clean Node 22/npm 11 copies with two independent runs');
 assertCount(errors,production?.status==='passed'&&production?.runs?.length===2&&production.runs.every(r=>SHA.test(r.sha256)&&r.sha256!=='0'.repeat(64))&&production?.comparison?.equal===true&&SHA.test(production?.comparison?.sha256??'')&&production.comparison.sha256!=='0'.repeat(64),'production must contain two real passing runs and comparison');
 assertCount(errors,typeof currentCommit==='string'&&production?.identity?.commit===currentCommit,'production deployment must identify the current commit');
 assertCount(errors,progress?.phases?.every(p=>p.status==='passed'&&p.done===p.total),'progress may become terminal only after every phase passes');
 for(const [name,value] of Object.entries({canonical,frameworks,readiness,examples,docs,kitchenSink,release,production,progress}))scanStatuses(value,name,errors);
 return {valid:errors.length===0,errors};
}
export function buildTerminalBody(input,prerequisites){
 const validation=validateTerminalInputs(input); if(!validation.valid)throw new Error(`terminal prerequisites rejected:\n- ${validation.errors.join('\n- ')}`);
 return {schemaVersion:'kumo.terminal-body/v1',identity:'kumo-terminal',status:'passed',authority:EXPECTED_AUTHORITY,commit:input.currentCommit,metrics:{canonical:'124/124',canonicalAuthority:'164 immutable',frameworks:{vue:'124/124',svelte:'124/124',solid:'124/124'},readiness:'41/41',examples:'41x3',docs:'41/41+Diataxis',productionRuns:2},prerequisites};
}
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
async function load(path){const bytes=await readFile(resolve(root,path));return {path,value:JSON.parse(bytes),sha256:sha256Bytes(bytes)}}
export async function buildTerminalReceipt({repoRoot=root}={}){
 const paths={authority:'workflow/terminal-end-state.json',canonical:'proof/terminal/canonical.json',vue:'proof/terminal/vue.json',svelte:'proof/terminal/svelte.json',solid:'proof/terminal/solid.json',readiness:'proof/readiness/latest.json',examples:'proof/examples/latest.json',docs:'proof/docs/latest.json',kitchenSink:'proof/kitchen-sink/latest.json',release:'proof/release/latest.json',production:'proof/production-terminal/latest.json',progress:'proof/progress/latest.json'};
 const loaded={}; for(const [key,path] of Object.entries(paths)){try{const bytes=await readFile(resolve(repoRoot,path));loaded[key]={path,value:JSON.parse(bytes),sha256:sha256Bytes(bytes)}}catch(error){throw new Error(`terminal prerequisite unavailable: ${path} (${error.code??error.message})`)}}
 const currentCommit=execFileSync('git',['rev-parse','HEAD'],{cwd:repoRoot,encoding:'utf8'}).trim();
 const input={authority:loaded.authority.value,canonical:loaded.canonical.value,frameworks:{vue:loaded.vue.value,svelte:loaded.svelte.value,solid:loaded.solid.value},readiness:loaded.readiness.value,examples:loaded.examples.value,docs:loaded.docs.value,kitchenSink:loaded.kitchenSink.value,release:loaded.release.value,production:loaded.production.value,progress:loaded.progress.value,currentCommit};
 const prerequisites=Object.values(loaded).map(({path,sha256})=>({identity:path,sha256})).sort((a,b)=>a.identity.localeCompare(b.identity));
 const body=buildTerminalBody(input,prerequisites), contentBytes=canonicalJsonBytes(body), contentSha256=sha256Bytes(contentBytes);
 const receipt={schemaVersion:IMMUTABLE_RECEIPT_SCHEMA_VERSION,identity:'kumo-terminal',status:'passed',contentSha256,prerequisites,body};
 await writeImmutableReceipt(repoRoot,`proof/terminal/receipts/${contentSha256}.json`,receipt,{contentBytes,prerequisites});
 await mkdir(resolve(repoRoot,'proof/terminal'),{recursive:true});
 const pointer={schemaVersion:'kumo.terminal-pointer/v1',identity:'kumo-terminal',status:'passed',sha256:contentSha256,path:`receipts/${contentSha256}.json`};
 await writeFile(resolve(repoRoot,'proof/terminal/latest.json'),canonicalJsonBytes(pointer)); return pointer;
}
if(process.argv[1]&&resolve(process.argv[1])===resolve(fileURLToPath(import.meta.url))){buildTerminalReceipt().then(p=>console.log(JSON.stringify(p))).catch(e=>{console.error(e.message);process.exitCode=1})}
