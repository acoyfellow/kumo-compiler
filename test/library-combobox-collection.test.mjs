import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {deriveComboboxCollection, validateComboboxCollection, loadComboboxCollection, COMBOBOX_COLLECTION_COMPONENTS} from '../src/kumo/library/combobox-collection.mjs';

const contractDir = path.resolve('contracts/kumo.observable/v1/components');
const contracts = COMBOBOX_COLLECTION_COMPONENTS.map(name => JSON.parse(fs.readFileSync(path.join(contractDir, `${name}.json`), 'utf8')));

test('combobox collection derives supported behavior and is stable twice', () => {
  const a = deriveComboboxCollection(contracts);
  const b = deriveComboboxCollection(contracts);
  assert.equal(a.capabilityDigest, b.capabilityDigest);
  assert.deepEqual(loadComboboxCollection(), a);
  assert.equal(a.support, 'supported');
});

test('input root, compound api, open/navigate/select model, focus retained', () => {
  const v = loadComboboxCollection();
  assert.equal(v.root.tag, 'input');
  assert.ok(v.api.compound.includes('.TriggerInput') && v.api.compound.includes('.Item'));
  assert.equal(v.open.event, 'open:<bool>');
  assert.equal(v.navigate.key, 'ArrowDown');
  assert.equal(v.select.event, 'value:<item>');
  assert.equal(v.select.closesList, true);
  assert.equal(v.focus.retains, 'input');
});

test('input root derived from canonical vector', () => {
  assert.equal(contracts[0].vectors.find(x => x.id === 'single-select').expected.root.tag, 'input');
});

test('generated ids and multiple-chip dom remain explicit unknowns', () => {
  assert.deepEqual(loadComboboxCollection().unknowns.map(u => u.field).sort(), ['generatedIds', 'multipleChipDom']);
});

test('validator fails closed for support downgrade, select mutation, and digest mutation', () => {
  const downgrade = structuredClone(loadComboboxCollection());
  downgrade.support = 'requirements-only';
  assert.throws(() => validateComboboxCollection(downgrade));
  const mutated = structuredClone(loadComboboxCollection());
  mutated.select.event = 'changed';
  assert.throws(() => validateComboboxCollection(mutated));
  const digestMutated = structuredClone(loadComboboxCollection());
  digestMutated.capabilityDigest = 'x'.repeat(64);
  assert.throws(() => validateComboboxCollection(digestMutated));
});
