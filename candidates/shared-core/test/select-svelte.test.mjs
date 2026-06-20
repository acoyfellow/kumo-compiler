import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { compile } from 'svelte/compiler';

const root = path.resolve(import.meta.dirname, '..');
const files = ['SelectRoot.svelte', 'SelectOption.svelte'];

test('Select Svelte view compiles for SSR and client hydration', () => {
  for (const file of files) {
    const source = fs.readFileSync(path.join(root, 'src/views/select/svelte', file), 'utf8');
    for (const generate of ['server', 'client']) {
      const result = compile(source, { filename: file, generate, modernAst: true, dev: true });
      assert.ok(result.js.code.length > 0, `${file} ${generate}`);
      assert.equal(result.warnings.filter((warning) => warning.code !== 'a11y_click_events_have_key_events').length, 0);
    }
  }
});

test('Select Svelte boundary stays thin and contains real semantic elements', () => {
  const directory = path.join(root, 'src/views/select/svelte');
  const sources = fs.readdirSync(directory).filter((file) => /\.(svelte|ts)$/.test(file)).map((file) => fs.readFileSync(path.join(directory, file), 'utf8'));
  const loc = sources.reduce((total, source) => total + source.split('\n').filter((line) => line.trim()).length, 0);
  assert.ok(loc <= 160, `native LOC ${loc} exceeds budget`);
  assert.match(sources[0] + sources[1], /<button/);
  assert.match(sources[0] + sources[1], /<ul/);
  assert.match(sources[0] + sources[1], /<li/);
  assert.doesNotMatch(sources.join('\n'), /innerHTML|{@html/);
});
