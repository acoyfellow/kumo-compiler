import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {emitSolidLibrary} from '../src/kumo/emitters/solid/index.mjs';
import {loadLibrary} from '../src/kumo/library/index.mjs';
import {compareMarkup} from '../scripts/observable-runner.mjs';

const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const digestTree = directory => sha(Buffer.from(fs.readdirSync(directory).sort().map(file => `${file}\0${sha(fs.readFileSync(path.join(directory, file)))}\n`).join('')));

test('Solid candidate emitter is generic, complete, deterministic, and consumable', t => {
  const first = fs.mkdtempSync(path.join(os.tmpdir(), 'kumo-solid-a-'));
  const second = fs.mkdtempSync(path.join(os.tmpdir(), 'kumo-solid-b-'));
  t.after(() => { fs.rmSync(first, {recursive:true, force:true}); fs.rmSync(second, {recursive:true, force:true}); });

  const a = emitSolidLibrary({outputPath:first});
  const b = emitSolidLibrary({outputPath:second});
  assert.equal(a.components.length, 41);
  assert.deepEqual(a.components.map(x => x.component), a.components.map(x => x.component).toSorted());
  assert.deepEqual(a.components, b.components);
  assert.equal(digestTree(first), digestTree(second));

  const manifest = JSON.parse(fs.readFileSync(path.join(first, 'manifest.json')));
  const pkg = JSON.parse(fs.readFileSync(path.join(first, 'package.json')));
  const library = loadLibrary();
  assert.deepEqual({candidate:manifest.candidate, count:manifest.count}, {candidate:true, count:41});
  assert.equal('readinessProof' in manifest, false);
  assert.deepEqual([pkg.name, pkg.version], ['@acoyfellow/kumo-solid', '0.0.1']);
  assert.deepEqual(Object.keys(pkg.exports), ['.', ...new Set(a.components.map(x => x.subpath))]);
  assert.deepEqual(manifest.components.map(x => x.modelDigest), library.models.map(x => x.modelDigest));
  assert.deepEqual(manifest.components.map(x => x.compoundPaths), library.models.map(model => model.composition.compoundExports?.paths.map(x => x.path) ?? []));
  assert.deepEqual(manifest.components.map(x => x.semanticVariants), library.models.map(model => (model.draftImplementation.semanticVariants ?? []).map(({id, expectationDigest}) => ({id, expectationDigest}))));
  assert.deepEqual(manifest.components.map(x => x.unresolvedSemanticOperations), library.models.map(model => model.unresolvedSemanticOperations ?? []));
  assert.equal(manifest.components.flatMap(x => x.semanticVariants).length, 62);
  assert.equal(manifest.components.flatMap(x => x.unresolvedSemanticOperations).length, 4);

  for (const item of manifest.components) {
    assert.equal(item.sha256, sha(fs.readFileSync(path.join(first, item.source))));
    assert.ok(fs.statSync(path.join(first, item.declaration)).size > 0);
    const lastForSubpath = manifest.components.findLast(x => x.subpath === item.subpath);
    assert.deepEqual(pkg.exports[item.subpath], {source:`./${lastForSubpath.source}`, types:`./${lastForSubpath.declaration}`});
  }
  assert.deepEqual(pkg.exports['.'], {source:'./index.ts', types:'./index.d.ts'});

  for (const [item, model] of manifest.components.map((item, index) => [item, library.models[index]])) {
    const source = fs.readFileSync(path.join(first, item.source), 'utf8');
    for (const pathValue of model.composition.compoundExports?.paths.map(x => x.path) ?? []) {
      assert.match(source, new RegExp(`data-kumo-part=\\${JSON.stringify(pathValue)}`));
      const segments = pathValue.split('.');
      assert.match(source, new RegExp(`Object\\.defineProperty\\([^\\n]+${segments.at(-1)}`));
    }
  }

  const output = path.join(first, 'typecheck');
  fs.symlinkSync(path.resolve('node_modules'), path.join(first, 'node_modules'), 'dir');
  execFileSync(path.resolve('node_modules/.bin/tsc'), [
    '--noEmit', '--strict', '--skipLibCheck', '--typeRoots', path.resolve('node_modules/@types'), '--target', 'ES2022', '--module', 'ESNext',
    '--moduleResolution', 'Bundler', '--jsx', 'preserve', '--jsxImportSource', 'solid-js',
    ...a.components.map(x => path.join(first, x.source)), path.join(first, 'index.ts')
  ], {stdio:'pipe'});
  fs.rmSync(path.join(first, 'node_modules'));
  assert.equal(fs.existsSync(output), false);

  const downstream = fs.readdirSync(first).filter(x => /\.(?:tsx|ts|json)$/.test(x)).map(x => fs.readFileSync(path.join(first, x), 'utf8')).join('\n');
  assert.doesNotMatch(downstream, /React|innerHTML|demo|@cloudflare\/|return\s+null/);
  const emitter = fs.readFileSync(new URL('../src/kumo/emitters/solid/index.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(emitter, /switch\s*\(\s*(?:model\.)?component|if\s*\(\s*(?:model\.)?component\s*===|case\s+["'](?:autocomplete|badge|banner|button|select)["']\s*:/);
});

test('Solid SSR renders every compiled semantic predicate through canonical markup comparison', async t => {
  const output = fs.mkdtempSync(path.join(os.tmpdir(), 'kumo-solid-ssr-'));
  const build = path.join(output, 'build');
  t.after(() => fs.rmSync(output, {recursive:true, force:true}));
  const result = emitSolidLibrary({outputPath:output});
  fs.symlinkSync(path.resolve('node_modules'), path.join(output, 'node_modules'), 'dir');
  const typed = path.join(output, 'typed'); fs.mkdirSync(typed);
  execFileSync(path.resolve('node_modules/.bin/tsc'), [
    '--outDir', typed, '--skipLibCheck', '--target', 'ES2022', '--module', 'ESNext', '--moduleResolution', 'Bundler', '--jsx', 'preserve', ...result.components.map(x => path.join(output, x.source))
  ], {stdio:'pipe'});
  fs.mkdirSync(build);
  const {transformFileAsync} = await import('@babel/core');
  for (const item of result.components) {
    const transformed = await transformFileAsync(path.join(typed, item.source.replace(/tsx$/, 'jsx')), {presets:[['babel-preset-solid',{generate:'ssr'}]]});
    fs.writeFileSync(path.join(build, item.source.replace(/tsx$/, 'js')), transformed.code);
  }
  const library = loadLibrary();
  for (const [item, model] of result.components.map((item, index) => [item, library.models[index]])) {
    const module = await import(path.join(build, item.source.replace(/tsx$/, 'js')) + `?${Date.now()}`);
    for (const variant of model.draftImplementation.semanticVariants ?? []) {
      const props = Object.fromEntries(variant.when.filter(x => x.kind === 'prop-equals').map(x => [x.name, x.value]));
      const fixture = variant.when.find(x => x.kind === 'fixture-equals')?.value;
      if (fixture !== undefined) props.fixture = fixture;
      const {renderToString} = await import('solid-js/web');
      const html = renderToString(() => module[item.symbol](props));
      const vector = library.semanticRender.components.find(x => x.component === model.component).vectors.find(x => x.id === variant.id);
      for (const constraint of vector.nodes) if (constraint.selector === ':root') {
        try { assert.equal(compareMarkup(html, {root:constraint.require}), true); }
        catch (error) { error.message = `${model.component}#${variant.id}: ${error.message}\n${html}`; throw error; }
      }
    }
  }
});
