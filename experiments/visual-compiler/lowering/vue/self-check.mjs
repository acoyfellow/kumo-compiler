#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc';
import { compile } from './lower.mjs';
import { guardSource } from '../core/guard.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const ir = JSON.parse(fs.readFileSync(path.join(root, 'ir/fixtures/components.json'), 'utf8'));
const digest = file => crypto.createHash('sha256').update(fs.readFileSync(path.join(here, file))).digest('hex');
assert.equal(typeof fs.readFileSync(path.join(here, 'capture.mjs'), 'utf8'), 'string', 'native capture harness missing');
const first = compile();
const bytes = new Map(first.map(output => [output.file, fs.readFileSync(path.join(here, output.file), 'utf8')]));
const second = compile();
assert.deepEqual(first, second, 'lowering must be byte deterministic');

let compilerBuilds = 0;
for (const output of first) {
  assert.equal(digest(output.file), output.sha256, `digest mismatch: ${output.file}`);
  if (!output.file.endsWith('.vue')) continue;
  const source = bytes.get(output.file);
  assert.doesNotMatch(source, /v-html|innerHTML|react|trace\.dom|tracer\/artifacts/i, `forbidden construct: ${output.file}`);
  const filename = path.join(here, output.file);
  const parsed = parse(source, { filename });
  assert.deepEqual(parsed.errors, [], `Vue parse failed: ${output.file}`);
  const script = compileScript(parsed.descriptor, { id: output.sha256.slice(0, 8) });
  const template = compileTemplate({ id: output.sha256.slice(0, 8), filename, source: parsed.descriptor.template.content, compilerOptions: { bindingMetadata: script.bindings, mode: 'module' }, ssr: true, cssVars: [] });
  assert.deepEqual(template.errors, [], `Vue SSR compiler failed: ${output.file}`);
  assert.match(template.code, /ssrRender|createVNode|createBlock/, `no native Vue compiler output: ${output.file}`);
  compilerBuilds++;
}
const ids = { componentIds: ir.components.map(item => item.name), partIds: [...new Set(ir.components.flatMap(item => item.parts.map(part => part.id)))] };
const guarded = guardSource(fs.readFileSync(path.join(here, 'lower.mjs'), 'utf8'), ids);
assert.equal(guarded.valid, true, JSON.stringify(guarded.diagnostics));
const harnessResultsFile = path.join(here, 'harness-results.json');
assert.ok(fs.existsSync(harnessResultsFile), 'run capture.mjs before self-check');
const harness = JSON.parse(fs.readFileSync(harnessResultsFile, 'utf8'));
assert.equal(harness.status, 'passed', 'native harness capture failed');
assert.equal(harness.cells, 36, 'native harness must capture 36 cells');
assert.equal(harness.ssrHydrated, true, 'all captures must hydrate SSR');
assert.equal(harness.trustedCDP, true, 'captures must use trusted CDP input');
console.log(JSON.stringify({ status: 'passed', deterministic: true, outputs: first.length, compilerBuilds, harness: { cells: harness.cells, ssrHydrated: harness.ssrHydrated, trustedCDP: harness.trustedCDP }, guardSource: guarded }, null, 2));
