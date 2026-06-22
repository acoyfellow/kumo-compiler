import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {deriveFieldComposition, validateFieldComposition, loadFieldComposition, FIELD_COMPOSITION_COMPONENTS} from '../src/kumo/library/field-composition.mjs';

const contractDir = path.resolve('contracts/kumo.observable/v1/components');
const contracts = FIELD_COMPOSITION_COMPONENTS.map(name => JSON.parse(fs.readFileSync(path.join(contractDir, `${name}.json`), 'utf8')));

test('field composition derives the canonical label-focus behavior and is stable twice', () => {
  const a = deriveFieldComposition(contracts);
  const b = deriveFieldComposition(contracts);
  assert.equal(a.capabilityDigest, b.capabilityDigest);
  assert.deepEqual(loadFieldComposition(), a);
  assert.equal(a.support, 'supported');
  assert.deepEqual(a.controls.map(c => c.component), ['field', 'input', 'input-area']);
});

test('every control proves a container div with trusted label-click focus to its native control', () => {
  const value = loadFieldComposition();
  const roots = Object.fromEntries(value.controls.map(c => [c.component, c.control]));
  assert.equal(roots.input, 'input');
  assert.equal(roots['input-area'], 'textarea');
  assert.equal(roots.field, 'native-input');
  for (const control of value.controls) {
    assert.equal(control.container, 'div');
    assert.equal(control.label.associates, 'id/for');
    assert.equal(control.label.clickFocusesControl, true);
    assert.equal(control.focus.trigger, 'trusted label click');
    assert.ok(control.vectors.length >= 1);
  }
  // Field wraps a caller-provided control; Input/InputArea own their control.
  assert.equal(value.controls.find(c => c.component === 'field').ownsControl, false);
  assert.equal(value.controls.find(c => c.component === 'input').ownsControl, true);
});

test('exact id/describedby/required serialization remain explicit unknowns, not silent claims', () => {
  const value = loadFieldComposition();
  const fields = value.unknowns.map(u => u.field).sort();
  assert.deepEqual(fields, ['describedBySerialization', 'generatedIdValue', 'requiredSerialization']);
  for (const unknown of value.unknowns) assert.equal(unknown.status, 'unknown');
});

test('validator fails closed for support downgrade and digest mutation', () => {
  const value = structuredClone(loadFieldComposition());
  value.support = 'requirements-only';
  assert.throws(() => validateFieldComposition(value));
  const mutated = structuredClone(loadFieldComposition());
  mutated.controls[0].label.clickFocusesControl = false;
  assert.throws(() => validateFieldComposition(mutated));
  const digestMutated = structuredClone(loadFieldComposition());
  digestMutated.capabilityDigest = 'x'.repeat(64);
  assert.throws(() => validateFieldComposition(digestMutated));
});
