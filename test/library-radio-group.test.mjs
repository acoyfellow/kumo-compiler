import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {deriveRadioGroup, validateRadioGroup, loadRadioGroup, RADIO_GROUP_COMPONENTS} from '../src/kumo/library/radio-group.mjs';

const contractDir = path.resolve('contracts/kumo.observable/v1/components');
const contracts = RADIO_GROUP_COMPONENTS.map(name => JSON.parse(fs.readFileSync(path.join(contractDir, `${name}.json`), 'utf8')));

test('radio group derives supported single-select behavior and is stable twice', () => {
  const a = deriveRadioGroup(contracts);
  const b = deriveRadioGroup(contracts);
  assert.equal(a.capabilityDigest, b.capabilityDigest);
  assert.deepEqual(loadRadioGroup(), a);
  assert.equal(a.support, 'supported');
});

test('root is div[role=radiogroup] with click + ArrowDown selection, value event, root focus', () => {
  const v = loadRadioGroup();
  assert.equal(v.root.tag, 'div');
  assert.equal(v.root.attributes.role, 'radiogroup');
  assert.equal(v.selection.mode, 'single');
  assert.equal(v.selection.controlledProp, 'value');
  assert.equal(v.selection.event, 'value:<value>');
  assert.equal(v.selection.focus, 'root');
  assert.deepEqual(v.selection.triggers.map(t => t.type), ['click', 'key']);
});

test('disabled item and disabled group block selection', () => {
  const v = loadRadioGroup();
  assert.match(v.disabled.item, /blocks selection/);
  assert.match(v.disabled.group, /blocks all selection/);
});

test('roving-tabindex order and item structure remain explicit unknowns', () => {
  const fields = loadRadioGroup().unknowns.map(u => u.field).sort();
  assert.deepEqual(fields, ['itemAccessibleStructure', 'rovingTabindexOrder']);
});

test('validator fails closed for support downgrade and digest mutation', () => {
  const downgrade = structuredClone(loadRadioGroup());
  downgrade.support = 'requirements-only';
  assert.throws(() => validateRadioGroup(downgrade));
  const mutated = structuredClone(loadRadioGroup());
  mutated.selection.event = 'changed';
  assert.throws(() => validateRadioGroup(mutated));
  const digestMutated = structuredClone(loadRadioGroup());
  digestMutated.capabilityDigest = 'x'.repeat(64);
  assert.throws(() => validateRadioGroup(digestMutated));
});
