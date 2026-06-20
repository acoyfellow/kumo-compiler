import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { FRAMEWORKS, contained, writeImmutable } from '../scripts/upstream/lib.mjs';
import { parseArgs } from '../scripts/upstream-check.mjs';

const ROOT=path.resolve(new URL('..',import.meta.url).pathname);
test('arguments are explicit and scenarios closed',()=>{assert.deepEqual(parseArgs(['--from','2.5.1','--to','2.5.2']),{scenario:'real',from:'2.5.1',to:'2.5.2'});assert.throws(()=>parseArgs(['--from','2.5.1','--to','2.5.2','--scenario','fake']),/unknown scenario/)});
test('target inventory is exactly four frameworks',()=>assert.deepEqual(FRAMEWORKS,['react','solid','svelte','vue']));
test('unsafe containment is rejected',()=>{assert.equal(contained('/safe','/safe/out'),true);assert.equal(contained('/safe','/safe/../escape'),false);assert.equal(contained('/safe','/safe'),false)});
test('immutable receipt collision is rejected',async()=>{const d=await mkdtemp(path.join(tmpdir(),'upstream-collision-')),f=path.join(d,'r.json');try{await writeImmutable(f,'one');await writeImmutable(f,'one');await assert.rejects(writeImmutable(f,'two'),/collision/);}finally{await rm(d,{recursive:true,force:true})}});
test('synthetic export break is deterministic across CWD and leaves tracked tree untouched',{timeout:120000},async t=>{if(process.env.UPSTREAM_INTEGRATION!=='1')return t.skip('set UPSTREAM_INTEGRATION=1 (network)');const a=await mkdtemp(path.join(ROOT,'.upstream-test-a-')),b=await mkdtemp(path.join(ROOT,'.upstream-test-b-')),cwd=await mkdtemp(path.join(tmpdir(),'upstream-cwd-'));const before=execFileSync('git',['status','--porcelain=v1','--untracked-files=no'],{cwd:ROOT,encoding:'utf8'});try{for(const [dir,runCwd] of [[a,ROOT],[b,cwd]]){try{execFileSync(process.execPath,[path.join(ROOT,'scripts/upstream-check.mjs'),'--from','2.5.1','--to','2.5.2','--scenario','synthetic-export-break','--out',dir],{cwd:runCwd,encoding:'utf8'});}catch(e){assert.equal(e.status,2)}}const x=JSON.parse(await readFile(path.join(a,'receipt.json'))),y=JSON.parse(await readFile(path.join(b,'receipt.json')));assert.equal(x.receiptSha256,y.receiptSha256);assert.equal(x.status,'blocked');assert.equal(x.authority.failClosed,true);assert(x.diff.changes.some(c=>c.path.startsWith('exports.')&&c.kind==='removed'));assert.deepEqual(x.targets.map(t=>t.framework),FRAMEWORKS);assert(x.targets.every(t=>['blocked','not-run'].includes(t.status)));assert.equal(execFileSync('git',['status','--porcelain=v1','--untracked-files=no'],{cwd:ROOT,encoding:'utf8'}),before);}finally{await rm(a,{recursive:true,force:true});await rm(b,{recursive:true,force:true});await rm(cwd,{recursive:true,force:true})}});
