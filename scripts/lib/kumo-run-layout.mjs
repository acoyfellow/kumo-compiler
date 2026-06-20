import {createHash,randomUUID} from 'node:crypto';
import {cp,mkdir,open,readFile,rename,rm,writeFile} from 'node:fs/promises';
import {dirname,isAbsolute,relative,resolve} from 'node:path';
import {frameworks,manifest} from '../../proof/catalog-browser-manifest.mjs';

export const GROUP_SIZE=7;
export const targets=manifest.components.flatMap(c=>frameworks.map(framework=>({component:c.id,framework})));
export const digest=b=>createHash('sha256').update(b).digest('hex');
export function planShards(size=GROUP_SIZE){if(!Number.isInteger(size)||size<1)throw Error('invalid group size');const ids=manifest.components.map(x=>x.id),out=[];for(let i=0;i<ids.length;i+=size)out.push({index:out.length,components:ids.slice(i,i+size),targets:ids.slice(i,i+size).flatMap(component=>frameworks.map(framework=>({component,framework})))});return out}
export function inside(root,path){const r=relative(resolve(root),resolve(path));return r!==''&&!r.startsWith('..')&&!isAbsolute(r)}
export async function immutableJson(path,value){const body=Buffer.from(JSON.stringify(value,null,2)+'\n');await mkdir(dirname(path),{recursive:true});try{const old=await readFile(path);if(!old.equals(body))throw Error(`immutable collision: ${path}`);return}catch(e){if(e.code!=='ENOENT')throw e}await writeFile(path,body,{flag:'wx'})}
export async function validateAndFanIn({runId,shardFiles,evidenceRoot}){
 const expected=new Map(targets.map(t=>[`${t.component}/${t.framework}`,t])),seen=new Map();
 for(const file of [...shardFiles].sort()){
  const shard=JSON.parse(await readFile(file,'utf8'));if(shard.runId!==runId)throw Error(`shard run identity mismatch: ${file}`);if(shard.status!=='passed')throw Error(`failed shard: ${file}`);
  for(const result of shard.results||[]){const key=`${result.component}/${result.framework}`;if(!expected.has(key))throw Error(`unexpected target: ${key}`);if(seen.has(key))throw Error(`duplicate target: ${key}`);if(result.status!=='passed')throw Error(`failed target: ${key}`);
   const path=resolve(result.evidence);if(!inside(evidenceRoot,path))throw Error(`evidence path escapes root: ${key}`);const body=await readFile(path),e=JSON.parse(body);if(e.component!==result.component||e.framework!==result.framework)throw Error(`evidence identity mismatch: ${key}`);if(result.sha256&&digest(body)!==result.sha256)throw Error(`evidence digest mismatch: ${key}`);if(e.schemaVersion!=='kumo.browser-evidence/v1'||e.synthetic||e.failures?.length||Object.values(e.checks||{}).some(x=>x!==true))throw Error(`failed evidence: ${key}`);seen.set(key,{...result,evidence:path,sha256:digest(body)});
  }
 }
 const missing=[...expected.keys()].filter(k=>!seen.has(k));if(missing.length)throw Error(`missing targets: ${missing.join(', ')}`);
 return {schemaVersion:'kumo.matrix-summary/v1',runId,status:'passed',targetCount:targets.length,results:targets.map(t=>seen.get(`${t.component}/${t.framework}`))};
}
export async function promoteAtomic({summary,authorityRoot,evidenceRoot,lockPath=resolve(authorityRoot,'.promotion.lock'),simulateInterrupt=false}){
 await mkdir(authorityRoot,{recursive:true});let lock,temp,stage;try{lock=await open(lockPath,'wx');let promoted=summary;if(evidenceRoot){const runs=resolve(authorityRoot,'matrix-runs');await mkdir(runs,{recursive:true});stage=resolve(runs,`.${summary.runId}.${randomUUID()}.tmp`);await cp(evidenceRoot,resolve(stage,'evidence'),{recursive:true,errorOnExist:true});const finalRun=resolve(runs,summary.runId);await rename(stage,finalRun);stage=null;promoted={...summary,results:summary.results.map(r=>({...r,evidence:resolve(finalRun,'evidence',relative(evidenceRoot,r.evidence))}))}}
  const final=resolve(authorityRoot,'run-summary.json');temp=resolve(authorityRoot,`.run-summary.${summary.runId}.${randomUUID()}.tmp`);await writeFile(temp,JSON.stringify(promoted,null,2)+'\n',{flag:'wx'});if(simulateInterrupt)throw Error('simulated interrupted promotion');await rename(temp,final);temp=null;return final}finally{if(temp)await rm(temp,{force:true});if(stage)await rm(stage,{recursive:true,force:true});await lock?.close();if(lock)await rm(lockPath,{force:true})}
}
