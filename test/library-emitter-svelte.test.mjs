import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {pathToFileURL} from 'node:url';
import {compile} from 'svelte/compiler';
import {render} from 'svelte/server';
import {emitSvelteLibrary} from '../src/kumo/emitters/svelte/index.mjs';
import {loadLibrary} from '../src/kumo/library/index.mjs';
import {compareMarkup} from '../scripts/observable-runner.mjs';

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

test('Svelte SSR renders all 62 semantic variants through canonical root and descendant comparison',async t=>{
 const build=fs.mkdtempSync(path.join(os.tmpdir(),'kumo-svelte-ssr-'));
 t.after(()=>fs.rmSync(build,{recursive:true,force:true}));
 fs.symlinkSync(path.resolve('node_modules'),path.join(build,'node_modules'),'dir');
 const manifest=emitSvelteLibrary({output});
 const library=loadLibrary();
 let rendered=0;
 for(const [entry,model] of manifest.components.map((entry,index)=>[entry,library.models[index]])){
  const source=fs.readFileSync(path.join(output,entry.file),'utf8');
  const compiled=compile(source,{filename:entry.file,generate:'server'});
  const target=path.join(build,`${entry.component}.mjs`);fs.writeFileSync(target,compiled.js.code);
  const Component=(await import(pathToFileURL(target)+`?${Date.now()}`)).default;
  for(const variant of model.draftImplementation.semanticVariants??[]){
   const props=Object.fromEntries(variant.when.filter(x=>x.kind==='prop-equals'&&x.name!=='children').map(x=>[x.name,x.value]));
   const content=variant.when.find(x=>x.kind==='prop-equals'&&x.name==='children')?.value;
   if(content!==undefined){props.children=()=>({out:{push(value){this.value=(this.value??'')+value;}}});props.__consumerContent=content;}
   const fixture=variant.when.find(x=>x.kind==='fixture-equals')?.value;if(fixture!==undefined)props.fixture=fixture;
   const html=render(Component,{props}).body.replace(/<!--\[!?[\d]*-->|<!--\]-->/g,'').replace(/<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)([^>]*)\/>/g,'<$1$2></$1>').replace(/>\s+</g,'><').replace(/>\s+([^<])/g,'>$1').replace(/([^>])\s+</g,'$1<');
   const vector=library.semanticRender.components.find(x=>x.component===model.component).vectors.find(x=>x.id===variant.id);
   for(const constraint of vector.nodes){
    const expected={root:constraint.selector===':root'?constraint.require:{},...(constraint.selector===':root'?{}:{descendants:[{selector:constraint.selector,...constraint.require}]})};
    try{assert.equal(compareMarkup(html,expected),true);}
    catch(error){error.message=`${model.component}#${variant.id} ${constraint.selector}: ${error.message}\n${html}`;throw error;}
   }
   rendered++;
  }
 }
 assert.equal(rendered,62);
 assert.equal(manifest.components.flatMap(x=>x.unresolvedSemanticOperations).length,4);
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
