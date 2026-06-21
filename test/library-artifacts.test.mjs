import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const artifacts = resolve(root, 'library-artifacts');
const manifest = JSON.parse(await readFile(resolve(artifacts, 'manifest.json'), 'utf8'));
for (const entry of manifest.packages) test(`hosted ${entry.framework} tarball installs with Button and Field only`, async () => {
  const cwd = await mkdtemp(resolve(tmpdir(), `kumo-${entry.framework}-consumer-`));
  await writeFile(resolve(cwd, 'package.json'), JSON.stringify({ type: 'module', dependencies: { [entry.package]: `file:${resolve(artifacts, entry.friendlyName)}` } }));
  let result = spawnSync('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund'], { cwd, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const installed = JSON.parse(await readFile(resolve(cwd, 'node_modules', ...entry.package.split('/'), 'package.json'), 'utf8'));
  assert.ok(installed.exports['./button'] && installed.exports['./field']);
  assert.equal(installed.exports['./select'], undefined);
  assert.equal(installed.exports['./tabs'], undefined);
  // Vue's published JS is directly importable; Svelte/Solid source imports require their framework loaders.
  if (entry.framework === 'vue') {
    result = spawnSync(process.execPath, ['--input-type=module', '--eval', `import * as lib from '${entry.package}'; if (!lib.Button || !lib.Field || lib.Select || lib.Tabs) process.exit(1)`], { cwd, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
  }
  await rm(cwd, { recursive: true, force: true });
});
