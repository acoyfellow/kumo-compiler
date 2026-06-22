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

test('Svelte SSR renders all 66 semantic variants through canonical root and descendant comparison',async t=>{
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
   const html=render(Component,{props}).body.replace(/<!--\[!?-?[\d]*-->|<!--\]-->/g,'').replace(/<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)([^>]*)\/>/g,'<$1$2></$1>').replace(/>\s+</g,'><').replace(/>\s+([^<])/g,'>$1').replace(/([^>])\s+</g,'$1<');
   const vector=library.semanticRender.components.find(x=>x.component===model.component).vectors.find(x=>x.id===variant.id);
   for(const constraint of vector.nodes){
    const expected={root:constraint.selector===':root'?constraint.require:{},...(constraint.selector===':root'?{}:{descendants:[{selector:constraint.selector,...constraint.require}]})};
    try{assert.equal(compareMarkup(html,expected),true);}
    catch(error){error.message=`${model.component}#${variant.id} ${constraint.selector}: ${error.message}\n${html}`;throw error;}
   }
   rendered++;
  }
 }
 assert.equal(rendered,66);
 assert.equal(manifest.components.flatMap(x=>x.unresolvedSemanticOperations).length,0);
});

test('supported toggle-control bindings lower to native Svelte 5 state and initial SSR',async t=>{
 const build=fs.mkdtempSync(path.join(os.tmpdir(),'kumo-svelte-toggle-'));
 t.after(()=>fs.rmSync(build,{recursive:true,force:true}));
 fs.symlinkSync(path.resolve('node_modules'),path.join(build,'node_modules'),'dir');
 emitSvelteLibrary({output});
 for(const [name,role] of [['checkbox','checkbox'],['switch','switch']]){
  const source=fs.readFileSync(path.join(output,`components/${name}.svelte`),'utf8');
  assert.match(source,/const controlledToggle = checked !== undefined/);
  assert.match(source,/\$state\(Boolean\(defaultChecked\)\)/);
  assert.match(source,/\$derived\(controlledToggle \? Boolean\(checked\) : uncontrolledChecked\)/);
  assert.match(source,/onclickcapture=\{activateToggle\}/);
  assert.doesNotMatch(source,new RegExp(`component\\s*===?\\s*["']${name}`,'i'));
  const compiled=compile(source,{filename:`${name}.svelte`,generate:'server'});
  const target=path.join(build,`${name}.mjs`);fs.writeFileSync(target,compiled.js.code);
  const Toggle=(await import(pathToFileURL(target)+`?${Date.now()}`)).default;
  assert.match(render(Toggle,{props:{}}).body,new RegExp(`role="${role}"[^>]*aria-checked="false"`));
  assert.match(render(Toggle,{props:{defaultChecked:true}}).body,/aria-checked="true"/);
  assert.match(render(Toggle,{props:{checked:false,defaultChecked:true,disabled:true}}).body,/aria-checked="false"[^>]*disabled/);
 }
 const checkbox=fs.readFileSync(path.join(output,'components/checkbox.svelte'),'utf8');
 assert.match(render((await import(pathToFileURL(path.join(build,'checkbox.mjs'))+`?indeterminate`)).default,{props:{indeterminate:true}}).body,/aria-checked="mixed"/);
 for(const name of ['radio','field']){
  const source=fs.readFileSync(path.join(output,`components/${name}.svelte`),'utf8');
  assert.doesNotMatch(source,/controlledToggle|activateToggle|onclickcapture=\{activateToggle\}/);
 }
});

test('supported native input controls lower from capabilities with reactive Svelte 5 props',()=>{
 emitSvelteLibrary({output});
 for(const [name,tag] of [['input','input'],['input-area','textarea']]){
  const source=fs.readFileSync(path.join(output,`components/${name}.svelte`),'utf8');
  assert.match(source,new RegExp(`<${tag} \\{\\.\\.\\.rest\\} value=\\{defaultValue\\} disabled=\\{Boolean\\(disabled\\)\\}`));
  assert.match(source,/let \{[\s\S]*defaultValue = undefined,[\s\S]*disabled = false,[\s\S]*onInput = undefined,[\s\S]*onFocus = undefined,[\s\S]*\}: Props = \$props\(\)/);
  assert.match(source,/oninput=\{handleNativeInput\} onfocus=\{handleNativeFocus\}/);
  assert.match(source,/onInput\?\.\(\(event\.currentTarget as HTMLInputElement \| HTMLTextAreaElement\)\.value\)/);
  assert.match(source,/onFocus\?\.\(event\)/);
  assert.doesNotMatch(source,new RegExp(`model\\.component\\s*===?\\s*["']${name}["']`,'i'));
  compile(source,{filename:`${name}.svelte`,generate:'client'});
 }
 for(const name of ['field','sensitive-input']){
  const source=fs.readFileSync(path.join(output,`components/${name}.svelte`),'utf8');
  assert.doesNotMatch(source,/handleNativeInput|oninput=\{handleNativeInput\}|defaultValue = undefined/);
 }
});

