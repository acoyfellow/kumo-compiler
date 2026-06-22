import { createHash } from 'node:crypto';
import { link, mkdir, open, readFile, rm } from 'node:fs/promises';
import path from 'node:path';

export const IMMUTABLE_RECEIPT_SCHEMA_VERSION = 'kumo.immutable-receipt/v1';
export const RECEIPT_STATUSES = Object.freeze(['passed', 'failed', 'blocked', 'not-run']);
const SHA256 = /^[a-f0-9]{64}$/;

export function canonicalJson(value) {
  const seen = new Set();
  function encode(item) {
    if (item === null || typeof item === 'boolean' || typeof item === 'string') return JSON.stringify(item);
    if (typeof item === 'number') {
      if (!Number.isFinite(item)) throw new TypeError('canonical JSON does not support non-finite numbers');
      return JSON.stringify(item);
    }
    if (typeof item !== 'object') throw new TypeError(`canonical JSON does not support ${typeof item}`);
    if (seen.has(item)) throw new TypeError('canonical JSON does not support cycles');
    seen.add(item);
    let result;
    if (Array.isArray(item)) result = `[${item.map(encode).join(',')}]`;
    else result = `{${Object.keys(item).sort().map((key) => `${JSON.stringify(key)}:${encode(item[key])}`).join(',')}}`;
    seen.delete(item);
    return result;
  }
  return encode(value);
}

export function sha256Bytes(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

export function canonicalJsonBytes(value) {
  return Buffer.from(`${canonicalJson(value)}\n`, 'utf8');
}

export function canonicalJsonDigest(value) {
  return sha256Bytes(canonicalJsonBytes(value));
}

export function validateImmutableReceipt(receipt, { expectedBytes, expectedPrerequisites } = {}) {
  const errors = [];
  if (!receipt || typeof receipt !== 'object' || Array.isArray(receipt)) return { valid: false, errors: ['receipt must be an object'] };
  if (receipt.schemaVersion !== IMMUTABLE_RECEIPT_SCHEMA_VERSION) errors.push('invalid schemaVersion');
  if (typeof receipt.identity !== 'string' || !receipt.identity) errors.push('identity must be a non-empty string');
  if (!RECEIPT_STATUSES.includes(receipt.status)) errors.push('invalid status');
  if (typeof receipt.contentSha256 !== 'string' || !SHA256.test(receipt.contentSha256)) errors.push('invalid contentSha256');
  if (!Array.isArray(receipt.prerequisites)) errors.push('prerequisites must be an array');
  else for (const [index, prerequisite] of receipt.prerequisites.entries()) {
    if (!prerequisite || typeof prerequisite !== 'object' || typeof prerequisite.identity !== 'string' || !prerequisite.identity || !SHA256.test(prerequisite.sha256 ?? '')) errors.push(`invalid prerequisite at index ${index}`);
  }
  if (expectedBytes !== undefined && receipt.contentSha256 !== sha256Bytes(expectedBytes)) errors.push('contentSha256 does not match raw bytes');
  if (expectedPrerequisites !== undefined && canonicalJson(receipt.prerequisites) !== canonicalJson(expectedPrerequisites)) errors.push('prerequisites do not match expected digests');
  return { valid: errors.length === 0, errors };
}

export function assertValidImmutableReceipt(receipt, options) {
  const result = validateImmutableReceipt(receipt, options);
  if (!result.valid) throw new Error(`invalid immutable receipt: ${result.errors.join('; ')}`);
  return receipt;
}

function safeDestination(root, relativePath) {
  if (typeof relativePath !== 'string' || !relativePath || path.isAbsolute(relativePath) || relativePath.includes('\0')) throw new Error('receipt path must be a safe relative path');
  const rootPath = path.resolve(root);
  const destination = path.resolve(rootPath, relativePath);
  if (destination === rootPath || !destination.startsWith(`${rootPath}${path.sep}`)) throw new Error('receipt path escapes root');
  return destination;
}

export async function writeImmutableBytes(root, relativePath, bytes) {
  const destination = safeDestination(root, relativePath);
  const content = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes);
  await mkdir(path.dirname(destination), { recursive: true });
  try {
    const existing = await readFile(destination);
    if (existing.equals(content)) return { path: destination, created: false, sha256: sha256Bytes(content), bytes: content.length };
    throw new Error(`immutable receipt collision at ${relativePath}`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const temporary = `${destination}.tmp-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  let handle;
  try {
    handle = await open(temporary, 'wx', 0o600);
    await handle.writeFile(content);
    await handle.sync();
    await handle.close();
    handle = undefined;
    try {
      // A hard link publishes the fully synced temporary inode only when the
      // destination does not exist. Unlike rename(), this cannot overwrite a
      // receipt won by a concurrent writer on POSIX.
      await link(temporary, destination);
      return { path: destination, created: true, sha256: sha256Bytes(content), bytes: content.length };
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      const existing = await readFile(destination);
      if (!existing.equals(content)) throw new Error(`immutable receipt collision at ${relativePath}`);
      return { path: destination, created: false, sha256: sha256Bytes(content), bytes: content.length };
    }
  } finally {
    await handle?.close().catch(() => {});
    await rm(temporary, { force: true }).catch(() => {});
  }
}

export async function writeImmutableReceipt(root, relativePath, receipt, { contentBytes, prerequisites } = {}) {
  assertValidImmutableReceipt(receipt, { expectedBytes: contentBytes, expectedPrerequisites: prerequisites });
  return writeImmutableBytes(root, relativePath, canonicalJsonBytes(receipt));
}
