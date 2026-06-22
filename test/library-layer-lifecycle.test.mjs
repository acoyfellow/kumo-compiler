import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {deriveLayerLifecycle,loadLayerLifecycle,validateLayerLifecycle} from '../src/kumo/library/layer-lifecycle.mjs';

const names = ['dialog','dropdown-menu','popover'];
const contracts = names.map(name => JSON.parse(fs.readFileSync(path.resolve(`contracts/kumo.observable/v1/components/${name}.json`))));

test('layer lifecycle is canonical, deterministic, and digest bound', () => {
  const first = deriveLayerLifecycle(contracts);
  const second = deriveLayerLifecycle(contracts);
  assert.deepEqual(first, second);
  assert.deepEqual(loadLayerLifecycle(), first);
});

test('controlled state, ownership, portals, modality, focus and services are explicit', () => {
  const capability = loadLayerLifecycle();
  for (const layer of capability.layers) {
    assert.equal(layer.state.controlled.supported, true);
    assert.equal(layer.ownership.trigger.supported, true);
    assert.equal(layer.ownership.content.supported, true);
    assert.equal(layer.portal.supported, true);
    assert.ok(layer.browserServices.length);
  }
  const dialog = capability.layers.find(x => x.component === 'dialog');
  assert.equal(dialog.modality.mode.value, 'modal');
  assert.equal(dialog.modality.inert.value, true);
  assert.equal(dialog.focus.contain.supported, true);
  assert.equal(dialog.dismissal.escape.supported, false);
  const popover = capability.layers.find(x => x.component === 'popover');
  assert.equal(popover.modality.mode.value, 'nonmodal');
  assert.equal(popover.positioning.value.sideOffset, 8);
  const menu = capability.layers.find(x => x.component === 'dropdown-menu');
  assert.equal(menu.dismissal.nesting.supported, true);
});

test('unknown operations fail closed with explicit blockers', () => {
  const capability = loadLayerLifecycle();
  for (const layer of capability.layers) {
    const claims = [...Object.values(layer.dismissal),...Object.values(layer.modality),...Object.values(layer.focus),layer.positioning];
    for (const claim of claims.filter(x => !x.supported)) assert.ok(claim.reason);
    assert.ok(layer.blockers.length);
  }
  const optimistic = structuredClone(capability);
  optimistic.layers[2].dismissal.outsidePointer = {supported:true,value:'dismiss'};
  assert.throws(() => validateLayerLifecycle(optimistic), /evidence/);
  const mutated = structuredClone(capability);
  mutated.layers[0].focus.restore.value = 'body';
  assert.throws(() => validateLayerLifecycle(mutated), /digest mismatch/);
});
