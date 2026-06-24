#!/usr/bin/env node
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { build } from './lower.mjs';
import { assertTrustedCDP, cells } from './native-harness.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../../../..');
const first = await build(), snapshots = new Map();
for (const shard of first.manifest.shards) snapshots.set(shard.path, await readFile(join(here, 'generated', shard.path), 'utf8'));
const second = await build();
assert.deepEqual(first.manifest, second.manifest, 'output manifest must be deterministic');
assert.equal(first.manifest.inputs.planSchema, 'kumo.lowering-plan/v1');
assert.equal(first.manifest.guardSource, 'passed');
assert.ok(first.manifest.ssr && first.manifest.hydratable);
assert.equal(cells().length, 36, 'native harness must cover every component/state/viewport cell');
assertTrustedCDP([{ method: 'Input.dispatchMouseEvent', params: { type: 'mousePressed' } }]);
assert.throws(() => assertTrustedCDP([{ method: 'Runtime.evaluate', params: { expression: 'node.click()' } }]));
const outputRoot = join(here, '../outputs/solid');
for (const cell of cells()) {
  const directory = join(outputRoot, cell.component, cell.state, String(cell.viewport));
  for (const name of ['trace.json', 'screenshot.png', 'provenance.json']) assert.ok(existsSync(join(directory, name)), `missing ${name} for ${cell.component}/${cell.state}/${cell.viewport}`);
  const provenance = JSON.parse(await readFile(join(directory, 'provenance.json'), 'utf8'));
  assert.equal(provenance.target, 'solid');
  assert.equal(provenance.capture.independent, true);
  assert.equal(provenance.capture.canonicalArtifactUsed, false);
  assert.equal(provenance.capture.driver, 'CDP Input');
  assert.equal(provenance.servedHarness.ssr, true);
  assert.equal(provenance.servedHarness.hydrated, true);
  for (const key of ['generatedSourceDigest','lowererDigest','nativeCompilerDigest','nativeBuildDigest','servedHarnessDigest','captureDigest','traceDigest','screenshotDigest']) assert.match(provenance[key], /^[a-f0-9]{64}$/, `${key} must bind the capture`);
}
for (const shard of second.manifest.shards) {
  const source = await readFile(join(here, 'generated', shard.path), 'utf8');
  assert.equal(source, snapshots.get(shard.path));
  assert.match(source, /from "solid-js"/);
  assert.doesNotMatch(source, /react|tracer|canonical|innerHTML/i);
  assert.equal(shard.provenance.planDigest.length, 64);
}
const temporary = await mkdtemp(join(tmpdir(), 'kumo-solid-check-'));
try {
  await writeFile(join(temporary, 'entry.tsx'), second.files.map((file, index) => `import { ${file.path.slice(0, -4).replace(/(^|[^A-Za-z0-9]+)(.)/g, (_a,_b,c)=>c.toUpperCase())} as C${index} } from ${JSON.stringify(join(here, 'generated', file.path))};\nvoid C${index};`).join('\n'));
  await writeFile(join(temporary, 'vite.config.mjs'), `import { defineConfig } from ${JSON.stringify(join(root, 'node_modules/vite/dist/node/index.js'))};\nimport solid from ${JSON.stringify(join(root, 'node_modules/vite-plugin-solid/dist/esm/index.mjs'))};\nexport default defineConfig({ plugins: [solid({ ssr: true })], build: { ssr: ${JSON.stringify(join(temporary, 'entry.tsx'))}, outDir: ${JSON.stringify(join(temporary, 'dist'))} } });\n`);
  const vite = spawnSync(process.execPath, [join(root, 'node_modules/vite/bin/vite.js'), 'build', '--config', join(temporary, 'vite.config.mjs')], { cwd: root, encoding: 'utf8' });
  assert.equal(vite.status, 0, `Solid/Vite compile failed:\n${vite.stdout}\n${vite.stderr}`);
} finally { await rm(temporary, { recursive: true, force: true }); }
console.log('Solid lowerer self-check passed (including Solid/Vite SSR compile)');
