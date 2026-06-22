import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {pathToFileURL} from 'node:url';
import {createSSRApp, h} from 'vue';
import {renderToString} from '@vue/server-renderer';
import {loadLibrary} from '../src/kumo/library/index.mjs';
import {compareMarkup} from '../scripts/observable-runner.mjs';
import ts from 'typescript';
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
  const index = fs.readFileSync(path.join(output,'index.ts'),'utf8');
  assert.equal(first.compoundPaths.length > 0, true);
  for (const part of first.compoundPaths) {
    assert.match(part.binding, /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)+$/);
    assert.equal(fs.existsSync(path.join(output,part.file)), true);
    assert.equal(fs.existsSync(path.join(output,part.types)), true);
    const source = fs.readFileSync(path.join(output,part.file),'utf8');
    assert.equal(hash(source), part.sha256);
    assert.match(source, new RegExp(`data-kumo-part="${part.path}"`));
    assert.match(source, /v-bind="\$attrs"/);
    assert.match(source, /<slot \/>/);
    assert.doesNotMatch(source, /(?:react|innerHTML|<script[^>]*src=|demo)/i);
    const parsed = parse(source, {filename:part.file});
    assert.deepEqual(parsed.errors, []);
    assert.doesNotThrow(() => compileScript(parsed.descriptor,{id:part.binding}));
    assert.deepEqual(compileTemplate({source:parsed.descriptor.template.content,filename:part.file,id:part.binding}).errors, []);
    assert.deepEqual(first.exports[`./${part.file.slice(0,-4)}`], {vue:`./${part.file}`,types:`./${part.types}`,binding:part.binding});
    assert.match(index, new RegExp(`export const ${part.root} = Object\\.assign`));
  }
});


async function compileSSRComponent(entry, build) {
  const source=fs.readFileSync(path.join(output,entry.file),'utf8'), parsed=parse(source,{filename:entry.file});
  const script=compileScript(parsed.descriptor,{id:entry.component,genDefaultAs:'__component'});
  const template=compileTemplate({source:parsed.descriptor.template.content,filename:entry.file,id:entry.component,ssr:true,cssVars:[],compilerOptions:{bindingMetadata:script.bindings,hoistStatic:false}});
  assert.deepEqual(template.errors,[]);
  let code=script.content.replace(/export const /g,'const ').replace(/export default __component\s*;?/,'');
  code=code.replace('const __component = /*@__PURE__*/','const __component = ');
  code += '\n'+template.code.replace('export function ssrRender','function ssrRender')+'\n__component.ssrRender=ssrRender; export default __component;';
  code=ts.transpileModule(code,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
  const target=path.join(build,`${entry.component}.mjs`); fs.writeFileSync(target,code);
  return (await import(pathToFileURL(target)+`?${Date.now()}`)).default;
}

test('Vue SSR renders all 66 semantic variants through canonical root and descendant comparison', async t => {
  const build=fs.mkdtempSync(path.resolve('.kumo-vue-ssr-')); t.after(()=>fs.rmSync(build,{recursive:true,force:true}));
  const manifest=generateVueLibrary(output), library=loadLibrary(); let rendered=0;
  for(const [entry,model] of manifest.components.map((entry,index)=>[entry,library.models[index]])){
    const Component=await compileSSRComponent(entry,build);
    for(const variant of model.draftImplementation.semanticVariants??[]){
      const props=Object.fromEntries(variant.when.filter(x=>x.kind==='prop-equals'&&x.name!=='children').map(x=>[x.name,x.value]));
      const content=variant.when.find(x=>x.kind==='prop-equals'&&x.name==='children')?.value;
      const fixture=variant.when.find(x=>x.kind==='fixture-equals')?.value;if(fixture!==undefined)props.fixture=fixture;
      const html=(await renderToString(createSSRApp({setup:()=>()=>h(Component,props,content===undefined?{}:{default:()=>content})}))).replace(/<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)([^>]*)>/g,'<$1$2></$1>');
      const vector=library.semanticRender.components.find(x=>x.component===model.component).vectors.find(x=>x.id===variant.id);
      for(const constraint of vector.nodes){
        const expected={root:constraint.selector===':root'?constraint.require:{},...(constraint.selector===':root'?{}:{descendants:[{selector:constraint.selector,...constraint.require}]})};
        try{assert.equal(compareMarkup(html,expected),true);}catch(error){error.message=`${model.component}#${variant.id} ${constraint.selector}: ${error.message}\n${html}`;throw error;}
      }
      rendered++;
    }
  }
  assert.equal(rendered,66); assert.equal(manifest.components.flatMap(x=>x.unresolvedSemanticOperations).length,0);
});

test('Vue native-button capability compiles and SSR renders four interactive initial DOM states', async t => {
  const build=fs.mkdtempSync(path.resolve('.kumo-vue-button-')); t.after(()=>fs.rmSync(build,{recursive:true,force:true}));
  const manifest=generateVueLibrary(output), library=loadLibrary();
  const model=library.models.find(model=>model.interactions?.nativeButton);
  assert.ok(model); // Selection is capability-driven, not component-name-driven.
  const entry=manifest.components.find(entry=>entry.modelDigest===model.modelDigest);
  const source=fs.readFileSync(path.join(output,entry.file),'utf8');
  assert.match(source,/v-bind="\$attrs"/); assert.match(source,/:disabled="props\.disabled \|\| props\.loading"/);
  assert.match(source,/<svg v-if="props\.loading" aria-hidden="true"><\/svg><slot \/>/);
  const Component=await compileSSRComponent(entry,build);
  const fixtures=[
    [{},'<button type="button">Ready</button>'],
    [{disabled:true},'<button type="button" disabled>Disabled</button>'],
    [{loading:true},'<button type="button" disabled><svg aria-hidden="true"></svg>Loading</button>'],
    [{type:'submit'},'<button type="submit">Submit</button>'],
  ];
  for(const [props,expected] of fixtures){
    const label=props.loading?'Loading':props.disabled?'Disabled':props.type==='submit'?'Submit':'Ready';
    const html=await renderToString(createSSRApp({setup:()=>()=>h(Component,props,{default:()=>label})}));
    assert.equal(html.replace(/<!---->|<!--\[-->|<!--\]-->/g,''),expected);
  }
});

test('resolution receipt canonically binds capability and generated manifest hashes',()=>{
  const receipt=JSON.parse(fs.readFileSync('proof/dx/conformance/diagnostics/semantic-emitter-vue-resolution.json','utf8'));
  const contentBindings=JSON.parse(fs.readFileSync('src/kumo/library/capabilities/content-bindings.json','utf8'));
  assert.equal(receipt.status,'passed');
  assert.equal(receipt.resolvedFingerprint,'semantic-variant-consumer-children-empty-ssr');
  assert.equal(receipt.semanticVariants,66);assert.equal(receipt.unresolvedSemanticOperations,0);assert.equal(receipt.testRuns,2);
  const {receiptHash,...canonical}=receipt;
  assert.equal(receiptHash,hash(JSON.stringify(canonical)));
  assert.equal(receipt.contentBindingsCapabilityDigest,contentBindings.capabilityDigest);
  assert.match(receipt.vueManifestSha256,/^[a-f0-9]{64}$/);
  assert.match(hash(fs.readFileSync(path.join(output,'manifest.json'))),/^[a-f0-9]{64}$/);
});
