import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {compile} from 'svelte/compiler';
import {emitSvelteLibrary} from '../src/kumo/emitters/svelte/index.mjs';
import {loadLibrary} from '../src/kumo/library/index.mjs';

const output=path.resolve('generated/libraries/svelte');
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');

test('emits exactly 41 sorted deterministic native Svelte components',()=>{
 const first=emitSvelteLibrary({output});
 const bytes=new Map(first.components.map(x=>[x.file,fs.readFileSync(path.join(output,x.file))]));
 const second=emitSvelteLibrary({output});
 assert.equal(second.count,41);
 assert.deepEqual(second.components.map(x=>x.component),[...second.components.map(x=>x.component)].sort((a,b)=>a.localeCompare(b)));
 for(const entry of second.components){
  const source=fs.readFileSync(path.join(output,entry.file));
  assert.deepEqual(source,bytes.get(entry.file));
  assert.equal(hash(source),entry.sha256);
  assert.doesNotMatch(source.toString(),/\bReact\b|react-dom|@html|innerHTML|customElement|<svelte:options|runtime wrapper|demo content/i);
  const compiled=compile(source.toString(),{filename:entry.file,generate:'client'});
  assert.match(compiled.js.code,/svelte\/internal\/client/);
 }
});

test('binds model digests and publishes root and per-component metadata',()=>{
 const {models}=loadLibrary();
 const manifest=JSON.parse(fs.readFileSync(path.join(output,'manifest.json'),'utf8'));
 assert.ok(manifest.exports['.']);
 for(const model of models){
  const entry=manifest.components.find(x=>x.component===model.component);
  assert.equal(entry.modelDigest,model.modelDigest);
  assert.deepEqual(entry.exports,model.public.exports);
  assert.ok(manifest.exports[model.public.subpath.replace('./components/','./')]);
  assert.match(fs.readFileSync(path.join(output,`components/${model.component}.svelte.d.ts`),'utf8'),new RegExp(model.modelDigest));
 }
 assert.ok(fs.existsSync(path.join(output,'index.d.ts')));
 assert.doesNotMatch(fs.readFileSync(path.join(output,'index.js'),'utf8'),/generated\/libraries\/svelte\/components/);
});

test('emits every canonical compound path as a native resolvable Svelte binding',()=>{
 const {models}=loadLibrary();
 const manifest=JSON.parse(fs.readFileSync(path.join(output,'manifest.json'),'utf8'));
 const expected=models.flatMap(model=>(model.composition?.compoundExports?.paths??[]).map(item=>({component:model.component,path:item.path,binding:`${model.composition.compoundExports.canonicalRoot}${item.path.split('.').join('')}`})));
 assert.deepEqual(manifest.compoundExports.map(({component,path,binding})=>({component,path,binding})),expected);
 const root=fs.readFileSync(path.join(output,'index.js'),'utf8');
 for(const entry of manifest.compoundExports){
  const target=manifest.exports[entry.subpath];
  assert.ok(target,entry.subpath);
  assert.equal(target.svelte,entry.file);
  assert.match(root,new RegExp(`default as ${entry.binding}\\b`));
  const source=fs.readFileSync(path.join(output,entry.file),'utf8');
  assert.match(source,new RegExp(`data-kumo-part=${JSON.stringify(entry.path)}`));
  assert.match(source,/\{@render children\(\)\}/);
  assert.match(source,/\{\.\.\.rest\}/);
  assert.doesNotMatch(source,/\bReact\b|@html|customElement|<svelte:options/i);
  compile(source,{filename:entry.file,generate:'client'});
  assert.ok(fs.existsSync(path.join(output,target.types)));
 }
});
