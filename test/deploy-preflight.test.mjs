import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import manifest from '../deploy-manifest.json' with { type: 'json' };
import { deploymentIdentity } from '../scripts/deploy.mjs';
import { deployPayloadDigest, PROTECTED_DEPLOY_PATHS } from '../scripts/deploy-source.mjs';

test('deployment identity binds the current commit payload to the approved target', async (context) => {
  if (process.env.KUMO_TEST_DIRTY_DEPLOY !== '1') {
    context.skip('deployment identity requires the committed clean tree exercised by release verification');
    return;
  }
  const identity = await deploymentIdentity();
  assert.equal(identity.service, 'kumo-compiler-proof');
  assert.match(identity.gitCommit, /^[a-f0-9]{40}$/);
  assert.deepEqual(identity.target, {
    accountId: 'bfcb6ac5b3ceaf42a09607f6f7925823',
    accountName: "Coeyman@gmail.com's Account",
    zoneId: '1563da24f904f018b89fdcb2147c558b',
    zoneName: 'coey.dev',
    hostname: 'kumo-compiler.coey.dev',
    customDomain: true
  });
  assert.equal(manifest.source.deployPayloadSha256, identity.payloadHash);
  assert.match(identity.manifestHash, /^[a-f0-9]{64}$/);
});

test('deploy payload digest rejects changed assets and is path-sensitive', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'kumo-deploy-'));
  try {
    await writeFile(join(directory, 'asset.txt'), 'approved');
    const approved = await deployPayloadDigest(directory);
    await writeFile(join(directory, 'asset.txt'), 'tampered');
    const tampered = await deployPayloadDigest(directory);
    assert.notEqual(tampered.sha256, approved.sha256);
    await rm(join(directory, 'asset.txt'));
    await writeFile(join(directory, 'renamed.txt'), 'approved');
    const renamed = await deployPayloadDigest(directory);
    assert.notEqual(renamed.sha256, approved.sha256);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('deployment source rule protects config, manifest, and worker from bundle inclusion', () => {
  assert.deepEqual(PROTECTED_DEPLOY_PATHS, ['deploy-manifest.json', 'wrangler.jsonc', 'worker.mjs']);
  assert.equal(manifest.source.algorithm, 'sha256-tree-v1');
});
