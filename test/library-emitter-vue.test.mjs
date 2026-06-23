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
const toastObservableSupported = (model, library) => model.component === library.toastLifecycle?.component && library.toastLifecycle?.observableImplementation?.support === 'supported';

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
        const requirement=toastObservableSupported(model,library)&&constraint.selector===':root' ? Object.fromEntries(Object.entries(constraint.require).filter(([key])=>key!=='text')) : constraint.require;
        const expected={root:constraint.selector===':root'?requirement:{},...(constraint.selector===':root'?{}:{descendants:[{selector:constraint.selector,...requirement}]})};
        try{assert.equal(compareMarkup(html,expected),true);}catch(error){error.message=`${model.component}#${variant.id} ${constraint.selector}: ${error.message}\n${html}`;throw error;}
      }
      rendered++;
    }
  }
  assert.equal(rendered,66); assert.equal(manifest.components.flatMap(x=>x.unresolvedSemanticOperations).length,0);
});

test('Vue sensitive-input capability lowers deterministic masked, editable, and copy markup', async t => {
  const library=loadLibrary(), capability=library.sensitiveInput;
  assert.equal(capability.support,'supported');
  assert.equal(capability.component,'sensitive-input');
  const emissions=[];
  for(let run=0;run<2;run++){
    const build=fs.mkdtempSync(path.resolve(`.kumo-vue-sensitive-input-${run}-`)); t.after(()=>fs.rmSync(build,{recursive:true,force:true}));
    const manifest=generateVueLibrary(output), model=library.models.find(model=>model.component===capability.component);
    const entry=manifest.components.find(entry=>entry.modelDigest===model.modelDigest);
    const source=fs.readFileSync(path.join(output,entry.file),'utf8');
    assert.match(source,/<div v-bind="\$attrs" data-kumo-component="SensitiveInput">/);
    assert.match(source,/<div data-kumo-part="masked-container" @click="revealValue">/);
    assert.match(source,/<input ref="sensitiveInputRef" type="password" :value="sensitiveValue" @input="updateSensitiveValue" \/>/);
    assert.equal((source.match(/<button type="button"/g)??[]).length,2);
    assert.match(source,/<div aria-live="polite">\{\{ copyAnnouncement \}\}<\/div>/);
    assert.match(source,/props\.onValueChange\?\.\(sensitiveValue\.value\)/);
    assert.match(source,/navigator\.clipboard\.writeText\(sensitiveValue\.value\)/);
    assert.match(source,/props\.onCopy\?\.\(\)/);
    assert.doesNotMatch(source,/innerHTML|@html|dispatchEvent|new Event/);
    const Component=await compileSSRComponent(entry,build);
    const html=await renderToString(createSSRApp({setup:()=>()=>h(Component,{label:'Secret',defaultValue:'alpha'})}));
    assert.match(html,/^<div data-kumo-component="SensitiveInput">/);
    assert.match(html,/data-kumo-part="masked-container">Value hidden<\/div>/);
    assert.match(html,/<input type="password" value="alpha">/);
    assert.equal((html.match(/<button/g)??[]).length,2);
    assert.match(html,/<div aria-live="polite"><\/div><\/div>$/);
    assert.equal(manifest.components.flatMap(x=>x.semanticVariants).length,66);
    emissions.push({source,html});
  }
  assert.deepEqual(emissions[1],emissions[0]);
});

