import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {deriveAutocompleteCollection, validateAutocompleteCollection, loadAutocompleteCollection, AUTOCOMPLETE_COLLECTION_COMPONENTS} from '../src/kumo/library/autocomplete-collection.mjs';

const contractDir = path.resolve('contracts/kumo.observable/v1/components');
const contracts = AUTOCOMPLETE_COLLECTION_COMPONENTS.map(name => JSON.parse(fs.readFileSync(path.join(contractDir, `${name}.json`), 'utf8')));

test('autocomplete collection derives supported behavior and is stable twice', () => {
  const a = deriveAutocompleteCollection(contracts);
  const b = deriveAutocompleteCollection(contracts);
  assert.equal(a.capabilityDigest, b.capabilityDigest);
  assert.deepEqual(loadAutocompleteCollection(), a);
  assert.equal(a.support, 'supported');
});

test('input root, type emits value events opening on first char, ArrowDown navigate, Enter select+close, focus retained', () => {
  const v = loadAutocompleteCollection();
  assert.equal(v.root.tag, 'input');
  assert.equal(v.type.event, 'value:<input>');
  assert.equal(v.type.opensOnFirstChar, true);
  assert.equal(v.navigate.key, 'ArrowDown');
  assert.equal(v.select.event, 'value:<item>');
  assert.equal(v.select.closesList, true);
  assert.equal(v.focus.retains, 'input');
});

test('input root derived from canonical vector', () => {
  assert.equal(contracts[0].vectors.find(x => x.id === 'filter-and-select').expected.root.tag, 'input');
});

test('portal container, ssr popup, default filtering remain explicit unknowns', () => {
  assert.deepEqual(loadAutocompleteCollection().unknowns.map(u => u.field).sort(), ['defaultFiltering', 'portal.container', 'ssr.popup']);
});

test('validator fails closed for support downgrade, type mutation, and digest mutation', () => {
  const downgrade = structuredClone(loadAutocompleteCollection());
  downgrade.support = 'requirements-only';
  assert.throws(() => validateAutocompleteCollection(downgrade));
  const mutated = structuredClone(loadAutocompleteCollection());
  mutated.type.event = 'changed';
  assert.throws(() => validateAutocompleteCollection(mutated));
  const digestMutated = structuredClone(loadAutocompleteCollection());
  digestMutated.capabilityDigest = 'x'.repeat(64);
  assert.throws(() => validateAutocompleteCollection(digestMutated));
});
