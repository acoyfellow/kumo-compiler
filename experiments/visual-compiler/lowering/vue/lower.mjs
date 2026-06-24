#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';
import { lower as planFromIr, validatePlan, stable } from '../core/core.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const irFile = path.join(root, 'ir/fixtures/components.json');
const descriptorFile = path.join(root, 'ir/candidates/part-first.json');
const outDir = path.join(here, 'generated');
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const pascal = value => value.replace(/(^|-)(.)/g, (_match, _dash, character) => character.toUpperCase());
const quote = value => JSON.stringify(value);
const escapeAttribute = value => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;');
const directive = (name, expression) => `v-bind:${name}='${escapeAttribute(expression)}'`;
const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

function readAuthority() {
  const irBytes = fs.readFileSync(irFile, 'utf8');
  const descriptorBytes = fs.readFileSync(descriptorFile, 'utf8');
  const ir = JSON.parse(irBytes);
  const descriptor = JSON.parse(descriptorBytes);
  if (descriptor.id !== 'part-first' || descriptor.schemaVersion !== 'kumo.ir-candidate/v2') throw new Error('only the accepted authority-derived part-first IR is supported');
  const plan = planFromIr(ir);
  const validation = validatePlan(plan);
  if (!validation.valid) throw new Error(`invalid lowering plan: ${validation.errors.join(', ')}`);
  return { ir, irBytes, descriptor, descriptorBytes, plan };
}

function samplesByPart(component) {
  return new Map(component.parts.map(part => [part.id, [...(part.samples ?? [])].sort((a, b) => a.state.localeCompare(b.state) || a.viewport - b.viewport)]));
}

function operationModel(shard, component) {
  const samples = samplesByPart(component);
  const nodes = new Map();
  const stateOperations = [];
  const portals = [];
  for (const operation of shard.operations) {
    if (operation.kind === 'state.init' || operation.kind === 'state.transition') stateOperations.push(operation);
    else if (operation.kind === 'node.create' || operation.kind === 'node.text') nodes.set(operation.part, { operation, operations: [], children: [], samples: samples.get(operation.part) ?? [] });
  }
  for (const operation of shard.operations) {
    if (operation.part !== null && !operation.kind.startsWith('node.')) nodes.get(operation.part).operations.push(operation);
    if (operation.kind === 'portal.mount' || operation.kind === 'portal.unmount') portals.push(operation);
  }
  const roots = [];
  for (const node of nodes.values()) {
    const parent = nodes.get(node.operation.parent);
    if (parent) parent.children.push(node); else roots.push(node);
  }
  const order = node => node.samples[0]?.order ?? Number.MAX_SAFE_INTEGER;
  const sortTree = values => values.sort((a, b) => order(a) - order(b) || a.operation.part.localeCompare(b.operation.part));
  sortTree(roots);
  for (const node of nodes.values()) sortTree(node.children);
  return { roots, stateOperations, portals };
}

function conditionExpression(when) {
  if (when === null || when === undefined || when === true) return 'true';
  if (when === false) return 'false';
  if (typeof when === 'string') return `state === ${quote(when)}`;
  if (Array.isArray(when)) return when.map(conditionExpression).join(' && ') || 'true';
  if (typeof when === 'object') {
    if ('cells' in when) return `(${quote(when.cells.map(cell => `${cell.state}:${cell.viewport}`))}).includes(state + ':' + viewport)`;
    const dimensions = [];
    if ('state' in when) dimensions.push(Array.isArray(when.state) ? `${quote(when.state)}.includes(state)` : `state === ${quote(when.state)}`);
    if ('states' in when) dimensions.push(`${quote(when.states)}.includes(state)`);
    if ('viewport' in when) dimensions.push(`viewport === ${Number(when.viewport)}`);
    if ('viewports' in when) dimensions.push(`${quote(when.viewports)}.includes(viewport)`);
    if (dimensions.length) return dimensions.join(' && ');
    if ('not' in when) return `!(${conditionExpression(when.not)})`;
    if ('all' in when) return when.all.map(conditionExpression).join(' && ') || 'true';
    if ('any' in when) return `(${when.any.map(conditionExpression).join(' || ') || 'false'})`;
  }
  return 'true';
}

function valueExpression(value) {
  if (value && typeof value === 'object' && 'expression' in value) return String(value.expression);
  return quote(value);
}

function sampleExpression(samples, select) {
  const values = new Map();
  for (const sample of samples) {
    const value = select(sample);
    if (value !== undefined && !values.has(sample.state)) values.set(sample.state, value);
  }
  if (!values.size) return null;
  const unique = new Set([...values.values()].map(stable));
  if (unique.size === 1) return valueExpression(values.values().next().value);
  return `(${quote(Object.fromEntries(values))})[state]`;
}

function selectExpression(operations, fallback = 'undefined') {
  return operations.reduceRight((otherwise, operation) => `(${conditionExpression(operation.when)}) ? ${operation.remove ? 'undefined' : valueExpression(operation.value)} : ${otherwise}`, fallback);
}

function attributes(node) {
  const attrs = [`data-part=${quote(node.operation.part)}`];
  const grouped = new Map();
  for (const operation of node.operations) {
    if (operation.kind !== 'attribute.set' && operation.kind !== 'attribute.remove') continue;
    const values = grouped.get(operation.name) ?? [];
    values.push({ ...operation, remove: operation.kind === 'attribute.remove' });
    grouped.set(operation.name, values);
  }
  for (const [name, operations] of [...grouped].sort(([left], [right]) => left.localeCompare(right))) {
    if (name === 'data-part') continue;
    attrs.push(directive(name, selectExpression(operations, name === 'class' ? "''" : 'undefined')));
  }
  const events = new Map();
  for (const operation of node.operations.filter(item => item.kind === 'event.listen')) if (!events.has(operation.event)) events.set(operation.event, operation);
  for (const [event, operation] of events) attrs.push(`@${event}="dispatch(${quote(operation.dispatch)}, $event)"`);
  return attrs.join(' ');
}

