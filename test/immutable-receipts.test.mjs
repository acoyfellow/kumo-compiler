import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  canonicalJson,
  canonicalJsonBytes,
  canonicalJsonDigest,
  sha256Bytes,
  validateImmutableReceipt,
  writeImmutableBytes,
  writeImmutableReceipt,
} from '../scripts/lib/immutable-receipts.mjs';

test('canonical JSON is stable and rejects unsupported values', () => {
  assert.equal(canonicalJson({ z: 1, a: { y: 2, x: 3 } }), '{"a":{"x":3,"y":2},"z":1}');
  assert.equal(canonicalJsonDigest({ b: 2, a: 1 }), sha256Bytes(canonicalJsonBytes({ a: 1, b: 2 })));
  assert.throws(() => canonicalJson({ value: undefined }), /does not support/);
});

test('immutable writes create once, retry idempotently, and fail closed on collision', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'immutable-receipt-'));
  try {
    const first = await writeImmutableBytes(root, 'receipts/gate.json', Buffer.from('first'));
    const retry = await writeImmutableBytes(root, 'receipts/gate.json', Buffer.from('first'));
    assert.equal(first.created, true);
    assert.equal(retry.created, false);
    await assert.rejects(writeImmutableBytes(root, 'receipts/gate.json', Buffer.from('second')), /collision/);
    assert.equal((await readFile(first.path, 'utf8')), 'first');
    await assert.rejects(writeImmutableBytes(root, '../escape.json', Buffer.from('bad')), /escapes root/);
    await assert.rejects(writeImmutableBytes(root, '/absolute.json', Buffer.from('bad')), /safe relative path/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('concurrent immutable writers cannot overwrite the winning receipt', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'immutable-receipt-race-'));
  try {
    const different = await Promise.allSettled([
      writeImmutableBytes(root, 'receipts/race.json', Buffer.from('alpha')),
      writeImmutableBytes(root, 'receipts/race.json', Buffer.from('beta')),
    ]);
    assert.equal(different.filter(result => result.status === 'fulfilled').length, 1);
    assert.equal(different.filter(result => result.status === 'rejected').length, 1);
    assert.match(different.find(result => result.status === 'rejected').reason.message, /collision/);
    assert.ok(['alpha', 'beta'].includes(await readFile(path.join(root, 'receipts/race.json'), 'utf8')));

    const same = await Promise.all([
      writeImmutableBytes(root, 'receipts/same.json', Buffer.from('same')),
      writeImmutableBytes(root, 'receipts/same.json', Buffer.from('same')),
    ]);
    assert.equal(same.filter(result => result.created).length, 1);
    assert.equal(await readFile(path.join(root, 'receipts/same.json'), 'utf8'), 'same');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('receipt validation binds raw bytes and prerequisite digests without promotion', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'immutable-receipt-'));
  const payload = Buffer.from('raw\r\nbytes');
  const prerequisites = [{ identity: 'contracts', sha256: sha256Bytes(Buffer.from('contract receipt')) }];
  const receipt = {
    schemaVersion: 'kumo.immutable-receipt/v1',
    identity: 'package/react',
    status: 'failed',
    contentSha256: sha256Bytes(payload),
    prerequisites,
    detail: { failures: 1 },
  };
  try {
    assert.deepEqual(validateImmutableReceipt(receipt, { expectedBytes: payload, expectedPrerequisites: prerequisites }), { valid: true, errors: [] });
    assert.equal(validateImmutableReceipt({ ...receipt, status: 'ok' }).valid, false);
    assert.equal(validateImmutableReceipt(receipt, { expectedBytes: Buffer.from('raw\nbytes') }).valid, false);
    assert.equal(validateImmutableReceipt(receipt, { expectedPrerequisites: [{ ...prerequisites[0], sha256: '0'.repeat(64) }] }).valid, false);
    const result = await writeImmutableReceipt(root, 'package/react.json', receipt, { contentBytes: payload, prerequisites });
    assert.equal(result.created, true);
    assert.deepEqual(JSON.parse(await readFile(result.path, 'utf8')), receipt);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