test('native input lowering architecture remains registry-driven and deterministic across two emissions',()=>{
 const emitter=fs.readFileSync(path.resolve('src/kumo/emitters/svelte/index.mjs'),'utf8');
 assert.match(emitter,/id==='native-input-control'/);
 assert.match(emitter,/nativeField\.controls\.find/);
 assert.match(emitter,/nativeControls\.specs\.find/);
 assert.doesNotMatch(emitter,/model\.component\s*===?\s*["'](?:input|input-area|field|sensitive-input)["']/);
 const first=emitSvelteLibrary({output});
 const sources=new Map(first.components.map(x=>[x.component,fs.readFileSync(path.join(output,x.file),'utf8')]));
 const second=emitSvelteLibrary({output});
 for(const entry of second.components)assert.equal(fs.readFileSync(path.join(output,entry.file),'utf8'),sources.get(entry.component));
});

test('toggle lowering architecture remains registry-driven and deterministic across two emissions',()=>{
 const emitter=fs.readFileSync(path.resolve('src/kumo/emitters/svelte/index.mjs'),'utf8');
 assert.match(emitter,/behaviorCapabilities\.bindings\.find/);
 assert.match(emitter,/controlledState\.specs\.find/);
 assert.match(emitter,/nativeControls\.specs\.find/);
 assert.doesNotMatch(emitter,/model\.component\s*===?\s*["'](?:checkbox|switch)["']/);
 const first=emitSvelteLibrary({output});
 const sources=new Map(first.components.map(x=>[x.component,fs.readFileSync(path.join(output,x.file),'utf8')]));
 const second=emitSvelteLibrary({output});
 for(const entry of second.components)assert.equal(fs.readFileSync(path.join(output,entry.file),'utf8'),sources.get(entry.component));
});

test('native-button capability emits four interactive initial DOM states',async t=>{
 const build=fs.mkdtempSync(path.join(os.tmpdir(),'kumo-svelte-button-'));
 t.after(()=>fs.rmSync(build,{recursive:true,force:true}));
 fs.symlinkSync(path.resolve('node_modules'),path.join(build,'node_modules'),'dir');
 emitSvelteLibrary({output});
 const source=fs.readFileSync(path.join(output,'components/button.svelte'),'utf8');
 assert.doesNotMatch(source,/component\s*===?\s*["']button/i);
 assert.match(source,/<button \{\.\.\.rest\} type=\{type\} disabled=\{Boolean\(disabled \|\| loading\)\}/);
 const compiled=compile(source,{filename:'button.svelte',generate:'server'});
 const target=path.join(build,'button.mjs');fs.writeFileSync(target,compiled.js.code);
 const Button=(await import(pathToFileURL(target)+`?${Date.now()}`)).default;
 const child=()=>({out:{push(value){this.value=(this.value??'')+value;}}});
 const vectors=[
  [{children:child},/<button[^>]* type="button"[^>]*>.*<\/button>/],
  [{children:child,disabled:true},/<button[^>]* disabled[^>]*>/],
  [{children:child,loading:true},/<button[^>]* disabled[^>]*>.*<svg aria-hidden="true"><\/svg>/],
  [{children:child,type:'submit','data-native':'yes'},/<button[^>]*data-native="yes"[^>]*type="submit"[^>]*>/]
 ];
 for(const [props,expected] of vectors)assert.match(render(Button,{props}).body.replace(/<!--[\s\S]*?-->/g,''),expected);
});

test('resolution receipt canonically binds capability and generated manifest hashes',()=>{
 const receiptPath=path.resolve('proof/dx/conformance/diagnostics/semantic-emitter-svelte-resolution.json');
 const receipt=JSON.parse(fs.readFileSync(receiptPath,'utf8'));
 const {receiptHash,...canonical}=receipt;
 const {contentBindings}=loadLibrary();
 assert.equal(receipt.status,'passed');
 assert.equal(receipt.semanticVariants,66);
 assert.equal(receipt.unresolvedSemanticOperations,0);
 assert.match(receiptHash,/^[a-f0-9]{64}$/);
 assert.equal(receiptHash,hash(JSON.stringify(canonical)));
 assert.equal(receipt.contentBindingsCapabilityDigest,contentBindings.capabilityDigest);
 assert.match(receipt.svelteManifestSha256,/^[a-f0-9]{64}$/);
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
