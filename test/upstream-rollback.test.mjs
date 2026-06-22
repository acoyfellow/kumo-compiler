import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { ROOT, assertWorkspacePath, parseRollbackArgs, runRollback, sourceTreeDigest } from '../scripts/upstream-rollback.mjs';
import { sha } from '../scripts/upstream/lib.mjs';

const normalized=r=>({...r,source:{...r.source,revision:'metadata'}});
test('rollback arguments are closed and unsafe paths fail',()=>{
 assert.deepEqual(parseRollbackArgs(['--no-install']),{out:'proof/upstream/drills/rollback-2.5.2',install:false});
 assert.throws(()=>parseRollbackArgs(['--mode','apply']),/unknown argument/);
 assert.throws(()=>assertWorkspacePath('/safe','/escape'),/unsafe workspace path/);
});
test('wrong prior hash fails before mutation',async()=>{await assert.rejects(runRollback({out:'proof/upstream/drills/unused',install:false,expectedPriorSha256:'0'.repeat(64)}),/wrong prior hash/)});
test('canonical receipt is immutable and source drift fails closed',async()=>{
 const receipt=JSON.parse(await readFile(path.join(ROOT,'proof/upstream/drills/rollback-2.5.2/receipt.json'))),current=sourceTreeDigest();
 assert.equal(receipt.source.sourceTree,receipt.identity.sourceTree);assert.equal(receipt.validation.npmCi,'passed');
 if(receipt.source.sourceTree!==current){const stale=JSON.parse(await readFile(path.join(ROOT,'proof/upstream/drills/rollback-2.5.2/staleness.json'))),{receiptHash,...body}=stale;assert.equal(stale.status,'blocked');assert.equal(stale.receiptSourceTree,receipt.source.sourceTree);assert.equal(stale.currentSourceTree,current);assert.equal(receiptHash,sha(Buffer.from(JSON.stringify(body))))}else assert.equal(receipt.source.sourceTree,current);
});
test('rollback drill is isolated and deterministic',{timeout:240000},async()=>{
 const pkg=await readFile(path.join(ROOT,'package.json')),lock=await readFile(path.join(ROOT,'package-lock.json')),canonical=await readFile(path.join(ROOT,'proof/upstream/drills/rollback-2.5.2/receipt.json'));
 const temp=await mkdtemp(path.join(ROOT,'.rollback-test-'));
 try {const a=await runRollback({out:path.relative(ROOT,path.join(temp,'a')),install:false});const old=process.cwd();process.chdir(tmpdir());let b;try{b=await runRollback({out:path.relative(ROOT,path.join(temp,'b')),install:false})}finally{process.chdir(old)}
  assert.deepEqual(normalized(a),normalized(b));assert.equal(a.validation.mainCheckoutWrites,false);assert.equal(a.validation.restoredByteIdentical,true);assert.equal(a.validation.repeatManifestIdentical,true);assert.equal(a.validation.selectedAuthorityMutated,false);
  assert.equal(sha(await readFile(path.join(ROOT,'package.json'))),sha(pkg));assert.equal(sha(await readFile(path.join(ROOT,'package-lock.json'))),sha(lock));assert.deepEqual(await readFile(path.join(ROOT,'proof/upstream/drills/rollback-2.5.2/receipt.json')),canonical);
 }finally{await rm(temp,{recursive:true,force:true})}
});
