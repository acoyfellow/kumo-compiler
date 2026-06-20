import {createHash} from 'node:crypto';
import {readdir,readFile,stat,writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {resolve,relative} from 'node:path';

const root=resolve(import.meta.dirname,'..');
const catalog=JSON.parse(await readFile(resolve(root,'generated/catalog.ir.json'),'utf8'));
const ids=catalog.components.map(component=>component.id);
if(ids.length!==41||new Set(ids).size!==41)throw new Error(`expected 41 unique IR components, got ${ids.length}`);
const hash=value=>createHash('sha256').update(value).digest('hex');
const walk=async dir=>{const result=[];if(!existsSync(dir))return result;for(const entry of (await readdir(dir,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){const path=resolve(dir,entry.name);if(entry.isDirectory())result.push(...await walk(path));else result.push(path)}return result};
const sourceCandidates=id=>[
 resolve(root,'runtime',id,'react'),
 ...(['select','button','dialog','popover'].includes(id)?[resolve(root,'runtime','react')]:[]),
 ...(['field','input','input-group','input-area','sensitive-input','clipboard-text'].includes(id)?[resolve(root,'runtime','form','react')]:[])
];
const summary={schemaVersion:'kumo.react-audit-summary/v1',catalogSchema:catalog.schemaVersion,total:ids.length,passed:0,failed:0,blocked:0,limitations:['No React runtime has machine-verifiable provenance binding it to an exact canonical Kumo package source/revision.','A reachable build or visual lookalike is not accepted as canonical-source, SSR/hydration, behavior, console/network, or pixel evidence.']};
for(const id of ids){
 const roots=sourceCandidates(id).filter(existsSync);
 const files=(await Promise.all(roots.map(walk))).flat().filter((file,index,array)=>array.indexOf(file)===index);
 const sources=[];for(const file of files){const bytes=await readFile(file);sources.push({path:relative(root,file),sha256:hash(bytes),bytes:(await stat(file)).size})}
 const provenanceFiles=sources.filter(item=>/provenance\.json$/.test(item.path));
 let canonicalBinding=false;for(const item of provenanceFiles){try{const value=JSON.parse(await readFile(resolve(root,item.path),'utf8'));canonicalBinding ||= Boolean(value.canonicalReactSource&&value.canonicalReactRevision)}catch{}}
 const status=canonicalBinding?'failed':'blocked';summary[status]++;
 const reason=canonicalBinding?'Canonical binding exists but the complete browser evidence suite has not passed.':'No exact canonical Kumo React source/package revision provenance; downstream gates cannot truthfully be attributed to canonical React.';
 const checks=Object.fromEntries(['canonicalSourceProvenance','productionBuild','runtimeRoute','ssrMarkup','hydration','assetsStyles','console','network','domAria','behaviorVectors','screenshotPixel','packageEvidence'].map(name=>[name,{status:name==='canonicalSourceProvenance'&&canonicalBinding?'passed':status,reason:name==='canonicalSourceProvenance'?reason:'Not credited because canonical source provenance is blocked.'}]));
 const receipt={schemaVersion:'kumo.receipt/v1',component:id,framework:'react',classification:status,canonicalInput:true,sourceEvidence:{files:sources,provenanceFiles:provenanceFiles.map(x=>x.path),bindingVerified:canonicalBinding},routes:{build:`runtime/${id}/react`,runtime:`/${id}/react`,directory:`/components/${id}/`},checks,limitations:[reason],determinism:{sourceManifestHash:hash(JSON.stringify(sources))}};
 await writeFile(resolve(root,`generated/receipts/${id}.react.json`),JSON.stringify(receipt,null,2)+'\n');
}
await writeFile(resolve(root,'generated/react-audit-summary.json'),JSON.stringify(summary,null,2)+'\n');
const migration=JSON.parse(await readFile(resolve(root,'generated/migration-status.json'),'utf8'));
for(const id of ids){const receipt=JSON.parse(await readFile(resolve(root,`generated/receipts/${id}.react.json`),'utf8'));migration.components[id]={...migration.components[id],react:receipt.classification,reactReceipt:`generated/receipts/${id}.react.json`}}
migration.auditSummary={react:'generated/react-audit-summary.json'};
await writeFile(resolve(root,'generated/migration-status.json'),JSON.stringify(migration,null,2)+'\n');
console.log(`React audit: ${summary.total} classified; ${summary.passed} passed, ${summary.failed} failed, ${summary.blocked} blocked`);