function renderNode(node, depth = 1) {
  const pad = '  '.repeat(depth);
  const sample = node.samples[0] ?? {};
  const tag = sample.tag || (node.operation.kind === 'node.text' ? 'span' : 'div');
  const children = node.children.map(child => renderNode(child, depth + 1)).join('\n');
  const textOperations = node.operations.filter(item => item.kind === 'node.text');
  const textExpression = selectExpression(textOperations, "''");
  const ownText = children || !textOperations.length ? '' : `{{ ${textExpression} }}`;
  const body = children ? `\n${children}\n${pad}` : ownText;
  const element = voidTags.has(tag) ? `<${tag} ${attributes(node)} />` : `<${tag} ${attributes(node)}>${body}</${tag}>`;
  const visible = node.operation.when === null || node.operation.when === undefined ? null : conditionExpression(node.operation.when);
  return `${pad}${visible ? `<template v-if='${escapeAttribute(visible)}'>${element}</template>` : element}`;
}

function renderShard(shard, component) {
  const model = operationModel(shard, component);
  const transitions = model.stateOperations.filter(item => item.kind === 'state.transition');
  const transitionData = transitions.map(({ kind, part, ...transition }) => transition);
  const propLines = Object.entries(shard.inputs).map(([name, spec]) => `  ${name}: { default: ${quote(spec.default ?? null)} },`).join('\n');
  const roots = model.roots.map(node => renderNode(node)).join('\n');
  const portalTargets = [...new Set(model.portals.filter(item => item.kind === 'portal.mount').map(item => item.target))];
  const template = portalTargets.length ? portalTargets.map(target => `  <Teleport to=${quote(target)}>${roots}</Teleport>`).join('\n') : roots;
  return `<script setup>\nimport { ref, watch } from 'vue'\nconst props = defineProps({\n${propLines}${propLines ? '\n' : ''}  state: { type: String, default: ${quote(shard.initialState)} },\n})\nconst emit = defineEmits(['operation'])\nconst state = ref(props.state)\nconst viewport = typeof window === 'undefined' ? 1440 : window.innerWidth\nwatch(() => props.state, value => { state.value = value })\nconst transitions = ${JSON.stringify(transitionData)}\nfunction dispatch(operation, event) {\n  const transition = transitions.find(item => item.event === operation && (item.from === '*' || item.from === state.value))\n  if (transition) state.value = transition.to\n  emit('operation', { operation, event, state: state.value })\n}\n</script>\n\n<template>\n${template}\n</template>\n`;
}

export function lowerPlan(plan, ir, inputs) {
  const components = new Map(ir.components.map(component => [component.name, component]));
  return [...plan.shards].sort((a, b) => a.key.localeCompare(b.key)).map(shard => {
    const component = components.get(shard.key);
    if (!component) throw new Error(`plan shard has no IR authority: ${shard.key}`);
    const source = renderShard(shard, component);
    const name = pascal(shard.key);
    return {
      name,
      source,
      map: { version: 3, file: `${name}.vue`, sources: [component.provenance.source?.oxc?.path ?? inputs.ir.path], sourcesContent: [stable(component)], names: shard.operations.map(item => item.part).filter(Boolean), mappings: '' },
      provenance: { schemaVersion: 'kumo.vue-provenance/v2', source: inputs, lowerer: inputs.lowerer, ir: component.provenance, plan: { schemaVersion: plan.schemaVersion, manifestDigest: plan.manifestDigest, shard: shard.shard, contentDigest: shard.contentDigest } }
    };
  });
}

export function compile({ write = true } = {}) {
  const authority = readAuthority();
  const lowererBytes = fs.readFileSync(fileURLToPath(import.meta.url), 'utf8');
  const inputs = {
    ir: { path: path.relative(root, irFile), sha256: sha(authority.irBytes), schemaVersion: authority.ir.schemaVersion },
    descriptor: { path: path.relative(root, descriptorFile), sha256: sha(authority.descriptorBytes), id: authority.descriptor.id },
    lowerer: { path: path.relative(root, fileURLToPath(import.meta.url)), sha256: sha(lowererBytes) }
  };
  const shards = lowerPlan(authority.plan, authority.ir, inputs);
  const outputs = [];
  if (write) fs.mkdirSync(outDir, { recursive: true });
  for (const shard of shards) {
    const files = { [`${shard.name}.vue`]: shard.source, [`${shard.name}.vue.map`]: `${stable(shard.map)}\n`, [`${shard.name}.provenance.json`]: `${stable(shard.provenance)}\n` };
    for (const [relative, bytes] of Object.entries(files)) {
      if (write) fs.writeFileSync(path.join(outDir, relative), bytes);
      outputs.push({ file: `generated/${relative}`, bytes: Buffer.byteLength(bytes), sha256: sha(bytes) });
    }
  }
  return outputs.sort((a, b) => a.file.localeCompare(b.file));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const started = performance.now();
  const outputs = compile();
  console.log(JSON.stringify({ outputs, elapsedMs: +(performance.now() - started).toFixed(3) }, null, 2));
}
