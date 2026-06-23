import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {deriveSemanticRender,validateSemanticRender} from '../src/kumo/library/semantic-render.mjs';

const capability=JSON.parse(fs.readFileSync('src/kumo/library/capabilities/semantic-render.json','utf8'));
test('semantic inventory is exactly all non-browser contract vectors',()=>{
  const derived=deriveSemanticRender('contracts/kumo.observable/v1/components');
  assert.deepEqual(capability,derived);
  assert.equal(capability.components.flatMap(x=>x.vectors).length,66);
});
test('every semantic vector is represented by a passing packed Solid receipt cell',()=>{
  const receipt=JSON.parse(fs.readFileSync('proof/dx/conformance/solid/receipt.json','utf8'));
  const cells=new Map(receipt.cells.map(cell=>[`${cell.component}#${cell.vector}`,cell]));
  for(const component of capability.components)for(const vector of component.vectors){const cell=cells.get(`${component.component}#${vector.id}`);assert.ok(cell,`${component.component}#${vector.id}`);assert.equal(cell.status,'passed',`${component.component}#${vector.id}`)}
  assert.equal(receipt.cells.filter(cell=>cell.status==='failed'&&/^(?:root|descendant)/.test(cell.reason??'')).length,0);
});
test('generation is deterministic',()=>{
  assert.deepEqual(deriveSemanticRender('contracts/kumo.observable/v1/components'),deriveSemanticRender('contracts/kumo.observable/v1/components'));
});
test('contradictions and unknown selectors fail closed',()=>{
  const bad=structuredClone(capability), c=bad.components[0];
  c.vectors.push({...structuredClone(c.vectors[0]),id:'contradiction'});
  c.vectors.at(-1).nodes[0].require.tag='impossible';
  assert.throws(()=>validateSemanticRender(bad),/contradictory/);
  const selector=structuredClone(capability); selector.components[0].vectors[0].nodes.push({selector:'div span',require:{count:1}});
  assert.throws(()=>validateSemanticRender(selector),/unknown selector/);
});
test('capability contains no framework or source strings',()=>{
  assert.doesNotMatch(JSON.stringify(capability),/React|Vue|Svelte|Solid|<\/?[a-z]/i);
});
