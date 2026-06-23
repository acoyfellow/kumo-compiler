import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {deriveSensitiveInput, validateSensitiveInput, loadSensitiveInput, SENSITIVE_INPUT_COMPONENTS} from '../src/kumo/library/sensitive-input.mjs';

const contractDir = path.resolve('contracts/kumo.observable/v1/components');
const contracts = SENSITIVE_INPUT_COMPONENTS.map(name => JSON.parse(fs.readFileSync(path.join(contractDir, `${name}.json`), 'utf8')));

test('sensitive-input derives supported behavior and is stable twice', () => {
  const a = deriveSensitiveInput(contracts);
  const b = deriveSensitiveInput(contracts);
  assert.equal(a.capabilityDigest, b.capabilityDigest);
  assert.deepEqual(loadSensitiveInput(), a);
  assert.equal(a.support, 'supported');
});

test('masked input is password and holds value; reveal focuses input; edit fires value event staying password', () => {
  const v = loadSensitiveInput();
  assert.equal(v.root.tag, 'div');
  assert.equal(v.input.type, 'password');
  assert.equal(v.input.holdsValue, true);
  assert.equal(v.reveal.focuses, 'input');
  assert.equal(v.edit.event, 'value:<next>');
  assert.equal(v.edit.staysType, 'password');
});

test('copy writes clipboard, announces live region, fires copy event', () => {
  const v = loadSensitiveInput();
  assert.equal(v.copy.event, 'copy');
  assert.equal(v.copy.announcesLiveRegion, true);
  assert.ok(v.parts.includes('masked-container') && v.parts.includes('copy'));
});

test('div root derived from every canonical vector', () => {
  for (const vec of contracts[0].vectors) assert.equal(vec.expected.root.tag, 'div');
});

test('vendor behavior remains an explicit unknown', () => {
  assert.deepEqual(loadSensitiveInput().unknowns.map(u => u.field), ['inheritedVendorBehavior']);
});

test('validator fails closed for support downgrade, type mutation, and digest mutation', () => {
  const downgrade = structuredClone(loadSensitiveInput());
  downgrade.support = 'requirements-only';
  assert.throws(() => validateSensitiveInput(downgrade));
  const mutated = structuredClone(loadSensitiveInput());
  mutated.input.type = 'text';
  assert.throws(() => validateSensitiveInput(mutated));
  const digestMutated = structuredClone(loadSensitiveInput());
  digestMutated.capabilityDigest = 'x'.repeat(64);
  assert.throws(() => validateSensitiveInput(digestMutated));
});
