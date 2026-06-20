import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const file=new URL('../candidates/mitosis/receipts/hard-components.json',import.meta.url);
const receipt=JSON.parse(fs.readFileSync(file));
const statuses=new Set(['passed','failed','not-run','blocked']);
test('hard-component receipts are revision/run bound and never optimistic',()=>{
 assert.equal(receipt.runId,'ter_20260620192638995_ptsm10');
 assert.match(receipt.revisions.kumo,/^[0-9a-f]{40}$/);assert.equal(receipt.revisions.kumo,receipt.revisions.candidate);
 assert.equal(receipt.generatedFilesEdited,false);assert.equal(Object.keys(receipt.targets).length,8);
 for(const target of Object.values(receipt.targets)){
  assert.equal(target.runId,receipt.runId);assert.deepEqual(target.revisions,receipt.revisions);
  for(const gate of Object.values(target.gates))assert.ok(statuses.has(gate));
  assert.equal(target.gates.build,'passed');assert.equal(target.gates.ssr,'passed');assert.equal(target.gates.nodePreservation,'passed');
  assert.equal(target.status,'failed');assert.ok(target.adaptation.loc>0);assert.equal(target.adaptation.nativeWrapperLoc,0);
  assert.ok(target.diagnostics.length);assert.notEqual(target.gates.types,'passed');assert.notEqual(target.gates.styles,'passed');assert.notEqual(target.gates.package,'passed');
  if(target.component==='Select')assert.equal(target.gates.domAria,'failed');
  if(target.component==='Dialog')assert.equal(target.gates.behavior,'failed');
 }
});
