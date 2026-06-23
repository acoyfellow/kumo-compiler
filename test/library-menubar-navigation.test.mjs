import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {deriveMenubarNavigation, validateMenubarNavigation, loadMenubarNavigation, MENUBAR_NAVIGATION_COMPONENTS} from '../src/kumo/library/menubar-navigation.mjs';

const contractDir = path.resolve('contracts/kumo.observable/v1/components');
const contracts = MENUBAR_NAVIGATION_COMPONENTS.map(name => JSON.parse(fs.readFileSync(path.join(contractDir, `${name}.json`), 'utf8')));

test('menubar navigation derives supported behavior and is stable twice', () => {
  const a = deriveMenubarNavigation(contracts);
  const b = deriveMenubarNavigation(contracts);
  assert.equal(a.capabilityDigest, b.capabilityDigest);
  assert.deepEqual(loadMenubarNavigation(), a);
  assert.equal(a.support, 'supported');
});

test('root is nav with canonical contract-derived classes; buttons tabbable, no aria selection', () => {
  const v = loadMenubarNavigation();
  assert.equal(v.root.tag, 'nav');
  assert.ok(v.root.classes.includes('isolate') && v.root.classes.includes('flex'));
  assert.equal(v.options.button.tabbable, 'native');
  assert.equal(v.options.button.ariaSelection, 'absent');
  assert.deepEqual(v.navigation.keys, ['ArrowLeft', 'ArrowRight']);
  assert.equal(v.activation.event, 'click:<index>');
});

test('classes are derived from the canonical contract, not hand-authored', () => {
  const contract = contracts[0];
  const canonical = contract.vectors.find(x => x.id === 'empty-nav-ssr').expected.root.classes.includes;
  assert.deepEqual(loadMenubarNavigation().root.classes, canonical);
});

test('icon glyph and tooltip presentation remain explicit unknowns', () => {
  const fields = loadMenubarNavigation().unknowns.map(u => u.field).sort();
  assert.deepEqual(fields, ['iconGlyphRendering', 'tooltipPresentation']);
});

test('validator fails closed for support downgrade and digest mutation', () => {
  const downgrade = structuredClone(loadMenubarNavigation());
  downgrade.support = 'requirements-only';
  assert.throws(() => validateMenubarNavigation(downgrade));
  const mutated = structuredClone(loadMenubarNavigation());
  mutated.activation.event = 'changed';
  assert.throws(() => validateMenubarNavigation(mutated));
  const digestMutated = structuredClone(loadMenubarNavigation());
  digestMutated.capabilityDigest = 'x'.repeat(64);
  assert.throws(() => validateMenubarNavigation(digestMutated));
});
