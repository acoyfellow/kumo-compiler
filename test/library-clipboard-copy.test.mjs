import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {deriveClipboardCopy, validateClipboardCopy, loadClipboardCopy, CLIPBOARD_COPY_COMPONENTS} from '../src/kumo/library/clipboard-copy.mjs';

const contractDir = path.resolve('contracts/kumo.observable/v1/components');
const contracts = CLIPBOARD_COPY_COMPONENTS.map(name => JSON.parse(fs.readFileSync(path.join(contractDir, `${name}.json`), 'utf8')));

test('clipboard copy derives the canonical observable behavior and is stable twice', () => {
  const a = deriveClipboardCopy(contracts);
  const b = deriveClipboardCopy(contracts);
  assert.equal(a.capabilityDigest, b.capabilityDigest);
  assert.deepEqual(loadClipboardCopy(), a);
  assert.equal(a.support, 'supported');
  assert.equal(a.root, 'div');
});

test('proven behavior is write + copy event + Copied announcement + retained button focus', () => {
  const value = loadClipboardCopy();
  assert.equal(value.behavior.writesClipboard, true);
  assert.equal(value.behavior.firesCopyCallback, 'copy');
  assert.equal(value.behavior.announcesSuccess, 'Copied');
  assert.equal(value.behavior.retainsButtonFocus, true);
  assert.deepEqual(value.activations.map(a => a.trigger.type), ['click', 'key']);
  assert.equal(value.copySource.prop, 'textToCopy');
  assert.equal(value.copySource.fallback, 'text');
});

test('live-region aria/dom and failure handling remain explicit unknowns', () => {
  const fields = loadClipboardCopy().unknowns.map(u => u.field).sort();
  assert.deepEqual(fields, ['announcementTimingAndClearing', 'buttonAccessibleName', 'failureCallbackAndAnnouncement', 'liveRegionAriaAndDom']);
});

test('validator fails closed for support downgrade, behavior mutation, and digest mutation', () => {
  const downgrade = structuredClone(loadClipboardCopy());
  downgrade.support = 'requirements-only';
  assert.throws(() => validateClipboardCopy(downgrade));
  const behavior = structuredClone(loadClipboardCopy());
  behavior.behavior.announcesSuccess = 'Done';
  assert.throws(() => validateClipboardCopy(behavior));
  const digestMutated = structuredClone(loadClipboardCopy());
  digestMutated.capabilityDigest = 'x'.repeat(64);
  assert.throws(() => validateClipboardCopy(digestMutated));
});
