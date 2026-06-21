import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {loadLibrary, canonicalJSON} from '../../library/index.mjs';
import {validateImplementation, NODE_KINDS, EXPRESSION_KINDS, OPERATION_KINDS} from '../../library/algebra.mjs';

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
  if (/boolean/i.test(type)) return 'boolean';
  if (/number/i.test(type)) return 'number';
  if (/string|base\||sm\||xs\||lg\||primary\||dialog\|/i.test(type)) return 'string';
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
function emitComponent(model) {
  const implementation = validateImplementation(model.draftImplementation);
  const states = new Map(model.states.map(s => [s.name, s]));
  const stateOps = implementation.operations.filter(x => x.kind === 'state');
  const refs = implementation.operations.filter(x => ['ref','focus'].includes(x.kind)).map(x => x.target).filter(Boolean);
  const services = implementation.operations.filter(x => x.kind === 'browser-service');
  const callbacks = model.emissions.callbacks.map(x => typeof x === 'string' ? x : x.name).filter(Boolean);
  const modelEvents = model.emissions.models.map(x => typeof x === 'string' ? `update:${x}` : x.event).filter(Boolean);
  const events = [...new Set([...callbacks, ...modelEvents, ...implementation.operations.filter(x => x.kind === 'emit').map(x => x.event).filter(Boolean)])];
  const props = model.props.items.map(p => `  ${JSON.stringify(p.name)}${p.required ? '' : '?'}: ${vueType(p.type)}`).join('\n');
  const defaults = Object.fromEntries(model.props.items.filter(p => p.default !== null && p.default !== undefined).map(p => [p.name,p.default]));
  const styleNames = [...new Set(implementation.operations.flatMap(x => x.styles ?? []).filter(x => x.kind === 'style-ref').map(x => x.name))];
  const lines = [`import { onMounted, ref } from 'vue'`, ``, `interface ${model.public.symbol}Props {`, props, `}`, `const props = withDefaults(defineProps<${model.public.symbol}Props>(), ${JSON.stringify(defaults)})`, `const emit = defineEmits(${JSON.stringify(events)})`, `const styles: Record<string,string> = ${JSON.stringify(Object.fromEntries(styleNames.map(x => [x, `kumo-${model.component}-${x}`])))}`];
  for (const op of stateOps) { const initial = states.get(op.state)?.initial; const fallback = initial === 'true' || initial === true ? 'true' : initial === 'false' || initial === false ? 'false' : op.initial?.kind === 'state' ? 'undefined' : expression(op.initial); lines.push(`const ${id(op.state)} = ref(${fallback})`); }
  for (const name of [...new Set(refs)]) lines.push(`const ${id(name)} = ref<HTMLElement | null>(null)`);
  if (services.length || implementation.operations.some(x => x.kind === 'lifecycle')) lines.push(`onMounted(() => { void ${services.length ? 'globalThis' : 'props'} })`);
  return `<script lang="ts">\nexport const modelDigest = ${JSON.stringify(model.modelDigest)}\n</script>\n\n<script setup lang="ts">\n${lines.filter(x => x !== undefined).join('\n')}\n</script>\n\n<template>\n  ${node(implementation.componentRoot)}\n</template>\n`;
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
    entries.push({component:model.component,symbol:model.public.symbol,subpath:model.public.subpath,file,modelDigest:model.modelDigest,sha256:sha(source),exports:model.public.exports,compoundExports:graph ? {canonicalRoot:graph.canonicalRoot,tree:graph.tree,paths:graph.paths.map(item => item.path)} : undefined,partImports});
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
