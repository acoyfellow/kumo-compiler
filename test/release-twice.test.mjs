import assert from 'node:assert/strict';
import test from 'node:test';
import { createComparisonReceipt, compareReleaseObservations, observeRelease, validateObservation } from '../scripts/release-twice.mjs';

const hash = 'a'.repeat(64);
const observation = {
  packages: ['solid.tgz', 'svelte.tgz', 'vue.tgz'].map((file) => ({ file, sha256: hash })),
  githubReleaseAssets: [{ file: 'solid.tgz', sha256: hash }],
  deployManifestSourceSha256: hash,
  deployPayloadSha256: hash,
};

test('pure comparison accepts exact observations and creates explicit nonpublishing metadata', () => {
  assert.equal(compareReleaseObservations(observation, structuredClone(observation)), observation);
  const receipt = createComparisonReceipt({ commit: 'b'.repeat(40), observation, npmVersion: '11.13.0', runMode: 'test' });
  assert.equal(receipt.independentRuns, 2);
  assert.equal(receipt.command, 'npm run release:check');
  assert.deepEqual(receipt.publication, { npm: false, github: false, deploy: false, gitPush: false });
  assert.match(receipt.receiptSha256, /^[a-f0-9]{64}$/);
});

test('comparison and validation fail closed', () => {
  const changed = structuredClone(observation);
  changed.packages[0].sha256 = 'c'.repeat(64);
  assert.throws(() => compareReleaseObservations(observation, changed), /differ/);
  assert.throws(() => validateObservation({ ...observation, packages: observation.packages.slice(1) }), /three/);
  assert.throws(() => validateObservation({ ...observation, deployPayloadSha256: 'bad' }), /invalid/);
});

test('current release artifacts agree with their manifests and deploy payload', async () => {
  const current = await observeRelease();
  assert.equal(current.packages.length, 3);
  assert.ok(current.githubReleaseAssets.length >= 3);
});
