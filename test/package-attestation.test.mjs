import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { canonicalJsonBytes, sha256Bytes } from '../scripts/lib/immutable-receipts.mjs';
import { createPackageAttestation, validatePackageAttestation, writePackageAttestation } from '../scripts/libraries/package-attestation.mjs';

const bytes = Buffer.from('fixture tarball bytes\0raw');
const hash = sha256Bytes(bytes);
const prerequisites = [{ identity: 'source/tree', sha256: 'a'.repeat(64) }];
const checkedAt = '2026-06-22T12:00:00.000Z';
function input(overrides = {}) {
  return {
    framework: 'vue', name: '@acoyfellow/kumo-vue', version: '0.0.1', tarballBytes: bytes,
    inventory: { manifestCount: 1, exportCount: 44, typeCount: 42, componentCount: 41 },
    deterministicPackSha256: [hash, hash],
    checks: {
      freshConsumerInstall: { status: 'passed', checkedAt },
      clientBuild: { status: 'passed', checkedAt },
      ssrBuild: { status: 'passed', checkedAt },
    },
    prerequisites,
    now: '2026-06-22T13:00:00.000Z',
    ...overrides,
  };
}

test('generates deterministic, raw-byte-bound attestations for exact package identities', () => {
  for (const framework of ['vue', 'svelte', 'solid']) {
    const name = `@acoyfellow/kumo-${framework}`;
    const first = createPackageAttestation(input({ framework, name }));
    const second = createPackageAttestation(input({ framework, name }));
    assert.deepEqual(first, second);
    assert.equal(first.package.tarballSha256, hash);
    assert.deepEqual(validatePackageAttestation(first, { tarballBytes: bytes, prerequisites }), { valid: true, errors: [] });
  }
});

test('fails closed for stale/mixed identity, version, hashes, inventory and gates', () => {
  const valid = createPackageAttestation(input());
  const cases = [
    [{ ...valid, package: { ...valid.package, name: '@acoyfellow/kumo-solid' } }, /identity/],
    [{ ...valid, package: { ...valid.package, version: '0.0.2' } }, /version/],
    [{ ...valid, package: { ...valid.package, tarballSha256: 'b'.repeat(64) } }, /hash/],
    [{ ...valid, inventory: { ...valid.inventory, componentCount: 40 } }, /41 components/],
    [{ ...valid, checks: { ...valid.checks, ssrBuild: undefined } }, /missing automatable gate/],
    [{ ...valid, checks: { ...valid.checks, clientBuild: { status: 'not-run', checkedAt } } }, /did not pass/],
    [{ ...valid, deterministicPackSha256: [hash, 'c'.repeat(64)] }, /double-pack/],
    [{ ...valid, prerequisites: [] }, /prerequisite/],
    [{ ...valid, status: 'failed' }, /status must be passed/],
  ];
  for (const [candidate, pattern] of cases) assert.match(validatePackageAttestation(candidate, { tarballBytes: bytes, prerequisites }).errors.join('; '), pattern);
  assert.throws(() => createPackageAttestation(input({ name: '@acoyfellow/kumo-solid' })), /identity/);
  assert.throws(() => createPackageAttestation(input({ checks: { ...input().checks, ssrBuild: { status: 'failed', checkedAt } } })), /did not pass/);
});

test('rejects stale/future checks and prerequisite or raw tarball mismatch', () => {
  const valid = createPackageAttestation(input());
  assert.match(validatePackageAttestation(valid, { tarballBytes: Buffer.from('different') }).errors.join(), /hash mismatch/);
  assert.match(validatePackageAttestation(valid, { prerequisites: [{ identity: 'other', sha256: 'a'.repeat(64) }] }).errors.join(), /prerequisites do not match/);
  assert.match(validatePackageAttestation(valid, { now: '2026-06-22T11:00:00.000Z' }).errors.join(), /future/);
});

test('writes canonical output idempotently and collision-safely', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'package-attestation-'));
  try {
    const attestation = createPackageAttestation(input());
    const first = await writePackageAttestation(root, 'vue.json', attestation, { tarballBytes: bytes, prerequisites });
    const retry = await writePackageAttestation(root, 'vue.json', attestation, { tarballBytes: bytes, prerequisites });
    assert.equal(first.created, true);
    assert.equal(retry.created, false);
    assert.deepEqual(await readFile(first.path), canonicalJsonBytes(attestation));
    const changed = { ...attestation, inventory: { ...attestation.inventory, exportCount: 45 } };
    await assert.rejects(writePackageAttestation(root, 'vue.json', changed, { tarballBytes: bytes, prerequisites }), /collision/);
  } finally { await rm(root, { recursive: true, force: true }); }
});
