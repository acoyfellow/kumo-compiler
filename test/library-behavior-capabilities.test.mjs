import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {deriveBehaviorCapabilities, loadBehaviorCapabilities, validateBehaviorCapabilities} from '../src/kumo/library/behavior-capabilities.mjs';

const contractDir = path.resolve('contracts/kumo.observable/v1/components');
const names = fs.readdirSync(contractDir).filter(name=>name.endsWith('.json')).map(name=>name.slice(0,-5)).sort();
const contracts = names.map(name => JSON.parse(fs.readFileSync(path.join(contractDir, `${name}.json`))));

test('registry is canonical and contract-derived', () => {
  const registry = loadBehaviorCapabilities();
  assert.deepEqual(registry, deriveBehaviorCapabilities(contracts));
  assert.equal(registry.bindings.length, 28);
  const button = registry.bindings.find(binding => binding.component === 'button');
  assert.equal(button.id, 'native-button');
  assert.equal(button.support, 'supported');
  assert.deepEqual(button.vectorIds, contracts.find(contract=>contract.component==='button').vectors.map(vector => vector.id));
  assert.deepEqual(button.missingOperations, []);
});

test('registry promotes only complete executable state algebra', () => {
  const registry = loadBehaviorCapabilities();
  for (const binding of registry.bindings) assert.ok(binding.vectorIds.length);
  for (const binding of registry.bindings.filter(binding => ['checkbox','switch'].includes(binding.component))) {
    assert.equal(binding.support, 'supported');
    assert.deepEqual(binding.missingOperations, []);
  }
  for (const binding of registry.bindings.filter(binding => !['native-button','toggle-control'].includes(binding.id))) {
    assert.equal(binding.support, 'requirements-only');
    assert.ok(binding.missingOperations.every(item => item.kind && item.reason));
  }
  for (const component of ['input','input-area']) {
    const binding=registry.bindings.find(item=>item.id==='native-field'&&item.component===component);
    assert.equal(binding.support,'requirements-only');
    assert.deepEqual(binding.missingOperations.map(item=>item.kind),['field-wiring']);
    assert.equal(binding.uncontrolled.owner,'native control');
  }
  assert.deepEqual(new Set(registry.bindings.filter(binding=>binding.id==='focus-navigation').map(binding=>binding.component)),new Set(['radio','menu-bar','tabs','pagination','command-palette','table-of-contents']));
  assert.deepEqual(new Set(registry.bindings.filter(binding=>binding.id==='collection-listbox').map(binding=>binding.component)),new Set(['autocomplete','combobox','select','dropdown-menu','radio','command-palette']));
  assert.deepEqual(new Set(registry.bindings.filter(binding=>binding.id==='layer-lifecycle').map(binding=>binding.component)),new Set(['dialog','dropdown-menu','popover']));
  assert.deepEqual(new Set(registry.bindings.filter(binding=>binding.id==='date-range').map(binding=>binding.component)),new Set(['date-picker','date-range-picker']));
  for(const id of ['responsive-sidebar','pagination-state','toast-lifecycle'])assert.equal(registry.bindings.filter(binding=>binding.id===id).length,1);
  const checkbox = registry.bindings.find(binding => binding.component === 'checkbox');
  assert.equal(checkbox.controlled.prop, 'checked');
  assert.equal(checkbox.uncontrolled.source, 'absence of checked');
  const clipboard = registry.bindings.find(binding => binding.component === 'clipboard-text');
  assert.equal(clipboard.id, 'clipboard-live-region');
  assert.ok(clipboard.missingOperations.some(item => item.kind === 'announcement-lifecycle'));
  const input = registry.bindings.find(binding => binding.component === 'input');
  assert.equal(input.controlled.supported, false);
  const sensitive=registry.bindings.find(binding=>binding.component==='sensitive-input');
  assert.deepEqual(sensitive.missingOperations.map(x=>x.kind),['reveal-boundary','clipboard-failure','field-wiring']);
});

test('validation rejects optimistic unresolved support and digest mutation', () => {
  const registry = structuredClone(loadBehaviorCapabilities());
  const checkbox = registry.bindings.find(binding => binding.component === 'checkbox');
  checkbox.support = 'requirements-only';
  assert.throws(() => validateBehaviorCapabilities(registry), /explicit reasons/);
  const mutated = structuredClone(loadBehaviorCapabilities());
  mutated.bindings[0].requirements.events.push('fabricated');
  assert.throws(() => validateBehaviorCapabilities(mutated), /digest mismatch/);
});
