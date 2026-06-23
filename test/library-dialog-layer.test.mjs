import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {deriveDialogLayer, validateDialogLayer, loadDialogLayer, DIALOG_LAYER_COMPONENTS} from '../src/kumo/library/dialog-layer.mjs';

const contractDir = path.resolve('contracts/kumo.observable/v1/components');
const contracts = DIALOG_LAYER_COMPONENTS.map(name => JSON.parse(fs.readFileSync(path.join(contractDir, `${name}.json`), 'utf8')));

test('dialog layer derives supported lifecycle and is stable twice', () => {
  const a = deriveDialogLayer(contracts);
  const b = deriveDialogLayer(contracts);
  assert.equal(a.capabilityDigest, b.capabilityDigest);
  assert.deepEqual(loadDialogLayer(), a);
  assert.equal(a.support, 'supported');
});

test('trigger carries canonical data-kumo attributes derived from the contract', () => {
  const v = loadDialogLayer();
  assert.equal(v.trigger.tag, 'button');
  assert.equal(v.trigger.attributes['data-kumo-component'], 'Dialog');
  assert.equal(v.trigger.attributes['data-kumo-part'], 'trigger');
  const contract = contracts[0];
  const canonical = contract.vectors.find(x => x.id === 'closed-trigger').expected.root.attributes.includes;
  assert.equal(v.trigger.attributes['data-kumo-component'], canonical['data-kumo-component']);
});

test('open/close lifecycle: closed has no dialog, open portals one role=dialog, events and focus restore', () => {
  const v = loadDialogLayer();
  assert.equal(v.closed.dialogCount, 0);
  assert.equal(v.open.role, 'dialog');
  assert.equal(v.open.portalCount, 1);
  assert.deepEqual(v.lifecycle.events, ['open:true', 'open:false']);
  assert.equal(v.focus.restore, 'trigger');
});

test('deep modality, generated ids, alertdialog escape remain explicit unknowns', () => {
  const fields = loadDialogLayer().unknowns.map(u => u.field).sort();
  assert.deepEqual(fields, ['alertdialogEscape', 'generatedIds', 'modality']);
});

test('validator fails closed for support downgrade, lifecycle mutation, and digest mutation', () => {
  const downgrade = structuredClone(loadDialogLayer());
  downgrade.support = 'requirements-only';
  assert.throws(() => validateDialogLayer(downgrade));
  const mutated = structuredClone(loadDialogLayer());
  mutated.lifecycle.event = 'changed';
  assert.throws(() => validateDialogLayer(mutated));
  const digestMutated = structuredClone(loadDialogLayer());
  digestMutated.capabilityDigest = 'x'.repeat(64);
  assert.throws(() => validateDialogLayer(digestMutated));
});
