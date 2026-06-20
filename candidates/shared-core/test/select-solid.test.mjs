import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import * as esbuild from 'esbuild';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const entry=path.join(root,'src/views/select/solid/index.tsx');
test('Solid Select is an independently compilable native view',async()=>{
  const result=await esbuild.build({entryPoints:[entry],bundle:true,write:false,format:'esm',platform:'browser',jsx:'automatic',jsxImportSource:'solid-js'});
  assert.ok(result.outputFiles[0].text.includes('role'));
});
test('Solid Select fixture uses real semantic elements and core transitions',()=>{
  const source=fs.readFileSync(entry,'utf8');
  for(const tag of ['<button','<ul','<li','<label'])assert.ok(source.includes(tag));
  assert.match(source,/transition\(state\(\),event\)/);
  assert.doesNotMatch(source,/innerHTML|Dynamic|createRoot/);
});
