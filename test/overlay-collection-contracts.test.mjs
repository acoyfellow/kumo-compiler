import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateContract,verifyCanonical} from '../scripts/observable-contracts.mjs';
import {runCanonicalVectors} from '../scripts/observable-runner.mjs';

const ids=['dropdown-menu','menu-bar','popover','select'];
const contracts=ids.map(id=>validateContract(JSON.parse(fs.readFileSync(`contracts/kumo.observable/v1/components/${id}.json`,'utf8'))));

test('overlay and collection contracts are provenance-bound and browser-receipted',()=>{
  contracts.forEach(verifyCanonical);
  const report=JSON.parse(fs.readFileSync('proof/observable-contracts/canonical.json','utf8'));
  for(const contract of contracts){
    assert(contract.vectors.some(vector=>!vector.actions?.length),`${contract.component} needs action-free SSR evidence`);
    for(const vector of contract.vectors){const cell=report.cells.find(cell=>cell.component===contract.component&&cell.vector===vector.id);assert.equal(cell?.status,'passed',`${contract.component}/${vector.id}`)}
  }
  const select=contracts.find(contract=>contract.component==='select');
  assert(select.unknowns.some(unknown=>unknown.field==='existingSelectPilot.svelte'&&/failed pointer/.test(unknown.reason)));
  assert(select.unknowns.some(unknown=>unknown.field==='existingSelectPilot.solid'&&/hydration/.test(unknown.reason)));
});

test('action-free canonical SSR vectors execute without pretending browser vectors passed',async()=>{
  const ssrOnly=contracts.map(contract=>({...contract,vectors:contract.vectors.filter(vector=>!vector.actions?.length)}));
  const results=await runCanonicalVectors(ssrOnly);
  assert.deepEqual(results.map(result=>`${result.component}/${result.id}`),[
    'dropdown-menu/closed-trigger-ssr',
    'menu-bar/empty-nav-ssr',
    'popover/closed-trigger-ssr',
    'select/closed-placeholder-ssr'
  ]);
});
