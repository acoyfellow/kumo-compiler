import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {deriveCommandPalette, validateCommandPalette, loadCommandPalette, COMMAND_PALETTE_COMPONENTS} from '../src/kumo/library/command-palette.mjs';

const contractDir = path.resolve('contracts/kumo.observable/v1/components');
const contracts = COMMAND_PALETTE_COMPONENTS.map(name => JSON.parse(fs.readFileSync(path.join(contractDir, `${name}.json`), 'utf8')));

test('command-palette derives supported behavior and is stable twice', () => {
  const a = deriveCommandPalette(contracts);
  const b = deriveCommandPalette(contracts);
  assert.equal(a.capabilityDigest, b.capabilityDigest);
  assert.deepEqual(loadCommandPalette(), a);
  assert.equal(a.support, 'supported');
});

test('highlighted text uses span root with mark ranges', () => {
  const v = loadCommandPalette();
  assert.equal(v.highlightedText.root, 'span');
  assert.equal(v.highlightedText.rangeTag, 'mark');
  assert.equal(v.highlightedText.ranges, 'inclusive [start,end]');
});

test('open palette highlights first, input emits value, ArrowDown advances, Escape closes with no focus', () => {
  const v = loadCommandPalette();
  assert.equal(v.palette.root, 'div');
  assert.equal(v.palette.open.event, 'highlight:<item>');
  assert.equal(v.palette.input.event, 'value:<input>');
  assert.equal(v.palette.navigate.key, 'ArrowDown');
  assert.equal(v.palette.dismiss.event, 'open:false');
  assert.equal(v.palette.dismiss.focus, 'none');
});

test('roots are derived from canonical vectors', () => {
  const c = contracts[0];
  assert.equal(c.vectors.find(x => x.id === 'highlighted-text').expected.root.tag, 'span');
  assert.equal(c.vectors.find(x => x.id === 'open-search-close').expected.root.tag, 'div');
});

test('closed placeholder, plain-enter selection, ssr portal remain explicit unknowns', () => {
  assert.deepEqual(loadCommandPalette().unknowns.map(u => u.field).sort(), ['closedRootPlaceholder', 'selectionOnPlainEnter', 'ssrOpenPortal']);
});

test('validator fails closed for support downgrade, dismiss mutation, and digest mutation', () => {
  const downgrade = structuredClone(loadCommandPalette());
  downgrade.support = 'requirements-only';
  assert.throws(() => validateCommandPalette(downgrade));
  const mutated = structuredClone(loadCommandPalette());
  mutated.palette.dismiss.event = 'changed';
  assert.throws(() => validateCommandPalette(mutated));
  const digestMutated = structuredClone(loadCommandPalette());
  digestMutated.capabilityDigest = 'x'.repeat(64);
  assert.throws(() => validateCommandPalette(digestMutated));
});
