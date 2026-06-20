import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { ROOT, assertWorkspacePath, parseRollbackArgs, runRollback } from '../scripts/upstream-rollback.mjs';
import { sha } from '../scripts/upstream/lib.mjs';

test('rollback arguments are closed and unsafe paths fail',()=>{
 assert.deepEqual(parseRollbackArgs(['--no-install']),{out:'proof/upstream/drills/rollback-2.5.2',install:false});
 assert.throws(()=>parseRollbackArgs(['--mode','apply']),/unknown argument/);
 assert.throws(()=>assertWorkspacePath('/safe','/escape'),/unsafe workspace path/);
});
test('wrong prior hash fails before mutation',async()=>{await assert.rejects(runRollback({out:'proof/upstream/drills/unused',install:false,expectedPriorSha256:'0'.repeat(64)}),/wrong prior hash/)});
test('rollback drill is isolated and deterministic',{timeout:240000},async()=>{
 const pkg=await readFile(path.join(ROOT,'package.json')),lock=await readFile(path.join(ROOT,'package-lock.json'));
 const a=await runRollback({out:'proof/upstream/drills/rollback-2.5.2',install:false});
 const b=await runRollback({out:'proof/upstream/drills/rollback-2.5.2',install:false});
 assert.deepEqual(a,b);assert.equal(a.validation.mainCheckoutWrites,false);assert.equal(a.validation.restoredByteIdentical,true);assert.equal(a.validation.repeatManifestIdentical,true);assert.equal(a.validation.selectedAuthorityMutated,false);
 assert.equal(sha(await readFile(path.join(ROOT,'package.json'))),sha(pkg));assert.equal(sha(await readFile(path.join(ROOT,'package-lock.json'))),sha(lock));
});
