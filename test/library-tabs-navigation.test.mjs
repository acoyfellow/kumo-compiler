import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {deriveTabsNavigation, validateTabsNavigation, loadTabsNavigation, TABS_NAVIGATION_COMPONENTS} from '../src/kumo/library/tabs-navigation.mjs';

const contractDir = path.resolve('contracts/kumo.observable/v1/components');
const contracts = TABS_NAVIGATION_COMPONENTS.map(name => JSON.parse(fs.readFileSync(path.join(contractDir, `${name}.json`), 'utf8')));

test('tabs navigation derives supported roving behavior and is stable twice', () => {
  const a = deriveTabsNavigation(contracts);
  const b = deriveTabsNavigation(contracts);
  assert.equal(a.capabilityDigest, b.capabilityDigest);
  assert.deepEqual(loadTabsNavigation(), a);
  assert.equal(a.support, 'supported');
});

test('div root, role=tab with aria-selected, manual default and automatic activateOnFocus', () => {
  const v = loadTabsNavigation();
  assert.equal(v.root.tag, 'div');
  assert.equal(v.tab.role, 'tab');
  assert.equal(v.tab.selectedAttribute, 'aria-selected');
  assert.equal(v.activation.manual.default, true);
  assert.equal(v.activation.automatic.prop, 'activateOnFocus');
  assert.equal(v.selection.controlledProp, 'selectedValue');
  assert.equal(v.selection.event, 'value:<value>');
  assert.equal(v.selection.focus, 'selected tab');
});

test('variant styling and Home/End wraparound remain explicit unknowns', () => {
  const fields = loadTabsNavigation().unknowns.map(u => u.field).sort();
  assert.deepEqual(fields, ['homeEndWraparound', 'variantSizeStyling']);
});

test('validator fails closed for support downgrade and digest mutation', () => {
  const downgrade = structuredClone(loadTabsNavigation());
  downgrade.support = 'requirements-only';
  assert.throws(() => validateTabsNavigation(downgrade));
  const mutated = structuredClone(loadTabsNavigation());
  mutated.selection.event = 'changed';
  assert.throws(() => validateTabsNavigation(mutated));
  const digestMutated = structuredClone(loadTabsNavigation());
  digestMutated.capabilityDigest = 'x'.repeat(64);
  assert.throws(() => validateTabsNavigation(digestMutated));
});
