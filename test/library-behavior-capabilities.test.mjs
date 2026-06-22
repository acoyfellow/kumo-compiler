import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {deriveBehaviorCapabilities, loadBehaviorCapabilities, validateBehaviorCapabilities} from '../src/kumo/library/behavior-capabilities.mjs';

const contractDir = path.resolve('contracts/kumo.observable/v1/components');
const names = ['button','checkbox','input','input-area','radio','switch','sensitive-input'];
const contracts = names.map(name => JSON.parse(fs.readFileSync(path.join(contractDir, `${name}.json`))));

test('registry is canonical and contract-derived', () => {
  const registry = loadBehaviorCapabilities();
  assert.deepEqual(registry, deriveBehaviorCapabilities(contracts));
  assert.equal(registry.bindings.length, 7);
  const button = registry.bindings.find(binding => binding.component === 'button');
  assert.equal(button.id, 'native-button');
  assert.equal(button.support, 'supported');
  assert.deepEqual(button.vectorIds, contracts[0].vectors.map(vector => vector.id));
  assert.deepEqual(button.missingOperations, []);
});

test('families remain fail-closed with explicit provenance and gaps', () => {
  const registry = loadBehaviorCapabilities();
  for (const binding of registry.bindings.filter(binding => binding.component !== 'button')) {
    assert.equal(binding.support, 'requirements-only');
    assert.ok(binding.vectorIds.length);
    assert.ok(binding.missingOperations.every(item => item.kind && item.reason));
  }
  const checkbox = registry.bindings.find(binding => binding.component === 'checkbox');
  assert.equal(checkbox.controlled.prop, 'checked');
  assert.equal(checkbox.uncontrolled.source, 'absence of checked');
  const input = registry.bindings.find(binding => binding.component === 'input');
  assert.equal(input.controlled.supported, false);
});

test('validation rejects optimistic unresolved support and digest mutation', () => {
  const registry = structuredClone(loadBehaviorCapabilities());
  const checkbox = registry.bindings.find(binding => binding.component === 'checkbox');
  checkbox.missingOperations = [];
  assert.throws(() => validateBehaviorCapabilities(registry), /explicit reasons/);
  const mutated = structuredClone(loadBehaviorCapabilities());
  mutated.bindings[0].requirements.events.push('fabricated');
  assert.throws(() => validateBehaviorCapabilities(mutated), /digest mismatch/);
});
