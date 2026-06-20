import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const legacy = ['compiler.mjs','button-compiler.mjs','dialog-compiler.mjs','native-control-compiler.mjs','popover-compiler.mjs','form-compiler.mjs','navigation-compiler.mjs','data-presentational-compiler.mjs','selection-command-date-compiler.mjs','select-proof.mjs','button-proof.mjs','dialog-proof.mjs','native-control-proof.mjs','popover-proof.mjs','form-proof.mjs','navigation-proof.mjs','data-presentational-proof.mjs','selection-command-date-proof.mjs'];

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.filter(e => !['node_modules','.git','.wrangler','dist','deploy','generated','runtime','runtime-canonical'].includes(e.name)).map(e => e.isDirectory() ? sourceFiles(resolve(directory,e.name)) : [resolve(directory,e.name)]))).flat();
}

test('legacy generators, proof orchestration, and machine-local paths stay deleted', async () => {
  const pkg = await readFile(resolve(root, 'package.json'), 'utf8');
  for (const name of legacy) assert.ok(!pkg.includes(name), `package command reintroduced ${name}`);
  const files = (await sourceFiles(root)).filter(file => /\.(?:mjs|js|ts|json|md)$/.test(file) && file !== import.meta.filename);
  for (const file of files) {
    const text = await readFile(file, 'utf8');
    for (const name of legacy) assert.ok(!text.includes(name), `legacy boundary reference ${name} in ${file.slice(root.length + 1)}`);
    assert.ok(!/(?:\/Users\/|\/home\/|[A-Z]:\\)(?:[^\n"']*\/)?SLOP(?:\/|\\)|\/Users\/[^\s"']+|\/home\/[^\s"']+/.test(text), `absolute/SLOP source path in ${file.slice(root.length + 1)}`);
  }
});
