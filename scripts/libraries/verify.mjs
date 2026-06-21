import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const dir = resolve(root, 'library-artifacts');
const manifest = JSON.parse(await readFile(resolve(dir, 'manifest.json'), 'utf8'));
if (manifest.packages.length !== 3) throw new Error('expected exactly three library packages');
for (const entry of manifest.packages) {
  for (const name of [entry.artifact, entry.friendlyName]) {
    const bytes = await readFile(resolve(dir, name));
    const digest = createHash('sha256').update(bytes).digest('hex');
    if (digest !== entry.sha256) throw new Error(`${name}: sha256 mismatch`);
    if (bytes.length !== entry.bytes) throw new Error(`${name}: byte count mismatch`);
  }
  if (entry.installUrl !== `/packages/${entry.friendlyName}`) throw new Error(`${entry.framework}: invalid install URL`);
}
console.log('Verified 3 library packages and manifest');
