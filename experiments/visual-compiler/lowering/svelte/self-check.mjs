#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { compile } from 'svelte/compiler';
import { guardSource } from '../core/guard.mjs';
import { lower } from './lower.mjs';
const sha = value => createHash('sha256').update(value).digest('hex');
const ir = JSON.parse(await readFile(new URL('../../ir/fixtures/components.json', import.meta.url), 'utf8'));
const source = await readFile(new URL('./lower.mjs', import.meta.url), 'utf8');
const ids = { componentIds: ir.components.map(item => item.name), partIds: ir.components.flatMap(item => item.parts.map(part => part.id)) };
const guarded = guardSource(source, ids);
if (!guarded.valid) throw new Error(`guardSource rejected lowerer: ${JSON.stringify(guarded.diagnostics)}`);
if (/tracer\/results|frontend\/|react/i.test(source)) throw new Error('lowerer reads forbidden canonical/runtime input');
const one = await lower({ write: true });
const two = await lower({ write: false });
if (JSON.stringify(one) !== JSON.stringify(two)) throw new Error('non-deterministic lowering');
for (const file of one.files) {
  if (sha(file.content) !== file.sha256) throw new Error(`bad digest: ${file.path}`);
  compile(file.content, { filename: file.path, generate: 'server' });
  compile(file.content, { filename: file.path, generate: 'client' });
  if (!file.provenance.coreIRSha256 || !file.provenance.planShardDigest) throw new Error(`missing provenance: ${file.path}`);
  if (!file.content.includes('viewport = 1440')) throw new Error(`missing viewport-specialized lowering: ${file.path}`);
  if (/\{#if\s+(?:component|part)\b/.test(file.content)) throw new Error(`forbidden component/part branch: ${file.path}`);
}
if (!one.files.some(file => file.content.includes('{#if '))) throw new Error('missing conditional node presence');
const generatedSourceDigest = sha(Buffer.concat(one.files.map(file => Buffer.from(file.content))));
const lowererDigest = sha(source);
const capture = JSON.parse(await readFile(new URL('./capture-results.json', import.meta.url), 'utf8'));
if (capture.status !== 'passed' || capture.coverage.cells !== 36) throw new Error('native capture coverage is not passed');
for (const record of capture.records) {
  const dir = new URL(`../outputs/svelte/${record.component}/${record.state}/${record.viewport}/`, import.meta.url);
  for (const name of ['trace.json', 'screenshot.png', 'provenance.json']) if (!existsSync(new URL(name, dir))) throw new Error(`missing ${name} for ${record.component}/${record.state}/${record.viewport}`);
  const provenance = JSON.parse(await readFile(new URL('provenance.json', dir), 'utf8'));
  for (const key of ['generatedSourceDigest','lowererDigest','nativeCompilerDigest','nativeBuildDigest','servedHarnessDigest','captureDigest']) if (!/^[a-f0-9]{64}$/.test(provenance[key])) throw new Error(`bad provenance ${key}`);
  if (provenance.generatedSourceDigest !== generatedSourceDigest || provenance.lowererDigest !== lowererDigest) throw new Error(`stale capture source/lowerer digest: ${record.component}/${record.state}/${record.viewport}`);
  if (provenance.nativeBuildDigest !== capture.digests.build || provenance.servedHarness.buildDigest !== capture.digests.build || provenance.capture.buildDigest !== capture.digests.build || provenance.servedHarnessDigest !== capture.digests.harness || provenance.capture.harnessDigest !== capture.digests.harness) throw new Error(`stale capture build/harness digest: ${record.component}/${record.state}/${record.viewport}`);
  if (!provenance.capture.independent || provenance.capture.canonicalArtifactUsed || !provenance.servedHarness.ssr || !provenance.servedHarness.hydrated) throw new Error('invalid independent native capture provenance');
}
console.log(`passed: ${one.files.length} deterministic Svelte 5 shards and 36 independent SSR/hydrate CDP captures`);