test('Vue combobox capability lowers canonical compound fixture with input root and options deterministically', async t => {
  const library=loadLibrary(), capability=library.comboboxCollection;
  assert.equal(capability.support,'supported'); assert.equal(capability.component,'combobox');
  const fixture=JSON.parse(fs.readFileSync('contracts/kumo.observable/v1/components/combobox.json','utf8')).vectors[0].fixture;
  const emissions=[];
  for(let run=0;run<2;run++){
    const build=fs.mkdtempSync(path.resolve(`.kumo-vue-combobox-${run}-`)); t.after(()=>fs.rmSync(build,{recursive:true,force:true}));
    const manifest=generateVueLibrary(output), model=library.models.find(model=>model.component===capability.component);
    const entry=manifest.components.find(entry=>entry.modelDigest===model.modelDigest);
    const source=fs.readFileSync(path.join(output,entry.file),'utf8');
    assert.match(source,/<input ref="inputRef" v-bind="\$attrs" role="combobox"/);
    assert.match(source,/<ul role="listbox" :hidden="!open">/);
    assert.match(source,/role="option" :data-value="item\.props\?\.value"/);
    assert.match(source,/props\.onOpenChange\?\.\(next\)/); assert.match(source,/props\.onValueChange\?\.\(value\.value\)/);
    assert.doesNotMatch(source,/innerHTML|@html|dispatchEvent|new Event/);
    const Component=await compileSSRComponent(entry,build);
    const html=await renderToString(createSSRApp({setup:()=>()=>h(Component,{fixture})}));
    assert.match(html,/^(?:<!--\[-->)?<input role="combobox" placeholder="Fruit" value(?:="")? aria-expanded="false">/);
    assert.equal((html.match(/role="option"/g)??[]).length,2);
    assert.match(html,/role="option" data-value="Apple" aria-selected="false">Apple<\/li>/);
    assert.match(html,/role="option" data-value="Banana" aria-selected="false">Banana<\/li>/);
    assert.equal(manifest.components.flatMap(x=>x.semanticVariants).length,66);
    emissions.push({source,html});
  }
  assert.deepEqual(emissions[1],emissions[0]);
});

test('Vue autocomplete capability lowers canonical input root and option items deterministically', async t => {
  const library=loadLibrary(), capability=library.autocompleteCollection;
  assert.equal(capability.support,'supported'); assert.equal(capability.component,'autocomplete');
  const fixture=JSON.parse(fs.readFileSync('contracts/kumo.observable/v1/components/autocomplete.json','utf8')).vectors[0].fixture;
  const emissions=[];
  for(let run=0;run<2;run++){
    const build=fs.mkdtempSync(path.resolve(`.kumo-vue-autocomplete-${run}-`)); t.after(()=>fs.rmSync(build,{recursive:true,force:true}));
    const manifest=generateVueLibrary(output), model=library.models.find(model=>model.component===capability.component);
    const entry=manifest.components.find(entry=>entry.modelDigest===model.modelDigest);
    const source=fs.readFileSync(path.join(output,entry.file),'utf8');
    assert.match(source,/<input ref="inputRef" v-bind="\$attrs" role="combobox"/);
    assert.match(source,/<ul role="listbox" :hidden="!open">/);
    assert.match(source,/role="option" :data-value="item\.props\?\.value"/);
    assert.match(source,/props\.onValueChange\?\.\(value\.value\)\n  if \(!open\.value\) setOpen\(true\)/);
    assert.match(source,/highlightedIndex\.value = options\.value\.length \? 0 : -1/);
    assert.match(source,/props\.onValueChange\?\.\(value\.value\)\n    setOpen\(false\)/);
    assert.doesNotMatch(source,/innerHTML|@html|dispatchEvent|new Event/);
    const Component=await compileSSRComponent(entry,build);
    const html=await renderToString(createSSRApp({setup:()=>()=>h(Component,{fixture})}));
    assert.match(html,/^(?:<!--\[-->)?<input role="combobox" placeholder="Fruit" value(?:="")? aria-expanded="false">/);
    assert.equal((html.match(/role="option"/g)??[]).length,2);
    assert.match(html,/role="option" data-value="Apple" aria-selected="false">Apple<\/li>/);
    assert.match(html,/role="option" data-value="Banana" aria-selected="false">Banana<\/li>/);
    assert.equal(manifest.components.flatMap(x=>x.semanticVariants).length,66);
    emissions.push({source,html});
  }
  assert.deepEqual(emissions[1],emissions[0]);
});

test('Vue command-palette capability lowers canonical highlighted text and palette fixtures deterministically', async t => {
  const library=loadLibrary(), capability=library.commandPalette;
  assert.equal(capability.support,'supported'); assert.equal(capability.component,'command-palette');
  const fixtures=JSON.parse(fs.readFileSync('contracts/kumo.observable/v1/components/command-palette.json','utf8')).vectors.map(vector=>vector.fixture);
  const emissions=[];
  for(let run=0;run<2;run++){
    const build=fs.mkdtempSync(path.resolve(`.kumo-vue-command-palette-${run}-`)); t.after(()=>fs.rmSync(build,{recursive:true,force:true}));
    const manifest=generateVueLibrary(output), model=library.models.find(model=>model.component===capability.component);
    const entry=manifest.components.find(entry=>entry.modelDigest===model.modelDigest);
    const source=fs.readFileSync(path.join(output,entry.file),'utf8');
    assert.match(source,/<span v-if="highlightedText">/);
    assert.match(source,/<mark v-if="segment\.marked">/);
    assert.match(source,/<div v-else v-bind="\$attrs" data-kumo-component="CommandPalette">/);
    assert.match(source,/<input ref="inputRef"/); assert.match(source,/<li v-for="\(item, index\) in items"/);
    assert.match(source,/onMounted\(\(\) =>/); assert.match(source,/props\.onHighlightChange\?\./);
    assert.match(source,/props\.onValueChange\?\.\(value\.value\)/); assert.match(source,/props\.onOpenChange\?\.\(false\)/);
    assert.doesNotMatch(source,/innerHTML|@html|dispatchEvent|new Event/);
    const Component=await compileSSRComponent(entry,build);
    const highlighted=await renderToString(createSSRApp({setup:()=>()=>h(Component,{fixture:fixtures[0]})}));
    assert.equal(highlighted.replace(/<!--\[-->|<!--\]-->/g,''),'<span><mark>Cloud</mark>flare</span>'); assert.equal((highlighted.match(/<mark>/g)??[]).length,1);
    const palette=await renderToString(createSSRApp({setup:()=>()=>h(Component,{fixture:fixtures[1]})}));
    assert.match(palette,/^<div data-kumo-component="CommandPalette">/); assert.match(palette,/<input placeholder="Search"/);
    assert.equal((palette.match(/<li/g)??[]).length,2); assert.match(palette,/>Workers<\/li>/); assert.match(palette,/>Pages<\/li>/);
    assert.equal(manifest.components.flatMap(x=>x.semanticVariants).length,66);
    emissions.push({source,highlighted,palette});
  }
  assert.deepEqual(emissions[1],emissions[0]);
});

test('Vue input-group capability lowers canonical compound fixture deterministically', async t => {
  const library=loadLibrary(), capability=library.inputGroupComposition;
  assert.equal(capability.support,'supported');
  const fixture=JSON.parse(fs.readFileSync('contracts/kumo.observable/v1/components/input-group.json','utf8')).vectors[0].fixture;
  const emissions=[];
  for(let run=0;run<2;run++){
    const build=fs.mkdtempSync(path.resolve(`.kumo-vue-input-group-${run}-`)); t.after(()=>fs.rmSync(build,{recursive:true,force:true}));
    const manifest=generateVueLibrary(output), model=library.models.find(model=>model.component===capability.component);
    const entry=manifest.components.find(entry=>entry.modelDigest===model.modelDigest);
    const source=fs.readFileSync(path.join(output,entry.file),'utf8');
    assert.match(source,/<div v-bind="\$attrs" data-kumo-component="InputGroup">/);
    assert.match(source,/<label v-if="inputGroupProps\.label !== undefined" :for="inputId">/);
    assert.match(source,/:id="inputId"/); assert.match(source,/@input="trackInput"/);
    assert.match(source,/\.Addon/); assert.match(source,/\.Input/); assert.match(source,/\.Button/); assert.match(source,/\.Suffix/);
    assert.doesNotMatch(source,/innerHTML|@html|dispatchEvent|new Event/);
    const Component=await compileSSRComponent(entry,build);
    const html=await renderToString(createSSRApp({setup:()=>()=>h(Component,{fixture})}));
    assert.match(html,/^<div data-kumo-component="InputGroup">/);
    const ids=html.match(/<label for="([^"]+)">Search<\/label>.*<input id="([^"]+)"/);
    assert.ok(ids,html); assert.equal(ids[1],ids[2]);
    assert.match(html,/\$<\/span>.*<input/); assert.match(html,/>Go<\/button>.*<span[^>]*>USD<\/span>/);
    assert.equal(manifest.components.flatMap(x=>x.semanticVariants).length,66);
    emissions.push({source,html});
  }
  assert.deepEqual(emissions[1],emissions[0]);
});

test('Vue dialog-layer capability lowers compound fixtures to a deterministic trigger and Teleport', async t => {
  const library=loadLibrary(), capability=library.dialogLayer;
  assert.equal(capability.support,'supported');
  const emissions=[];
  for(let run=0;run<2;run++){
    const build=fs.mkdtempSync(path.resolve(`.kumo-vue-dialog-${run}-`)); t.after(()=>fs.rmSync(build,{recursive:true,force:true}));
    const manifest=generateVueLibrary(output), model=library.models.find(model=>model.component===capability.component);
    const entry=manifest.components.find(entry=>entry.modelDigest===model.modelDigest);
    const source=fs.readFileSync(path.join(output,entry.file),'utf8');
    assert.match(source,/<button ref="triggerRef" type="button" data-kumo-component="Dialog" data-kumo-part="trigger" aria-haspopup="dialog"/);
    assert.match(source,/<Teleport v-if="currentOpen" to="body"><div ref="dialogRef" role="dialog" tabindex="-1">/);
    assert.match(source,/props\.onOpenChange\?\.\(next\)/);
    assert.match(source,/next \? dialogRef\.value\?\.focus\(\) : triggerRef\.value\?\.focus\(\)/);
    assert.doesNotMatch(source,/innerHTML|@html|dispatchEvent|new Event/);
    const Component=await compileSSRComponent(entry,build);
    const fixture={export:'.Root',props:{},children:[{export:'.Trigger',props:{},children:[{text:'Open settings'}]},{export:'root',props:{},children:[{export:'.Title',props:{},children:[{text:'Settings'}]}]}]};
    const html=await renderToString(createSSRApp({setup:()=>()=>h(Component,{fixture})}));
    assert.match(html,/^<button type="button" data-kumo-component="Dialog" data-kumo-part="trigger" aria-haspopup="dialog">Open settings/);
    assert.doesNotMatch(html,/role="dialog"/);
    emissions.push({source,html});
  }
  assert.deepEqual(emissions[1],emissions[0]);
});

test('Vue radio-group capability lowers generically to deterministic single-select radio markup', async t => {
  const library=loadLibrary(), capability=library.radioGroup;
  assert.equal(capability.support,'supported');
  const emissions=[];
  for(let run=0;run<2;run++){
    const build=fs.mkdtempSync(path.resolve(`.kumo-vue-radio-${run}-`)); t.after(()=>fs.rmSync(build,{recursive:true,force:true}));
    const manifest=generateVueLibrary(output), model=library.models.find(model=>model.component===capability.component);
    const entry=manifest.components.find(entry=>entry.modelDigest===model.modelDigest);
    const source=fs.readFileSync(path.join(output,entry.file),'utf8');
    assert.match(source,/<div ref="groupRef" v-bind="\$attrs" role="radiogroup"/);
    assert.match(source,/role="radio" :tabindex="\(radioFixture\.disabled \|\| item\.disabled\) \? undefined : 0" :aria-checked="item\.value === selectedValue"/);
    assert.match(source,/if \(radioFixture\.value\?\.disabled \|\| item\.disabled\) return/);
    assert.match(source,/\(props\.setValue \?\? props\.onValueChange\)\?\.\(item\.value\)/);
    assert.doesNotMatch(source,/innerHTML|@html|dispatchEvent|new Event/);
    const Component=await compileSSRComponent(entry,build);
    const fixture={kind:'radio-group',legend:'Options',items:[{label:'One',value:'one'},{label:'Two',value:'two',disabled:true},{label:'Three',value:'three'}],defaultValue:'one'};
    const html=await renderToString(createSSRApp({setup:()=>()=>h(Component,{fixture})}));
    assert.match(html,/^<div role="radiogroup" aria-label="Options">/);
    assert.equal((html.match(/role="radio"/g)??[]).length,3);
    assert.match(html,/role="radio" tabindex="0" aria-checked="true" aria-label="One"/);
    assert.match(html,/role="radio" aria-checked="false" aria-label="Two" aria-disabled="true"/);
    emissions.push({source,html});
  }
  assert.deepEqual(emissions[1],emissions[0]);
});

test('Vue tabs-navigation capability lowers to deterministic accessible tab markup', async t => {
  const library=loadLibrary(), capability=library.tabsNavigation;
  assert.equal(capability.support,'supported');
  const emissions=[];
  for(let run=0;run<2;run++){
    const build=fs.mkdtempSync(path.resolve(`.kumo-vue-tabs-${run}-`)); t.after(()=>fs.rmSync(build,{recursive:true,force:true}));
    const manifest=generateVueLibrary(output), model=library.models.find(model=>model.component===capability.component);
    const entry=manifest.components.find(entry=>entry.modelDigest===model.modelDigest);
    const source=fs.readFileSync(path.join(output,entry.file),'utf8');
    assert.match(source,/<div><div role="tablist"><button v-for=/);
    assert.match(source,/role="tab"[^>]+:aria-selected="tab\.value === committedValue"/);
    assert.match(source,/const controlled = computed\(\(\) => Object\.prototype\.hasOwnProperty\.call\(instance\?\.vnode\.props/);
    assert.match(source,/if \(props\.activateOnFocus\) commit\(props\.tabs\[next\]\.value\)/);
    assert.doesNotMatch(source,/innerHTML|@html|dispatchEvent|new Event/);
    const Component=await compileSSRComponent(entry,build);
    const html=await renderToString(createSSRApp({setup:()=>()=>h(Component,{tabs:[{value:'one',label:'One'},{value:'two',label:'Two'}],selectedValue:'two'})}));
    assert.match(html,/^<div><div role="tablist">/);
    assert.equal((html.match(/role="tab"/g)??[]).length,2);
    assert.equal((html.match(/aria-selected="(?:true|false)"/g)??[]).length,2);
    assert.match(html,/aria-selected="true"[^>]*>Two<\/button>/);
    emissions.push({source,html});
  }
  assert.deepEqual(emissions[1],emissions[0]);
});

test('Vue menu-bar capability lowers canonical nav and option buttons deterministically', async t => {
  const library=loadLibrary(), capability=library.menubarNavigation;
  assert.equal(capability.support,'supported');
  const emissions=[];
  for(let run=0;run<2;run++){
    const build=fs.mkdtempSync(path.resolve(`.kumo-vue-menubar-${run}-`)); t.after(()=>fs.rmSync(build,{recursive:true,force:true}));
    const manifest=generateVueLibrary(output), model=library.models.find(model=>model.component===capability.component);
    const entry=manifest.components.find(entry=>entry.modelDigest===model.modelDigest);
    const source=fs.readFileSync(path.join(output,entry.file),'utf8');
    assert.match(source,new RegExp(`<nav class="${capability.root.classes.join(' ')}">`));
    assert.match(source,/@keydown="moveFocus\(index, \$event\)" @click="activate\(option\)"/);
    assert.doesNotMatch(source,/aria-selected|aria-pressed|aria-current|innerHTML|@html|dispatchEvent|new Event/);
    const Component=await compileSSRComponent(entry,build);
    const options=[{id:'one',tooltip:'First',icon:'one'},{id:'two',tooltip:'Second',icon:'two'}];
    const html=await renderToString(createSSRApp({setup:()=>()=>h(Component,{options,isActive:1})}));
    assert.match(html,new RegExp(`^<nav class="${capability.root.classes.join(' ')}">`));
    assert.equal((html.match(/<button/g)??[]).length,2);
    assert.doesNotMatch(html,/aria-selected|aria-pressed|aria-current/);
    const empty=await renderToString(createSSRApp({setup:()=>()=>h(Component,{options:[]})}));
    assert.equal((empty.match(/<button/g)??[]).length,0);
    assert.equal(empty.replace(/<!--\[-->|<!--\]-->/g,''),`<nav class="${capability.root.classes.join(' ')}"></nav>`);
    emissions.push({source,html,empty});
  }
  assert.deepEqual(emissions[1],emissions[0]);
});

test('Vue pagination-controls capability lowers full, simple, and dropdown button counts deterministically', async t => {
  const library=loadLibrary(), capability=library.paginationControls;
  assert.equal(capability.support,'supported');
  const emissions=[];
  for(let run=0;run<2;run++){
    const build=fs.mkdtempSync(path.resolve(`.kumo-vue-pagination-${run}-`)); t.after(()=>fs.rmSync(build,{recursive:true,force:true}));
    const manifest=generateVueLibrary(output), model=library.models.find(model=>model.component===capability.component);
    const entry=manifest.components.find(entry=>entry.modelDigest===model.modelDigest);
    const source=fs.readFileSync(path.join(output,entry.file),'utf8');
    assert.match(source,/<div data-slot="pagination"><nav ref="navRef" :aria-label=/);
    assert.doesNotMatch(source,/innerHTML|@html|dispatchEvent|new Event|\.blur\(/);
    const Component=await compileSSRComponent(entry,build), markup=[];
    for(const [fixtureMode,count] of [[undefined,4],['simple',2],['dropdown',6]]){
      const html=await renderToString(createSSRApp({setup:()=>()=>h(Component,{page:3,perPage:10,totalCount:100,fixtureMode})}));
      assert.match(html,/^<div data-slot="pagination"><nav aria-label="Pagination"/);
      assert.equal((html.match(/<button/g)??[]).length,count);
      if(fixtureMode!=='simple') assert.match(html,/aria-label="Page number" value="1"/);
      else assert.doesNotMatch(html,/aria-label="Page number"/);
      markup.push(html);
    }
    emissions.push({source,markup});
  }
  assert.deepEqual(emissions[1],emissions[0]);
});

test('Vue clipboard-copy capability lowers to deterministic hydration-stable native markup', async t => {
  const library=loadLibrary(), capability=library.clipboardCopy;
  assert.equal(capability.support,'supported');
  const emissions=[];
  for(let run=0;run<2;run++){
    const build=fs.mkdtempSync(path.resolve(`.kumo-vue-clipboard-${run}-`)); t.after(()=>fs.rmSync(build,{recursive:true,force:true}));
    const manifest=generateVueLibrary(output);
    const model=library.models.find(model=>model.component===capability.component);
    const entry=manifest.components.find(entry=>entry.modelDigest===model.modelDigest);
    const source=fs.readFileSync(path.join(output,entry.file),'utf8');
    assert.match(source,/<div><span>/); assert.match(source,/<button type="button" @click="copyText">/);
    assert.match(source,/<span aria-live="polite">\{\{ copyAnnouncement \}\}<\/span><\/div>/);
    assert.match(source,/navigator\.clipboard\.writeText\(props\.textToCopy \?\? props\.text\)/);
    assert.match(source,/props\.onCopy\?\.\(\)/); assert.doesNotMatch(source,/innerHTML|@html|dispatchEvent|new Event|\.blur\(/);
    const Component=await compileSSRComponent(entry,build);
    const html=await renderToString(createSSRApp({setup:()=>()=>h(Component,{text:'Visible',textToCopy:'Copy me'})}));
    assert.match(html,/^<div><span>Visible<\/span><button type="button">Copy<\/button><span aria-live="polite"><\/span><\/div>$/);
    emissions.push({source,html});
  }
  assert.deepEqual(emissions[1],emissions[0]);
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

test('Vue supported toggle-control capabilities lower generically to canonical native roots and initial states', async t => {
  const build=fs.mkdtempSync(path.resolve('.kumo-vue-toggle-')); t.after(()=>fs.rmSync(build,{recursive:true,force:true}));
  const manifest=generateVueLibrary(output), library=loadLibrary();
  const supported=library.behaviorCapabilities.bindings.filter(binding=>binding.id==='toggle-control'&&binding.support==='supported');
  assert.equal(supported.length,2);
  for(const binding of supported){
    const state=library.controlledState.specs.find(spec=>spec.component===binding.component);
    const native=library.nativeControls.specs.find(spec=>spec.component===binding.component);
    const model=library.models.find(model=>model.component===binding.component);
    const entry=manifest.components.find(entry=>entry.modelDigest===model.modelDigest);
    const source=fs.readFileSync(path.join(output,entry.file),'utf8');
    assert.match(source,/const controlled = Object\.prototype\.hasOwnProperty\.call\(instance\?\.vnode\.props/);
    assert.match(source,/props\.onCheckedChange\?\.\(next\)/);
    assert.doesNotMatch(source,/model\.component\s*===|React|SyntheticEvent|dispatchEvent|new Event/);
    assert.match(source,new RegExp(`<${native.root}[^>]+role="${native.root==='span'?'checkbox':'switch'}"`));
    const Component=await compileSSRComponent(entry,build);
    const cases=[
      [{},state.initial],
      [{defaultChecked:true},true],
      [{checked:false,defaultChecked:true},false],
      [{checked:true,disabled:true},true],
      ...(state.indeterminate?[[{indeterminate:true},'mixed']]:[]),
    ];
    for(const [props,expected] of cases){
      const html=await renderToString(createSSRApp({setup:()=>()=>h(Component,props)}));
      assert.match(html,new RegExp(`aria-checked="${expected}"`));
      if(props.disabled) assert.match(html,/disabled/);
    }
  }
  for(const binding of library.behaviorCapabilities.bindings.filter(binding=>binding.id==='radio-group'||binding.id.endsWith('field'))){
    const entry=manifest.components.find(entry=>entry.component===binding.component);
    const source=fs.readFileSync(path.join(output,entry.file),'utf8');
    assert.doesNotMatch(source,/const controlled = Object\.prototype\.hasOwnProperty\.call/);
  }
});

test('Vue supported native-input-control capabilities lower generically to native uncontrolled controls', async t => {
  const library=loadLibrary();
  const supported=library.behaviorCapabilities.bindings.filter(binding=>binding.id==='native-input-control'&&binding.support==='supported');
  assert.equal(supported.length,2);
  for(let run=0;run<2;run++){
    const build=fs.mkdtempSync(path.resolve(`.kumo-vue-input-${run}-`)); t.after(()=>fs.rmSync(build,{recursive:true,force:true}));
    const manifest=generateVueLibrary(output);
    for(const binding of supported){
      const field=library.nativeField.controls.find(control=>control.component===binding.component);
      const model=library.models.find(model=>model.component===binding.component);
      const entry=manifest.components.find(entry=>entry.modelDigest===model.modelDigest);
      const source=fs.readFileSync(path.join(output,entry.file),'utf8');
      assert.match(source,/defineOptions\(\{ inheritAttrs: false \}\)/);
      assert.match(source,new RegExp(`<${field.root} v-bind="nativeAttrs"`));
      assert.match(source,new RegExp(`:value="props\\.${binding.uncontrolled.prop}"`));
      assert.match(source,/:disabled="props\.disabled \|\| undefined"/);
      assert.match(source,/@input="handleNativeInput"/);
      assert.match(source,/event\.currentTarget as HTMLInputElement \| HTMLTextAreaElement/);
      assert.match(source,/props\.onChange\?\.\(\(event\.currentTarget as HTMLInputElement \| HTMLTextAreaElement\)\.value\)/);
      assert.doesNotMatch(source,/model\.component\s*===|component\s*===\s*['"](?:input|input-area)['"]|SyntheticEvent|dispatchEvent|new Event/);
      const Component=await compileSSRComponent(entry,build);
      const props={defaultValue:field.root==='input'?'native-x':'native-hello',ariaLabel:'Native control',disabled:true,name:'native-name'};
      const html=await renderToString(createSSRApp({setup:()=>()=>h(Component,props)}));
      assert.match(html,new RegExp(`^<${field.root}[^>]*`));
      assert.match(html,/aria-label="Native control"/); assert.match(html,/name="native-name"/);
      assert.match(html,/disabled/);
      assert.match(html,field.root==='input'?/value="native-x"/:/>native-hello<\/textarea>$/);
    }
    for(const component of ['field','sensitive-input']){
      const entry=manifest.components.find(entry=>entry.component===component);
      const source=fs.readFileSync(path.join(output,entry.file),'utf8');
      assert.doesNotMatch(source,/@input="handleNativeInput"|function handleNativeInput/);
    }
  }
});

test('Vue field composition labels native controls with stable matching ids and preserves bare controls', async t => {
  const library=loadLibrary();
  assert.equal(library.fieldComposition.support,'supported');
  const owned=library.fieldComposition.controls.filter(control=>control.ownsControl);
  const emissions=[];
  for(let run=0;run<2;run++){
    const build=fs.mkdtempSync(path.resolve(`.kumo-vue-field-${run}-`)); t.after(()=>fs.rmSync(build,{recursive:true,force:true}));
    const manifest=generateVueLibrary(output);
    const runMarkup=[];
    for(const control of owned){
      const entry=manifest.components.find(entry=>entry.component===control.component);
      const Component=await compileSSRComponent(entry,build);
      const labelled=await renderToString(createSSRApp({setup:()=>()=>h(Component,{label:'Control label'})}));
      const match=labelled.match(/^<div><label for="([^"]+)">Control label<\/label><(?:input|textarea)[^>]* id="([^"]+)"/);
      assert.ok(match,`${control.component}: ${labelled}`);
      assert.equal(match[1],match[2]);
      const bare=await renderToString(createSSRApp({setup:()=>()=>h(Component)}));
      assert.match(bare,new RegExp(`^<${control.control}(?:\\s|>)`));
      runMarkup.push(labelled);
    }
    emissions.push(runMarkup);
  }
  assert.deepEqual(emissions[1],emissions[0]);

  const field=library.fieldComposition.controls.find(control=>!control.ownsControl);
  const manifest=generateVueLibrary(output), entry=manifest.components.find(entry=>entry.component===field.component);
  const source=fs.readFileSync(path.join(output,entry.file),'utf8');
  assert.match(source,/<div><label :for=/);
  assert.match(source,/<slot \/><\/div>/);
  assert.doesNotMatch(source,/innerHTML|@html|dispatchEvent|new Event/);
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
