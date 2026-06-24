#!/usr/bin/env node
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { lower as makePlan, validatePlan, stable } from '../core/core.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const spike = path.resolve(here, '../..');
const irPath = path.join(spike, 'ir/fixtures/components.json');
const acceptancePath = path.join(spike, 'ir/results.json');
const outDir = path.join(here, 'generated');
const sha = value => createHash('sha256').update(value).digest('hex');
const q = value => JSON.stringify(value);
const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const nativeBooleanAttributes = new Set(['allowfullscreen', 'async', 'autofocus', 'autoplay', 'checked', 'controls', 'default', 'defer', 'disabled', 'formnovalidate', 'hidden', 'inert', 'ismap', 'itemscope', 'loop', 'multiple', 'muted', 'nomodule', 'novalidate', 'open', 'playsinline', 'readonly', 'required', 'reversed', 'selected']);

function expression(value) {
  if (value && typeof value === 'object' && typeof value.expression === 'string') return value.expression;
  return q(value);
}
function condition(when) {
  if (when === null || when === undefined) return 'true';
  if (typeof when === 'string') return when;
  if (typeof when === 'boolean') return String(when);
  if (typeof when === 'object' && typeof when.expression === 'string') return when.expression;
  if (typeof when === 'object' && typeof when.state === 'string') return `state === ${q(when.state)}`;
  const cells = when?.cells?.map(cell => `(state === ${q(cell.state)} && viewport === ${q(cell.viewport)})`);
  if (cells?.length) return `(${cells.join(' || ')})`;
  const states = when?.states?.map(value => `state === ${q(value)}`) ?? [];
  const viewports = when?.viewports?.map(value => `viewport === ${q(value)}`) ?? [];
  return [...(states.length ? [`(${states.join(' || ')})`] : []), ...(viewports.length ? [`(${viewports.join(' || ')})`] : [])].join(' && ') || 'true';
}
function elementTag(tag) {
  const candidate = String(tag || 'div').toLowerCase();
  return /^[a-z][a-z0-9-]*$/.test(candidate) ? candidate : 'div';
}
function merged(ops, kind, key, mapValue = expression) {
  const values = ops.filter(op => op.kind === kind && (!key || op.name === key));
  if (!values.length) return null;
  return values.map(op => `((${condition(op.when)}) ? ${mapValue(op.value, op)} : undefined)`).join(' ?? ');
}
function attributeExpression(ops, name) {
  return merged(ops, 'attribute.set', name, value => nativeBooleanAttributes.has(name.toLowerCase()) ? 'true' : expression(value));
}
function explicitPartExpression(create, ops) {
  const candidates = [create, ...ops.filter(op => op.kind === 'node.create')].filter(op => op.explicitPart !== null && op.explicitPart !== undefined);
  if (!candidates.length) return null;
  return candidates.map(op => `((${condition(op.when)}) ? ${q(op.explicitPart)} : undefined)`).join(' ?? ');
}
function renderNode(item, depth = 0) {
  const pad = '  '.repeat(depth);
  if (item.create.kind === 'node.text') return `${pad}{String(${merged([item.create], 'node.text') ?? expression(item.create.value ?? '')})}`;
  const tag = elementTag(item.create.tag);
  const attributes = [];
  const explicitPart = explicitPartExpression(item.create, item.creates);
  if (explicitPart) attributes.push(`data-part={${explicitPart}}`);
  const names = [...new Set(item.ops.filter(op => op.kind === 'attribute.set' && op.name !== 'class' && op.name !== 'data-part').map(op => op.name))];
  for (const name of names) attributes.push(`${name}={${attributeExpression(item.ops, name)}}`);
  const classes = [...new Set(item.ops.filter(op => op.kind === 'class.add').map(op => op.value))];
  if (classes.length) attributes.push(`class={{${classes.map(value => `${q(value)}: ${item.ops.filter(op => op.kind === 'class.add' && op.value === value).map(op => `(${condition(op.when)})`).join(' || ')}`).join(', ')}}}`);
  const eventGroups=new Map();for(const op of item.ops.filter(op=>op.kind==='event.listen')){const group=eventGroups.get(op.event)??[];group.push(op);eventGroups.set(op.event,group)}
  for(const [event,ops] of eventGroups){const expression=ops.map(op=>`(${condition(op.when)}) ? dispatch(${q(op.dispatch)}, ${q(op.value)}, event) : `).join('')+'undefined';attributes.push(`on${event}={(event) => ${expression}}`)}
  const text = item.children.some(child => child.create.kind === 'node.text') ? null : merged(item.ops, 'node.text');
  // Emit a TIGHT body (no formatting newlines/indentation) for two element classes:
  //  (1) whitespace-significant elements (pre/textarea, white-space:pre*) where injected
  //      whitespace would render visibly; and
  //  (2) restricted content-model elements (table family, lists, select groups) where a
  //      whitespace text node is an illegal child the Svelte compiler rejects
  //      (`<#text> cannot be a child of <table>`).
  const RESTRICTED = new Set(['table','thead','tbody','tfoot','tr','colgroup','ul','ol','select','optgroup','dl','menu']);
  const restricted = RESTRICTED.has(tag); // content model forbids direct text nodes
  const ws = (item.create.style && /^pre/.test(item.create.style['white-space'] || '')) || tag === 'pre' || tag === 'textarea' || restricted;
  const children = item.children.map(child => renderNode(child, ws ? 0 : depth + 1)).join(ws ? '' : '\n');
  let source;
  if (voidTags.has(tag)) source = `${pad}<${tag} ${attributes.join(' ')} />`;
  else if (ws) {
    // tight body: no surrounding whitespace. Restricted-content elements (table/list
    // family) may not contain a text-node child at all, so suppress the text expression.
    const tbody = (text && !restricted ? `{String(${text} ?? '')}` : '') + children;
    source = `${pad}<${tag} ${attributes.join(' ')}>${tbody}</${tag}>`;
  } else {
    const body = [text ? `${pad}  {String(${text} ?? '')}` : '', children].filter(Boolean).join('\n');
    source = `${pad}<${tag} ${attributes.join(' ')}>${body ? `\n${body}\n${pad}` : ''}</${tag}>`;
  }
  const presence = condition(item.create.when);
  if (presence !== 'true') source = `${pad}{#if ${presence}}\n${source}\n${pad}{/if}`;
  if (item.portal) source = `${pad}{#if ${condition(item.portal.when)}}\n${pad}  {@const portalTarget = ${expression(item.portal.target)}}\n${source}\n${pad}{/if}`;
  return source;
}
function emit(shard) {
  const nodes = new Map();
  for (const create of shard.operations.filter(op => op.kind === 'node.create')) {
    const item = nodes.get(create.part);
    if (item) item.creates.push(create);
    else nodes.set(create.part, { create, creates: [create], ops: [], children: [], portal: null });
  }
  for (const op of shard.operations) if (op.part !== null && nodes.has(op.part) && op.kind !== 'node.create') nodes.get(op.part).ops.push(op);
  const roots = [];
  for (const item of nodes.values()) {
    if (item.create.parent !== null && nodes.has(item.create.parent)) nodes.get(item.create.parent).children.push(item);
    else {
      item.portal = item.ops.find(op => op.kind === 'portal.mount') ?? null;
      roots.push(item);
    }
  }
  for (const item of nodes.values()) item.children.sort((a, b) => (a.create.order ?? 0) - (b.create.order ?? 0));
  roots.sort((a, b) => (a.create.order ?? 0) - (b.create.order ?? 0));
  const defaults = Object.entries(shard.inputs).map(([name, spec]) => `${name} = ${q(spec?.default)}`);
  const transitions = shard.operations.filter(op => op.kind === 'state.transition');
  const script = `<script>\n  let { ${[...defaults, `state = ${q(shard.initialState)}`, 'viewport = 1440', 'dispatch = () => {}'].join(', ')} } = $props();\n  const transitions = ${q(transitions)};\n</script>`;
  return `${script}\n\n${roots.map(root => renderNode(root)).join('\n')}\n`;
}
export async function lower({ write = true } = {}) {
  const [raw, acceptedRaw] = await Promise.all([readFile(irPath, 'utf8'), readFile(acceptancePath, 'utf8')]);
  const ir = JSON.parse(raw), accepted = JSON.parse(acceptedRaw);
  if (accepted.status !== 'passed' || accepted.winner?.id !== 'part-first' || accepted.winner?.coreIRSha256 !== sha(raw)) throw new Error('part-first IR is not authority-accepted');
  const plan = makePlan(ir);
  const validation = validatePlan(plan);
  if (!validation.valid) throw new Error(validation.errors.join('\n'));
  const files = plan.shards.map(shard => {
    const content = emit(shard);
    return { path: `${shard.shard.slice(0, -5)}.svelte`, key: shard.key, content, sha256: sha(content), provenance: { coreIR: shard.provenance, coreIRSha256: sha(raw), planManifestDigest: plan.manifestDigest, planShardDigest: shard.contentDigest } };
  }).sort((a, b) => a.path.localeCompare(b.path));
  const manifest = { schemaVersion: 'kumo.svelte-shards/v1', target: 'svelte-5', ssr: true, hydratable: true, input: { schemaVersion: plan.schemaVersion, manifestDigest: plan.manifestDigest }, files };
  if (write) {
    await rm(outDir, { recursive: true, force: true }); await mkdir(outDir, { recursive: true });
    for (const file of files) await writeFile(path.join(outDir, file.path), file.content);
    await writeFile(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  }
  return manifest;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) { const start = performance.now(); const result = await lower(); console.log(JSON.stringify({ shards: result.files.length, digest: sha(stable(result.files.map(file => file.sha256))), ms: +(performance.now() - start).toFixed(3) })); }
