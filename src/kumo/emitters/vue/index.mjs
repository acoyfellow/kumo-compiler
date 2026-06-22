import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {loadLibrary, canonicalJSON} from '../../library/index.mjs';
import {validateImplementation, NODE_KINDS, EXPRESSION_KINDS, OPERATION_KINDS} from '../../library/algebra.mjs';
import {requireContentBindings, semanticExpression, semanticPredicate} from '../shared/content-adapter.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../../..');
const esc = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const directive = value => String(value).replaceAll('&','&amp;').replaceAll('"','&quot;');
const id = value => value.replace(/[^A-Za-z0-9_$]/g, '_').replace(/^([0-9])/, '_$1');
const pascal = value => value.split(/[-_ ]+/).map(x => x[0]?.toUpperCase() + x.slice(1)).join('');
const sha = value => crypto.createHash('sha256').update(value).digest('hex');

function expression(value, scope = 'props') {
  switch (value.kind) {
    case 'literal': return JSON.stringify(value.value);
    case 'prop': return `${scope}.${id(value.name)}`;
    case 'state': return `${id(value.name)}.value`;
    case 'item': return id(value.name);
    case 'coalesce': return `(${value.values.map(v => expression(v, scope)).join(' ?? ')})`;
    case 'equals': return `(${expression(value.left, scope)} === ${expression(value.right, scope)})`;
    case 'not': return `(!${expression(value.value, scope)})`;
    case 'concat': return `[${value.values.map(v => expression(v, scope)).join(', ')}].join(${JSON.stringify(value.separator ?? '')})`;
    case 'style-ref': return `styles[${JSON.stringify(value.name)}]`;
    default: throw new Error(`unsupported Vue expression: ${value.kind}`);
  }
}
function node(value, context = {}) {
  const child = x => node(x, context);
  switch (value.kind) {
    case 'children': return '<slot />';
    case 'text': return `{{ ${expression(value.value)} }}`;
    case 'slot': return `<slot name="${esc(value.name)}">${value.fallback ? child(value.fallback) : ''}</slot>`;
    case 'condition': return `<template v-if="${esc(expression(value.when))}">${child(value.then)}</template>${value.else ? `<template v-else>${child(value.else)}</template>` : ''}`;
    case 'collection': return `<template v-for="${id(value.item)} in ${esc(expression(value.source))}" :key="${esc(expression(value.key))}">${node(value.template, {...context, item:value.item})}</template>`;
    case 'compound': return `<div data-kumo-compound="${esc(value.name)}" :class="styles.root">${Object.entries(value.parts).map(([name, part]) => `<section data-kumo-part="${esc(name)}">${child(part)}</section>`).join('')}</div>`;
    case 'portal': return `<Teleport :to="${esc(expression(value.target))}"><div data-kumo-layer="${esc(value.layer)}">${value.children.map(child).join('')}</div></Teleport>`;
    case 'element': {
      const attrs = [];
      for (const [name, exp] of Object.entries(value.attributes ?? {})) attrs.push(`:${name}="${esc(expression(exp))}"`);
      for (const [name, exp] of Object.entries(value.properties ?? {})) attrs.push(`:${name}="${esc(expression(exp))}"`);
      for (const [name, exp] of Object.entries(value.events ?? {})) attrs.push(`@${name}="${esc(expression(exp))}"`);
      if (value.ref) attrs.push(`ref="${esc(value.ref)}"`);
      if (value.styles?.length) attrs.push(`:class="[${directive(value.styles.map(v => expression(v)).join(', '))}]"`);
      return `<${value.tag}${attrs.length ? ' '+attrs.join(' ') : ''}>${(value.children ?? []).map(child).join('')}</${value.tag}>`;
    }
    default: throw new Error(`unsupported Vue node: ${value.kind}`);
  }
}
function vueType(type) {
  const boolean = /boolean/i.test(type), number = /number/i.test(type), string = /string|base\||sm\||xs\||lg\||primary\||dialog\|/i.test(type);
  if ([boolean,number,string].filter(Boolean).length > 1) return 'unknown';
  if (boolean) return 'boolean';
  if (number) return 'number';
  if (string) return 'string';
  return 'unknown';
}
function compoundPartSource(partPath) {
  return `<script setup lang="ts">
defineOptions({ inheritAttrs: false })
</script>

<template>
  <span v-bind="$attrs" data-kumo-part="${esc(partPath)}"><slot /></span>
</template>
`;
}
function compoundBindingSource(graph, imports) {
  const root = {};
  for (const item of graph.paths) {
    const segments = item.path.split('.');
    let cursor = root;
    for (let index = 0; index < segments.length; index++) {
      const segment = segments[index];
      cursor[segment] ??= index === segments.length - 1 ? imports.get(item.path) : {};
      cursor = cursor[segment];
    }
  }
  const literal = value => typeof value === 'string' ? value : `{ ${Object.entries(value).map(([key, child]) => `${JSON.stringify(key)}: ${literal(child)}`).join(', ')} }`;
  return `export const ${id(graph.canonicalRoot)} = Object.assign(RootComponent, ${literal(root)})`;
}
const vuePropName = name => name.replace(/-([a-z])/g,(_,letter)=>letter.toUpperCase());
function semanticNode(value) {
  const e = item => {
    const semanticItem = item.kind === 'prop' ? {...item,name:vuePropName(item.name)} : item;
    const semantic = semanticExpression(semanticItem,{props:'semanticValues',fixture:'fixture',content:'renderContent()'});
    if (semantic !== null) return semantic;
    return expression(item,'semanticValues');
  };
  switch (value.kind) {
    case 'semantic-element': {
      if (value.tag.kind !== 'literal' || !/^[a-z][a-z0-9-]*$/.test(value.tag.value)) throw new Error('Vue semantic element requires literal tag');
      const entries = Object.entries(value.attributes ?? {});
      const dynamicTag = entries.some(([name]) => /[A-Z]/.test(name));
      const attrs = dynamicTag ? [`v-bind="{ ${entries.map(([name,item]) => `${directive(JSON.stringify(name))}: ${directive(e(item))}`).join(', ')} }"`] : entries.map(([name,item]) => item.kind === 'literal' && typeof item.value === 'string' ? `${name}="${esc(item.value)}"` : `:${name}="${directive(e(item))}"`);
      if (value.classes?.length) attrs.push(`class="${esc(value.classes.map(x => x.value).join(' '))}"`);
      const tag = dynamicTag ? `component :is="'${value.tag.value}'"` : value.tag.value;
      const close = dynamicTag ? 'component' : value.tag.value;
      return `<${tag}${attrs.length?' '+attrs.join(' '):''}>${(value.children??[]).map(semanticNode).join('')}</${close}>`;
    }
    case 'text': return `{{ ${e(value.value)} }}`;
    case 'fixture-children': return `{{ fixtureText(${e(value.value)}) }}`;
    default: return node(value);
  }
}
function emitComponent(model) {
  const implementation = validateImplementation(model.draftImplementation);
  const contentBindingDigest = requireContentBindings(model);
  const defaults = Object.fromEntries(model.props.items.filter(p => p.default != null).map(p => [p.name,p.default]));
  const variants = [...(implementation.semanticVariants ?? [])].sort((a,b)=>b.when.length-a.when.length);
  const declaredProps = new Map(model.props.items.map(p => [p.name,p]));
  for (const variant of variants) for (const predicate of variant.when) if (predicate.kind === 'prop-equals' && predicate.name !== 'children' && !declaredProps.has(predicate.name)) declaredProps.set(predicate.name,{name:predicate.name,required:false,type:'unknown'});
  const props = [...declaredProps.values()].map(p => `  ${JSON.stringify(p.name)}${p.required && p.name !== 'children' ? '' : '?'}: ${vueType(p.type)}`).join('\n');
  const predicates = variants.map(v => v.when.map(x => semanticPredicate(x.kind === 'prop-equals' && x.name !== 'children' ? {...x,name:vuePropName(x.name)} : x,{props:'semanticValues',fixture:'fixture',content:'renderContent()',equal:'semanticEqual'})).join(' && ') || 'true');
  const semantic = variants.map((v,i) => `<template ${i?'v-else-if':'v-if'}="${directive(predicates[i])}">${semanticNode(v.tree)}</template>`).join('');
  return `<script lang="ts">\nexport const modelDigest = ${JSON.stringify(model.modelDigest)}\nexport const contentBindingDigest = ${JSON.stringify(contentBindingDigest)}\n</script>\n\n<script setup lang="ts">\nimport { computed, useAttrs, useSlots } from 'vue'\ninterface ${model.public.symbol}Props {\n${props}\n  fixture?: unknown\n  semanticContent?: unknown\n}\nconst props = withDefaults(defineProps<${model.public.symbol}Props>(), ${JSON.stringify(defaults)})\nconst slots = useSlots()\nconst styles: Record<string,string> = {}\nconst normalizeSlotContent = (value: any): string => Array.isArray(value) ? value.map(normalizeSlotContent).join('') : value == null || typeof value === 'boolean' ? '' : typeof value === 'string' || typeof value === 'number' ? String(value) : normalizeSlotContent(value.children)
const renderContent = () => props.semanticContent ?? normalizeSlotContent(slots.default?.())\nconst fixture = computed(() => props.fixture)\nconst semanticValues = Object.assign({}, useAttrs(), props) as Record<string, unknown>\nconst semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right)\nconst fixtureText = (value: any): string => value && typeof value === 'object' ? String(typeof value.text === 'string' ? value.text : '') + (Array.isArray(value.children) ? value.children.map(fixtureText).join('') : '') : ''\n</script>\n\n<template>\n  ${semantic}<template ${semantic?'v-else':''}>${node(implementation.componentRoot)}</template>\n</template>\n`;
}
export function generateVueLibrary(output = path.join(root, 'generated/libraries/vue')) {
  const {models} = loadLibrary();
  for (const kind of [...NODE_KINDS, ...EXPRESSION_KINDS, ...OPERATION_KINDS]) if (!kind) throw new Error('invalid algebra kind');
  fs.rmSync(output, {recursive:true, force:true}); fs.mkdirSync(path.join(output,'components'), {recursive:true});
  const entries = [];
  const compoundPaths = [];
  for (const model of models) {
    const source = emitComponent(model); const file = `components/${model.component}.vue`;
    fs.writeFileSync(path.join(output,file), source);
    const graph = model.composition?.compoundExports;
    const partImports = new Map();
    for (const item of graph?.paths ?? []) {
      const partName = `${model.component}.${item.path.split('.').map(segment => segment.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()).join('.')}`;
      const partFile = `components/${partName}.vue`;
      const partDeclaration = `components/${partName}.d.ts`;
      const symbol = `${id(graph.canonicalRoot)}${item.path.split('.').map(pascal).join('')}`;
      const partSource = compoundPartSource(item.path);
      fs.writeFileSync(path.join(output,partFile), partSource);
      fs.writeFileSync(path.join(output,partDeclaration), `import type { DefineComponent } from 'vue';\ndeclare const component: DefineComponent<Record<string, unknown>>;\nexport default component;\n`);
      partImports.set(item.path, symbol);
      compoundPaths.push({root:graph.canonicalRoot,path:item.path,binding:`${graph.canonicalRoot}.${item.path}`,symbol,file:partFile,types:partDeclaration,sha256:sha(partSource),vectorIds:item.vectorIds});
    }
    const declaration = `import type { DefineComponent } from 'vue';\nexport interface ${model.public.symbol}Props { [key: string]: unknown }\ndeclare const component: DefineComponent<${model.public.symbol}Props>;\nexport default component;\nexport declare const modelDigest: ${JSON.stringify(model.modelDigest)};\n`;
    fs.writeFileSync(path.join(output,`components/${model.component}.d.ts`), declaration);
    entries.push({component:model.component,symbol:model.public.symbol,subpath:model.public.subpath,file,modelDigest:model.modelDigest,contentBindingDigest:model.contentBindings.capabilityDigest,semanticVariants:(model.draftImplementation.semanticVariants ?? []).map(({id,expectationDigest}) => ({id,expectationDigest})),unresolvedSemanticOperations:model.unresolvedSemanticOperations ?? [],sha256:sha(source),exports:model.public.exports,compoundExports:graph ? {canonicalRoot:graph.canonicalRoot,tree:graph.tree,paths:graph.paths.map(item => item.path)} : undefined,partImports});
  }
  const indexLines = [];
  const declarationLines = [];
  for (const entry of entries) {
    if (!entry.compoundExports) {
      indexLines.push(`export { default as ${id(entry.symbol)} } from './${entry.file}'`);
      declarationLines.push(`export { default as ${id(entry.symbol)} } from './${entry.file}'`);
      continue;
    }
    indexLines.push(`import Root${id(entry.symbol)} from './${entry.file}'`);
    declarationLines.push(`import Root${id(entry.symbol)} from './${entry.file}'`);
    for (const [partPath, symbol] of entry.partImports) {
      const part = compoundPaths.find(item => item.root === entry.compoundExports.canonicalRoot && item.path === partPath);
      indexLines.push(`import ${symbol} from './${part.file}'`);
      declarationLines.push(`import ${symbol} from './${part.file}'`);
    }
    const bindingGraph = {...entry.compoundExports, paths:entry.compoundExports.paths.map(path => ({path}))};
    const binding = compoundBindingSource(bindingGraph, entry.partImports).replace('RootComponent', `Root${id(entry.symbol)}`);
    indexLines.push(binding);
    declarationLines.push(binding);
  }
  fs.writeFileSync(path.join(output,'index.ts'),indexLines.join('\n')+'\n');
  fs.writeFileSync(path.join(output,'index.d.ts'),declarationLines.join('\n')+'\n');
  const exports = Object.fromEntries(entries.map(e => [`./components/${e.component}`,{vue:`./${e.file}`,types:`./components/${e.component}.d.ts`,canonicalSubpath:e.subpath}])) ;
  for (const part of compoundPaths) exports[`./${part.file.slice(0,-4)}`] = {vue:`./${part.file}`,types:`./${part.types}`,binding:part.binding};
  const components = entries.map(({partImports,compoundExports,...entry}) => ({...entry,...(compoundExports ? {compoundExports} : {})}));
  const manifest = {schemaVersion:'kumo.vue-library/v1',algebraVersion:'kumo.component-algebra/v1',candidate:true,count:entries.length,components,compoundPaths,exports:{'.':{vue:'./index.ts',types:'./index.d.ts'},...exports}};
  fs.writeFileSync(path.join(output,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  return manifest;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) process.stdout.write(canonicalJSON(generateVueLibrary())+'\n');
