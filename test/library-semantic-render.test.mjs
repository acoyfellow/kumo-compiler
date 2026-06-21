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
test('current semantic failure families are represented',()=>{
  const receipt=JSON.parse(fs.readFileSync('proof/dx/conformance/solid/receipt.json','utf8'));
  const failures=receipt.cells.filter(x=>x.status==='failed'&&/^(?:root|descendant)/.test(x.reason));
  const ids=new Set(capability.components.flatMap(c=>c.vectors.map(v=>`${c.component}#${v.id}`)));
  assert.ok(failures.length>=52);
  for(const failure of failures) assert.ok(ids.has(`${failure.component}#${failure.vector}`));
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
