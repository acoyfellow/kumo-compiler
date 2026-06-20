import {spawn} from 'node:child_process';
import {availableParallelism,tmpdir} from 'node:os';
import {mkdir,mkdtemp,rm} from 'node:fs/promises';
import {resolve} from 'node:path';
import {planShards,promoteAtomic,validateAndFanIn,immutableJson} from './lib/kumo-run-layout.mjs';
const arg=n=>process.argv.find(x=>x.startsWith(`--${n}=`))?.slice(n.length+3);
const runId=arg('run-id')||`${new Date().toISOString().replace(/[:.]/g,'-')}-${process.pid}`;
const root=resolve(arg('root')||process.cwd()),authorityRoot=resolve(arg('authority')||resolve(root,'generated/browser-evidence')),workspace=await mkdtemp(resolve(arg('temp-root')||tmpdir(),`kumo-matrix-${runId}-`));
const groups=planShards(),limit=Number(arg('concurrency')||Math.min(4,Math.max(2,Math.floor(availableParallelism()/2))));let next=0,failed;
const children=new Set(),files=[];const launch=async()=>{while(!failed&&next<groups.length){const g=groups[next++],dir=resolve(workspace,`shard-${g.index}`),summary=resolve(dir,'summary.json');await mkdir(dir,{recursive:true});files.push(summary);const child=spawn(process.execPath,[resolve(root,'scripts/run-kumo-shard.mjs'),`--root=${root}`,`--run-id=${runId}`,`--index=${g.index}`,`--framework=${g.framework}`,`--components=${g.components.join(',')}`,`--temp-root=${dir}`,`--summary=${summary}`],{cwd:root,stdio:'inherit'});children.add(child);const code=await new Promise(ok=>child.once('exit',ok));children.delete(child);if(code)failed=Error(`shard ${g.index} failed (${code})`)}};
try{await Promise.all(Array.from({length:Math.min(limit,groups.length)},launch));if(failed)throw failed;const summary=await validateAndFanIn({runId,shardFiles:files,evidenceRoot:workspace});await immutableJson(resolve(workspace,'matrix-summary.json'),summary);await promoteAtomic({summary,authorityRoot,evidenceRoot:workspace});console.log(`kumo matrix passed: ${summary.targetCount} targets, run ${runId}`)}catch(e){failed=e;for(const c of children)c.kill('SIGTERM');throw e}finally{if(!arg('keep-temp'))await rm(workspace,{recursive:true,force:true})}
