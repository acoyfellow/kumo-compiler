import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
test('Axis B inventory fails closed without selecting a winner',()=>{
 const out=JSON.parse(execFileSync(process.execPath,['scripts/shootout/architectures/inventory.mjs'],{encoding:'utf8'}));
 assert.equal(out.status,'prepared'); assert.equal(out.execution,'deferred'); assert.equal(out.winner,null); assert.equal(out.candidates.length,4);
});
test('Axis B fan-in emits exactly one fail-closed receipt per matrix cell',()=>{
 const out=JSON.parse(execFileSync(process.execPath,['scripts/shootout/architectures/run.mjs'],{encoding:'utf8'}));
 assert.equal(out.cellCount,32); assert.equal(out.winner,null);
 const matrix=JSON.parse(fs.readFileSync('proof/shootout/architectures/matrix.json','utf8'));
 assert.equal(matrix.receipts.length,32); assert.equal(new Set(matrix.receipts.map(r=>`${r.candidate}/${r.component}/${r.framework}`)).size,32);
 assert.equal(matrix.weightsApplied,false); assert.equal(matrix.failClosed,true);
 for(const receipt of matrix.receipts){
  assert.equal(receipt.contract,'shootout/v1'); assert.ok(receipt.runId); assert.ok(receipt.evidenceDigest);
  assert.deepEqual(Object.keys(receipt.gates).sort(),['api','behavior','client','consumer','dom-aria','exports','hydration','node-preservation','package','ssr','styles','types'].sort());
  assert.ok(receipt.source.path); assert.ok(receipt.environment); assert.ok(receipt.ledger);
 }
});
test('hybrid references native Select instead of duplicating views',()=>{
 const text=fs.readFileSync('candidates/hybrid/src/native/select.ts','utf8');
 assert.match(text,/shared-core\/src\/views\/select/); assert.doesNotMatch(text,/dangerouslySetInnerHTML|innerHTML\s*=/);
});
