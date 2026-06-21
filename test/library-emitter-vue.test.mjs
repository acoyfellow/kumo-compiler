import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {parse, compileScript, compileTemplate} from '@vue/compiler-sfc';
import {generateVueLibrary} from '../src/kumo/emitters/vue/index.mjs';

const output = path.resolve('generated/libraries/vue');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');

test('generic Vue emitter creates deterministic, native, tree-shakeable candidate output', () => {
  const first = generateVueLibrary(output);
  assert.equal(first.count, 41);
  assert.deepEqual(first.components.map(x => x.component), first.components.map(x => x.component).toSorted());
  assert.equal(new Set(first.components.map(x => x.file)).size, 41);
  const bytes = new Map(first.components.map(entry => [entry.file, fs.readFileSync(path.join(output,entry.file))]));
  const second = generateVueLibrary(output);
  assert.deepEqual(second, first);
  for (const entry of second.components) {
    const source = fs.readFileSync(path.join(output,entry.file));
    assert.deepEqual(source, bytes.get(entry.file));
    assert.equal(hash(source), entry.sha256);
    assert.equal(source.includes(entry.modelDigest), true);
    assert.doesNotMatch(source.toString(), /(?:from ["'][^"']*react|innerHTML|runtime wrapper|source template)/i);
    const parsed = parse(source.toString(), {filename:entry.file});
    assert.deepEqual(parsed.errors, []);
    assert.doesNotThrow(() => compileScript(parsed.descriptor,{id:entry.component}));
    assert.deepEqual(compileTemplate({source:parsed.descriptor.template.content,filename:entry.file,id:entry.component}).errors, []);
    assert.equal(fs.existsSync(path.join(output,`components/${entry.component}.d.ts`)), true);
    assert.deepEqual(first.exports[`./components/${entry.component}`], {vue:`./${entry.file}`,types:`./components/${entry.component}.d.ts`,canonicalSubpath:entry.subpath});
  }
  assert.deepEqual(first.exports['.'], {vue:'./index.ts',types:'./index.d.ts'});
});
