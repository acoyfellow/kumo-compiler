import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { relative, resolve, sep } from 'node:path';

export const DEPLOY_DIGEST_ALGORITHM = 'sha256-tree-v1';
export const PROTECTED_DEPLOY_PATHS = ['deploy-manifest.json', 'wrangler.jsonc', 'worker.mjs'];

async function filesBelow(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesBelow(path));
    else if (entry.isFile()) files.push(path);
    else throw new Error(`deploy payload contains unsupported entry: ${path}`);
  }
  return files;
}

export async function deployPayloadDigest(directory) {
  const root = resolve(directory);
  const hash = createHash('sha256');
  const files = (await filesBelow(root)).sort((a, b) => a.localeCompare(b));
  for (const file of files) {
    const path = relative(root, file).split(sep).join('/');
    if (!path || path.startsWith('../') || path.includes('\0')) throw new Error(`invalid deploy payload path: ${path}`);
    hash.update(`${path}\0`);
    hash.update(await readFile(file));
    hash.update('\0');
  }
  return { algorithm: DEPLOY_DIGEST_ALGORITHM, sha256: hash.digest('hex'), files: files.length };
}
