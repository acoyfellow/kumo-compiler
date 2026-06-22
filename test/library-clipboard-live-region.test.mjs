import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {deriveClipboardLiveRegion, loadClipboardLiveRegion, validateClipboardLiveRegion} from '../src/kumo/library/clipboard-live-region.mjs';
import {loadLibrary} from '../src/kumo/library/index.mjs';

const contract = JSON.parse(fs.readFileSync('contracts/kumo.observable/v1/components/clipboard-text.json'));

test('clipboard/live-region capability is canonical and contract-derived', () => {
  const capability = loadClipboardLiveRegion();
  assert.deepEqual(capability, deriveClipboardLiveRegion(contract));
  assert.deepEqual(capability.vectorIds, ['ssr', 'click-copy', 'keyboard']);
  assert.equal(capability.ssr.browserAccessDuringRender, false);
  assert.equal(capability.browserService.operation, 'writeText');
  assert.equal(capability.activation[0].onSuccess.announcement, 'Copied');
  assert.equal(capability.activation[1].trigger.key, 'Enter');
});

test('clipboard/live-region remains requirements-only with exact canonical blockers', () => {
  const capability = loadLibrary().clipboardLiveRegion;
  assert.equal(capability.support, 'requirements-only');
  assert.deepEqual(capability.missingOperations.map(item => item.kind), ['failure-transition', 'announcement-lifecycle', 'live-region-semantics', 'button-semantics']);
  assert.equal(capability.callbacks.failure, null);
  assert.ok(capability.unknowns.some(item => item.field === 'clipboardPermissionAndRejection'));
  assert.ok(capability.unknowns.some(item => item.field === 'announcementTimingAndClearing'));
});

test('clipboard/live-region validation fails closed', () => {
  const optimistic = structuredClone(loadClipboardLiveRegion());
  optimistic.support = 'supported';
  assert.throws(() => validateClipboardLiveRegion(optimistic), /fail closed/);
  const mutated = structuredClone(loadClipboardLiveRegion());
  mutated.activation[1].trigger.key = 'Space';
  assert.throws(() => validateClipboardLiveRegion(mutated), /activation transitions/);
});
