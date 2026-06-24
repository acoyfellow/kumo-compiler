import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {smoke} from '../scripts/browser-smoke.mjs';

test('browser smoke catches missing JS/CSS assets and console errors across project routes', async () => {
  const receipt = await smoke();
  assert.equal(receipt.status, 'passed');
  assert.equal(receipt.failures.length, 0);
  assert.equal(receipt.componentCount, 41);
  assert.ok(receipt.routeCount >= 169);
  const persisted = JSON.parse(await readFile('proof/browser-smoke/latest.json', 'utf8'));
  assert.equal(persisted.status, 'passed');
  assert.equal(persisted.failures.length, 0);
});
