import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const state=JSON.parse(fs.readFileSync('workflow/terminal-end-state.json','utf8'));

test('terminal end state is explicit, complete, and fail-closed',()=>{
 assert.equal(state.schemaVersion,'kumo.terminal-end-state/v1');
 assert.deepEqual(state.authority.scope,{classified:45,executable:41,upstreamBlocked:['PageHeader','ResourceListPage'],supplemental:['Chart','Flow']});
 assert.equal(state.authority.canonicalPackage,'@cloudflare/kumo@2.5.2');
 assert.equal(state.authority.canonicalBrowserCells,164);
 assert.equal(state.authority.canonicalImmutable,true);
 assert.deepEqual(state.authority.downstreamPackages,[
  '@acoyfellow/kumo-vue@0.0.1',
  '@acoyfellow/kumo-svelte@0.0.1',
  '@acoyfellow/kumo-solid@0.0.1',
 ]);
 assert.deepEqual(Object.keys(state.terminalGates),['contracts','packedConformance','implementationReadiness','docsAndExamples','kitchenSink','release','production','finalReceipt']);
 for(const gate of Object.values(state.terminalGates))assert.ok(gate.required.length>20);
 assert.match(state.executionPolicy.selfSteering,/highest critical-path unblocked task/);
 assert.match(state.executionPolicy.selfHealing,/repair the lowest shared layer/);
 assert.match(state.executionPolicy.stop,/final terminal receipt/);
 assert.ok(state.forbidden.some(item=>item.includes('npm publish')));
});
