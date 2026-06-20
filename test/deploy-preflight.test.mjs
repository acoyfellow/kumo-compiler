import test from 'node:test';
import assert from 'node:assert/strict';
import manifest from '../deploy-manifest.json' with { type: 'json' };
import { deploymentIdentity } from '../scripts/deploy.mjs';

test('deployment identity is pinned to the approved personal account and custom domain', async () => {
  const identity = await deploymentIdentity({ allowModified: true });
  assert.equal(identity.service, 'kumo-compiler-proof');
  assert.equal(identity.gitCommit, '49f2c33e3664b072fe66796daa5fa12d38482e85');
  assert.deepEqual(identity.target, {
    accountId: 'bfcb6ac5b3ceaf42a09607f6f7925823',
    accountName: "Coeyman@gmail.com's Account",
    zoneId: '1563da24f904f018b89fdcb2147c558b',
    zoneName: 'coey.dev',
    hostname: 'kumo-compiler.coey.dev',
    customDomain: true
  });
  assert.equal(manifest.sourceCommit, identity.gitCommit);
  assert.match(identity.manifestHash, /^[a-f0-9]{64}$/);
});
