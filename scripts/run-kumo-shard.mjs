import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdir,readFile,rm} from 'node:fs/promises';
import {resolve} from 'node:path';
import {run} from '../proof/catalog-browser-proof.mjs';
import {immutableJson} from './lib/kumo-run-layout.mjs';
const arg=n=>process.argv.find(x=>x.startsWith(`--${n}=`))?.slice(n.length+3);
const sleep=n=>new Promise(r=>setTimeout(r,n));
export async function runShard({root=process.cwd(),runId,index,components,tempRoot,summaryPath}){
 if(!runId||!components?.length||!tempRoot||!summaryPath)throw Error('runId, components, tempRoot and summaryPath required');
 root=resolve(root);tempRoot=resolve(tempRoot);summaryPath=resolve(summaryPath);const evidenceRoot=resolve(tempRoot,'evidence'),profileRoot=resolve(tempRoot,'profiles'),portFile=resolve(tempRoot,'server.port');await mkdir(tempRoot,{recursive:true});
 const server=spawn(process.execPath,[resolve(root,'review/server.mjs'),`--root=${root}`,'--port=0',`--port-file=${portFile}`],{cwd:root,stdio:['ignore','pipe','pipe']});let results=[];
 try{let port;for(let n=0;n<200;n++){if(server.exitCode!==null)throw Error(`server exited ${server.exitCode}`);try{port=Number(await readFile(portFile,'utf8'));if(port)break}catch{}await sleep(25)}if(!port)throw Error('server port timeout');
  results=await run({root,ids:components,base:`http://127.0.0.1:${port}`,out:evidenceRoot,summary:resolve(tempRoot,'proof-summary.json'),profileRoot});
  results=await Promise.all(results.map(async r=>{if(r.status!=='passed')return r;const evidence=resolve(r.evidence),body=await readFile(evidence);return {...r,evidence,sha256:createHash('sha256').update(body).digest('hex')}}));
  const status=results.every(x=>x.status==='passed')?'passed':'failed';await immutableJson(summaryPath,{schemaVersion:'kumo.matrix-shard/v1',runId,index,status,components,results});return status==='passed';
 }finally{if(server.exitCode===null){server.kill('SIGTERM');await Promise.race([new Promise(ok=>server.once('exit',ok)),sleep(1000)]);if(server.exitCode===null)server.kill('SIGKILL')}await rm(portFile,{force:true})}
}
if(import.meta.url===`file://${process.argv[1]}`){const ok=await runShard({root:arg('root'),runId:arg('run-id'),index:Number(arg('index')),components:arg('components')?.split(','),tempRoot:arg('temp-root'),summaryPath:arg('summary')});if(!ok)process.exitCode=1}
