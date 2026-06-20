import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const receipts=JSON.parse(fs.readFileSync(new URL('../candidates/shared-core/proof/select/receipts.json',import.meta.url)));
const summary=JSON.parse(fs.readFileSync(new URL('../candidates/shared-core/proof/select/summary.json',import.meta.url)));
const vocabulary=new Set(['passed','failed','blocked','not-run']);
const mandatory=['client-build','pointer-open-select','keyboard-arrow-home-end-page-enter-space-escape-tab','typeahead','disabled-options','controlled-uncontrolled-value-open','callback-event-ordering','dom-aria','ssr','hydration','console-network','server-node-preservation','focus-scroll'];

test('native Select evidence is revision/run/candidate bound',()=>{
 assert.equal(receipts.candidate,'shared-core-native-select');assert.equal(receipts.component,'Select');
 assert.equal(receipts.runId,'ter_20260620195237367_ru53g4');assert.match(receipts.revisions.kumo,/^[0-9a-f]{40}$/);assert.equal(receipts.revisions.kumo,receipts.revisions.candidate);
 assert.equal(receipts.dependencyRoot,'/Users/jcoeyman/cloudflare/kumo-compiler/node_modules');
 assert.match(receipts.evidenceDigest,/^sha256:[a-f0-9]{64}$/);assert.deepEqual(Object.keys(receipts.targets).sort(),['react','solid','svelte','vue']);
});

test('receipts reject missing and optimistic gates',()=>{
 for(const [framework,target] of Object.entries(receipts.targets)){
  assert.equal(target.framework,framework);assert.equal(target.component,'Select');assert.equal(target.candidate,receipts.candidate);assert.equal(target.runId,receipts.runId);assert.deepEqual(target.revisions,receipts.revisions);
  assert.ok(target.adapter.files.length);assert.ok(target.adapter.loc>0);assert.match(target.evidenceDigest,/^sha256:[a-f0-9]{64}$/);
  for(const gate of mandatory){assert.ok(Object.hasOwn(target.gates,gate),`${framework}: missing ${gate}`);assert.ok(vocabulary.has(target.gates[gate]),`${framework}: invalid ${gate}`)}
  if(mandatory.some(g=>target.gates[g]!=='passed'))assert.notEqual(target.status,'passed',`${framework}: optimistic target status`);
 }
});

test('summary is fail closed',()=>{
 const values=Object.values(receipts.targets).flatMap(target=>Object.values(target.gates));
 assert.equal(summary.failClosed,true);assert.equal(summary.verdict,values.includes('failed')?'failed':values.some(x=>x!=='passed')?'blocked':'passed');
 assert.equal(Object.values(summary.gateCounts).reduce((a,b)=>a+b,0),values.length);
});
