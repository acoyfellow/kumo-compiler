import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {deriveInputGroupComposition, validateInputGroupComposition, loadInputGroupComposition, INPUT_GROUP_COMPOSITION_COMPONENTS} from '../src/kumo/library/input-group-composition.mjs';

const contractDir = path.resolve('contracts/kumo.observable/v1/components');
const contracts = INPUT_GROUP_COMPOSITION_COMPONENTS.map(name => JSON.parse(fs.readFileSync(path.join(contractDir, `${name}.json`), 'utf8')));

test('input-group composition derives supported behavior and is stable twice', () => {
  const a = deriveInputGroupComposition(contracts);
  const b = deriveInputGroupComposition(contracts);
  assert.equal(a.capabilityDigest, b.capabilityDigest);
  assert.deepEqual(loadInputGroupComposition(), a);
  assert.equal(a.support, 'supported');
});

test('div root, slots, label association, value tracking, focus targets', () => {
  const v = loadInputGroupComposition();
  assert.equal(v.root.tag, 'div');
  assert.ok(v.slots.includes('.Addon') && v.slots.includes('.Input') && v.slots.includes('.Button') && v.slots.includes('.Suffix'));
  assert.equal(v.label.click, 'focuses the grouped input');
  assert.deepEqual(v.focus.targets, ['input', 'button']);
});

test('root div is derived from every canonical vector', () => {
  for (const vec of contracts[0].vectors) assert.equal(vec.expected.root.tag, 'div');
});

test('inherited vendor behavior remains an explicit unknown', () => {
  assert.deepEqual(loadInputGroupComposition().unknowns.map(u => u.field), ['inheritedVendorBehavior']);
});

test('validator fails closed for support downgrade, label mutation, and digest mutation', () => {
  const downgrade = structuredClone(loadInputGroupComposition());
  downgrade.support = 'requirements-only';
  assert.throws(() => validateInputGroupComposition(downgrade));
  const mutated = structuredClone(loadInputGroupComposition());
  mutated.label.click = 'changed';
  assert.throws(() => validateInputGroupComposition(mutated));
  const digestMutated = structuredClone(loadInputGroupComposition());
  digestMutated.capabilityDigest = 'x'.repeat(64);
  assert.throws(() => validateInputGroupComposition(digestMutated));
});
