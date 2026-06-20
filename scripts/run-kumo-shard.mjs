import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {cp,mkdir,readFile,rm,symlink} from 'node:fs/promises';
import {relative,resolve} from 'node:path';
import {run} from '../proof/catalog-browser-proof.mjs';
import {immutableJson} from './lib/kumo-run-layout.mjs';
import {buildStagedComponent} from './lib/kumo-shard-builders.mjs';
const arg=n=>process.argv.find(x=>x.startsWith(`--${n}=`))?.slice(n.length+3);
const sleep=n=>new Promise(r=>setTimeout(r,n));
export const commandRunner=({command,args,cwd,env})=>new Promise((ok,no)=>{const p=spawn(command,args,{cwd,env,stdio:'inherit'});p.once('error',no);p.once('exit',code=>code?no(Error(`${command} ${args.join(' ')} exited ${code}`)):ok())});
export async function runShard({root=process.cwd(),runId,index,framework,components,tempRoot,summaryPath,runCommand=commandRunner,proofRunner=run,spawnServer=(command,args,options)=>spawn(command,args,options)}){
 if(!runId||!framework||!components?.length||!tempRoot||!summaryPath)throw Error('runId, framework, components, tempRoot and summaryPath required');
 root=resolve(root);tempRoot=resolve(tempRoot);summaryPath=resolve(summaryPath);const stage=resolve(tempRoot,'stage'),runtimeRoot=resolve(stage,'runtime'),canonicalRoot=resolve(stage,'runtime-canonical'),evidenceRoot=resolve(tempRoot,'evidence'),profileRoot=resolve(tempRoot,'profiles'),portFile=resolve(tempRoot,'server.port');
 await mkdir(stage,{recursive:true});for(const name of ['package.json','package-lock.json','deploy-manifest.json'])await cp(resolve(root,name),resolve(stage,name));for(const name of ['audit','proof','review','runtime-routes.mjs','public'])await cp(resolve(root,name),resolve(stage,name),{recursive:true});await symlink(resolve(root,'node_modules'),resolve(stage,'node_modules'),'dir');
 const outputRoots=[];
 for(const component of components){const canonical=framework==='react',source=resolve(root,canonical?'runtime-canonical':'runtime',component,...(canonical?[]:[framework])),dest=resolve(stage,canonical?'runtime-canonical':'runtime',component,...(canonical?[]:[framework]));await cp(source,dest,{recursive:true,filter:p=>!p.split('/').includes('public-runtime')&&!p.split('/').includes('server-runtime')});const out=resolve(dest,'public-runtime');outputRoots.push(relative(tempRoot,out));await buildStagedComponent({root,dir:dest,out,framework,component,runCommand})}
 const server=spawnServer(process.execPath,[resolve(stage,'review/server.mjs'),`--root=${stage}`,'--port=0',`--port-file=${portFile}`],{cwd:stage,env:{...process.env,KUMO_RUNTIME_ROOT:runtimeRoot,KUMO_CANONICAL_RUNTIME_ROOT:canonicalRoot},stdio:['ignore','pipe','pipe']});let results=[];
 try{let port;for(let n=0;n<200;n++){if(server.exitCode!==null)throw Error(`server exited ${server.exitCode}`);try{port=Number(await readFile(portFile,'utf8'));if(port)break}catch{}await sleep(25)}if(!port)throw Error('server port timeout');results=await proofRunner({root:stage,frameworks:[framework],ids:components,base:`http://127.0.0.1:${port}`,out:evidenceRoot,summary:resolve(tempRoot,'proof-summary.json'),profileRoot});results=await Promise.all(results.map(async r=>{if(r.status!=='passed')return r;const evidence=resolve(r.evidence),body=await readFile(evidence);return {...r,evidence:relative(tempRoot,evidence),sha256:createHash('sha256').update(body).digest('hex'),browser:JSON.parse(body).browser}}));const status=results.length===components.length&&results.every(x=>x.status==='passed'&&x.framework===framework)?'passed':'failed';await immutableJson(summaryPath,{schemaVersion:'kumo.matrix-shard/v1',runId,index,framework,status,components,outputRoots,results});return status==='passed';
 }finally{if(server.exitCode===null){server.kill('SIGTERM');await Promise.race([new Promise(ok=>server.once('exit',ok)),sleep(1000)]);if(server.exitCode===null)server.kill('SIGKILL')}await rm(portFile,{force:true})}
}
if(import.meta.url===`file://${process.argv[1]}`){const ok=await runShard({root:arg('root'),runId:arg('run-id'),index:Number(arg('index')),framework:arg('framework'),components:arg('components')?.split(','),tempRoot:arg('temp-root'),summaryPath:arg('summary')});if(!ok)process.exitCode=1}
