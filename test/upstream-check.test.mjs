import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { FRAMEWORKS, contained, writeImmutable, sha, stable } from '../scripts/upstream/lib.mjs';
import { parseArgs } from '../scripts/upstream-check.mjs';

const ROOT=path.resolve(new URL('..',import.meta.url).pathname);
test('arguments are explicit and scenarios closed',()=>{assert.deepEqual(parseArgs(['--from','2.5.1','--to','2.5.2']),{scenario:'real',calibrationComponent:'button',from:'2.5.1',to:'2.5.2'});assert.equal(parseArgs(['--from','1','--to','2','--calibration-component','select']).calibrationComponent,'select');assert.throws(()=>parseArgs(['--from','2.5.1','--to','2.5.2','--scenario','fake']),/unknown scenario/)});
test('target inventory is exactly four frameworks',()=>assert.deepEqual(FRAMEWORKS,['react','solid','svelte','vue']));
test('unsafe containment is rejected',()=>{assert.equal(contained('/safe','/safe/out'),true);assert.equal(contained('/safe','/safe/../escape'),false);assert.equal(contained('/safe','/safe'),false)});
test('immutable receipt collision is rejected',async()=>{const d=await mkdtemp(path.join(tmpdir(),'upstream-collision-')),f=path.join(d,'r.json');try{await writeImmutable(f,'one');await writeImmutable(f,'one');await assert.rejects(writeImmutable(f,'two'),/collision/)}finally{await rm(d,{recursive:true,force:true})}});
test('network drills are deterministic across CWD and content validated',{timeout:240000},async t=>{
 if(process.env.UPSTREAM_INTEGRATION!=='1')return t.skip('set UPSTREAM_INTEGRATION=1 (network)');
 const cwd=await mkdtemp(path.join(tmpdir(),'upstream-cwd-')),before=execFileSync('git',['status','--porcelain=v1','--untracked-files=no'],{cwd:ROOT,encoding:'utf8'});
 try {
  for(const scenario of ['real','synthetic-export-break']){
   const a=await mkdtemp(path.join(ROOT,'.upstream-test-a-')),b=await mkdtemp(path.join(ROOT,'.upstream-test-b-'));
   try {
    for(const [dir,runCwd] of [[a,ROOT],[b,cwd]])try{execFileSync(process.execPath,[path.join(ROOT,'scripts/upstream-check.mjs'),'--from','2.5.1','--to','2.5.2','--scenario',scenario,'--out',dir],{cwd:runCwd,encoding:'utf8'})}catch(e){assert.equal(e.status,2)}
    const x=JSON.parse(await readFile(path.join(a,'receipt.json'))),y=JSON.parse(await readFile(path.join(b,'receipt.json')));
    assert.deepEqual(x,y);assert.match(x.source.sourceTree,/^[a-f0-9]{64}$/);assert.equal(x.receiptSha256,sha(stable(Object.fromEntries(Object.entries(x).filter(([k])=>k!=='receiptSha256')))));assert.equal(x.authority.selectedAuthorityMutated,false);assert.equal(x.generation.componentId,'button');assert.equal(x.generation.cells.length,4);assert(!JSON.stringify(x).includes('/tmp/'));
    if(scenario==='synthetic-export-break'){assert.equal(x.status,'blocked');assert(x.diff.changes.some(c=>c.path.startsWith('exports.')&&c.kind==='removed'))}
   } finally {await rm(a,{recursive:true,force:true});await rm(b,{recursive:true,force:true})}
  }
  assert.equal(execFileSync('git',['status','--porcelain=v1','--untracked-files=no'],{cwd:ROOT,encoding:'utf8'}),before);
 } finally {await rm(cwd,{recursive:true,force:true})}
});
