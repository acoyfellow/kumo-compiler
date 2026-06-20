import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
test('Axis B inventory fails closed without selecting a winner',()=>{
 const out=JSON.parse(execFileSync(process.execPath,[path.join(root,'scripts/shootout/architectures/inventory.mjs')],{cwd:os.tmpdir(),encoding:'utf8'}));
 assert.equal(out.status,'prepared'); assert.equal(out.execution,'deferred'); assert.equal(out.winner,null); assert.equal(out.candidates.length,4);
});
test('Axis B fan-in is portable, deterministic, exact, and fail closed',()=>{
 const script=path.join(root,'scripts/shootout/architectures/run.mjs');
 const output=path.join(fs.mkdtempSync(path.join(os.tmpdir(),'axis-b-')),'matrix.json');
 const env={...process.env,SHOOTOUT_REVISION:'fixed-test-revision',SHOOTOUT_OUTPUT:output};
 const rootOut=execFileSync(process.execPath,[script],{cwd:root,env,encoding:'utf8'});
 const first=fs.readFileSync(output);
 const externalOut=execFileSync(process.execPath,[script],{cwd:os.tmpdir(),env,encoding:'utf8'});
 const second=fs.readFileSync(output);
 assert.equal(rootOut,externalOut); assert.deepEqual(first,second);
 const out=JSON.parse(rootOut); assert.equal(out.cellCount,32); assert.equal(out.winner,null);
 const matrix=JSON.parse(second); const expectedCandidates=['internal-ts','mitosis','shared-core-native','minimal-hybrid'];
 assert.deepEqual(matrix.dimensions,{candidates:expectedCandidates,components:['Button','Select'],frameworks:['react','solid','svelte','vue']});
 assert.deepEqual(matrix.candidateCellCounts,Object.fromEntries(expectedCandidates.map(x=>[x,8])));
 assert.equal(matrix.receipts.length,32); assert.equal(new Set(matrix.receipts.map(r=>`${r.candidate}/${r.component}/${r.framework}`)).size,32);
 assert.equal(Object.values(matrix.gateCounts).reduce((a,b)=>a+b,0),32*12);
 assert.equal(matrix.weightsApplied,false); assert.equal(matrix.winner,null); assert.equal(matrix.failClosed,true);
 assert.match(matrix.sourceTree,/^sha256:[a-f0-9]{64}$/); assert.equal(matrix.sourceRevision,'fixed-test-revision');
 assert.doesNotMatch(JSON.stringify(matrix),new RegExp(root.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
 for(const receipt of matrix.receipts){
  assert.ok(['mapped','executed','prepared'].includes(receipt.evidenceMode));
  assert.deepEqual(Object.keys(receipt.gates).sort(),['api','behavior','client','consumer','dom-aria','exports','hydration','node-preservation','package','ssr','styles','types'].sort());
  for(const status of Object.values(receipt.gates)) assert.ok(['passed','failed','blocked','not-run'].includes(status));
  assert.equal(receipt.source.digest,receipt.source.exists?'sha256:'+crypto.createHash('sha256').update(fs.readFileSync(path.join(root,receipt.source.path))).digest('hex'):null);
  assert.ok(receipt.ledger && Array.isArray(receipt.ledger.adaptations) && Array.isArray(receipt.ledger.harness));
 }
});
test('hybrid references native Select instead of duplicating views',()=>{
 const text=fs.readFileSync(path.join(root,'candidates/hybrid/src/native/select.ts'),'utf8');
 assert.match(text,/shared-core\/src\/views\/select/); assert.doesNotMatch(text,/dangerouslySetInnerHTML|innerHTML\s*=/);
});
