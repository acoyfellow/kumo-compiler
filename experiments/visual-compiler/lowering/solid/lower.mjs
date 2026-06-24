#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';
import { lower as plan, validatePlan } from '../core/core.mjs';
import { guardSource } from '../core/guard.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const awaitSource = await readFile(fileURLToPath(import.meta.url), 'utf8');
const spike = resolve(here, '../..');
const irPath = join(spike, 'ir/fixtures/components.json');
const descriptorPath = join(spike, 'ir/candidates/part-first.json');
const output = join(here, 'generated');
const sha = value => createHash('sha256').update(value).digest('hex');
const stable = value => JSON.stringify(value, null, 2) + '\n';
const q = JSON.stringify;
const pascal = value => value.replace(/(^|[^A-Za-z0-9]+)(.)/g, (_all, _separator, letter) => letter.toUpperCase()).replace(/[^A-Za-z0-9_$]/g, '');
const expression = value => typeof value === 'string' && /^(props\.|state\(\))/.test(value) ? value : q(value);
const condition = value => value == null ? null : typeof value === 'string' ? value : q(value);
const predicate = when => {
  if (when == null) return 'true';
  if (typeof when === 'string') return when;
  const checks = [];
  if (when.states?.length) checks.push(`${q(when.states)}.includes(state())`);
  if (when.viewports?.length) checks.push(`${q(when.viewports)}.includes(props.viewport)`);
  if (when.cells?.length) checks.push(`${q(when.cells.map(cell => `${cell.state}:${cell.viewport}`))}.includes(state() + ":" + props.viewport)`);
  return checks.length ? checks.join(' && ') : 'true';
};

function tag(create) {
  return create.tag ?? ({ button: 'button', checkbox: 'input', textbox: 'input', dialog: 'div', group: 'div', generic: 'div' })[create.semantics] ?? create.semantics ?? 'div';
}
function conditional(value, when, absent = 'undefined') { return when == null ? expression(value) : `(${predicate(when)}) ? ${expression(value)} : ${absent}`; }
function render(node, depth = 2) {
  const pad = '  '.repeat(depth), create = node.create, name = tag(create);
  const attrs = create.explicitPart == null ? [] : [`data-part=${q(create.explicitPart)}`];
  const classes = node.ops.filter(op => op.kind === 'class.add').map(op => conditional(op.value, op.when));
  if (classes.length) attrs.push(`class={${classes.length === 1 ? classes[0] : `[${classes.join(', ')}].filter(Boolean).join(" ")`}}`);
  for (const op of node.ops.filter(op => op.kind === 'attribute.set')) {
    const value = op.valueType === 'boolean' ? conditional(true, op.when, 'undefined') : conditional(op.value, op.when);
    attrs.push(`${op.name}={${value}}`);
  }
  for (const op of node.ops.filter(op => op.kind === 'attribute.remove')) attrs.push(`${op.name}={${op.when == null ? 'undefined' : `!(${condition(op.when)}) ? props.attributes?.[${q(op.name)}] : undefined`}}`);
  for (const op of node.ops.filter(op => op.kind === 'event.listen')) attrs.push(`on${op.event}={${op.when == null ? '' : `(${condition(op.when)}) ? `}() => props.dispatch?.(${q(op.dispatch ?? op.event)})${op.when == null ? '' : ' : undefined'}}`);
  const inputType=({checkbox:'checkbox',textbox:'text'})[create.semantics];
  if (name === 'input') attrs.push(`type="${inputType ?? 'text'}"`);
  if (create.semantics === 'dialog') attrs.push('role="dialog"');
  const textOps = node.ops.filter(op => op.kind === 'node.text');
  const partText = create.explicitPart == null ? '' : `{props.parts?.[${q(create.explicitPart)}]}`;
  const body = `${partText}${textOps.map(op => `{${conditional(op.value, op.when, q(''))}}`).join('')}${node.children.map(child => `\n${render(child, depth + 1)}`).join('')}${node.children.length ? `\n${pad}` : ''}`;
  let element = name === 'input' ? `<${name} ${attrs.join(' ')} />` : `<${name} ${attrs.join(' ')}>${body}</${name}>`;
  const portal = node.portal;
  if (portal) element = `<Portal mount={${portal.target}}>${element}</Portal>`;
  return `${pad}${create.when == null ? element : `{(${predicate(create.when)}) && (${element})}`}`;
}
function forest(operations) {
  const creates = operations.filter(op => op.kind === 'node.create');
  const nodes = creates.map((create, index) => ({ create, index, ops: [], children: [] }));
  const byId = new Map();
  for (const node of nodes) {
    const identities = [node.create.part, node.create.explicitPart, node.create.explicitPart == null ? null : `part:${node.create.explicitPart}`];
    for (const identity of identities) if (identity != null && !byId.has(identity)) byId.set(identity, node);
  }
  for (const op of operations) {
    if (op.kind !== 'node.create') byId.get(op.part)?.ops.push(op);
  }
  const roots = [];
  for (const node of nodes) {
    const parent = node.create.parent == null ? null : byId.get(node.create.parent);
    if (parent && parent !== node) parent.children.push(node);
    else roots.push(node);
  }
  // A portal operation may be recorded against any descendant. Mount only the
  // top-level tree containing it, never that descendant in isolation.
  const parentOf = new Map(nodes.flatMap(node => node.children.map(child => [child, node])));
  for (const node of nodes) for (const portal of node.ops.filter(op => op.kind === 'portal.mount')) {
    let portalRoot = node;
    while (parentOf.has(portalRoot)) portalRoot = parentOf.get(portalRoot);
    portalRoot.portal ??= portal;
  }
  const compare = (left, right) => (left.create.order ?? 0) - (right.create.order ?? 0) || left.index - right.index;
  for (const node of nodes) node.children.sort(compare);
  roots.sort(compare);
  return roots;
}
function emit(shard) {
  const name = pascal(shard.key), roots = forest(shard.operations);
  const usesPortal = shard.operations.some(op => op.kind === 'portal.mount');
  const transitions = shard.operations.filter(op => op.kind === 'state.transition');
  const source = `/* generated from ${shard.shard}; do not edit */\nimport { createSignal, createEffect } from "solid-js";\n${usesPortal ? 'import { Portal } from "solid-js/web";\n' : ''}import type { JSX } from "solid-js";\n\nexport interface ${name}Props {\n  state?: string;\n  parts?: Record<string, JSX.Element>;\n  attributes?: Record<string, unknown>;\n  viewport?: number;\n  dispatch?: (event: string) => void;\n}\n\nexport function ${name}(props: ${name}Props): JSX.Element {\n  const [state, setState] = createSignal(props.state ?? ${q(shard.initialState)});\n  createEffect(() => setState(props.state ?? ${q(shard.initialState)}));\n  const transition = (event: string) => {\n${transitions.map(op => `    if (event === ${q(op.event)}${op.from == null ? '' : ` && state() === ${q(op.from)}`}) setState(${q(op.to)});`).join('\n')}\n    props.dispatch?.(event);\n  };\n  void transition; void state;\n  return (\n    <>\n${roots.map(node => render(node, 3)).join('\n')}\n    </>\n  );\n}\n`;
  return { path: `${shard.key}.tsx`, source, sha256: sha(source), provenance: { planShard: shard.shard, planDigest: shard.contentDigest, authorityDigest: sha(JSON.stringify(shard.provenance)) } };
}
export function lower(ir, descriptor) {
  if (descriptor.id !== 'part-first' || descriptor.schemaVersion !== 'kumo.ir-candidate/v2') throw new Error('accepted part-first IR descriptor required');
  const loweringPlan = plan(ir), receipt = validatePlan(loweringPlan);
  if (!receipt.valid) throw new Error(receipt.errors.join('\n'));
  const files = loweringPlan.shards.map(emit).sort((a, b) => a.path.localeCompare(b.path));
  const ids = { componentIds: ir.components.map(item => item.name), partIds: ir.components.flatMap(item => item.parts.map(part => part.id)) };
  const controlFlowSource = awaitSource.split('\n').filter(line => /\b(if|switch|case|while)\b/.test(line)).join('\n');
  const lowererGuard = guardSource(controlFlowSource, ids);
  if (!lowererGuard.valid) throw new Error(`guardSource rejected generic Solid lowerer control flow: ${JSON.stringify(lowererGuard.diagnostics)}`);
  const plannedParts = new Map(loweringPlan.shards.map(shard => [shard.key, shard.operations.filter(op => op.kind === 'node.create' && op.explicitPart != null).map(op => op.explicitPart)]));
  for (const file of files) {
    const key = file.path.slice(0, -4);
    const emitted = [...file.source.matchAll(/data-part="([^"]+)"/g)].map(match => match[1]);
    const expected = plannedParts.get(key) ?? [];
    const counts = values => values.reduce((result, value) => result.set(value, (result.get(value) ?? 0) + 1), new Map());
    const expectedCounts = counts(expected), emittedCounts = counts(emitted);
    for (const [part, count] of expectedCounts) if (emittedCounts.get(part) !== count) throw new Error(`${file.path}: explicit part ${part} expected ${count} emission(s), got ${emittedCounts.get(part) ?? 0}`);
    for (const part of emittedCounts.keys()) if (!expectedCounts.has(part)) throw new Error(`${file.path}: emitted undeclared explicit part ${part}`);
  }
  return { loweringPlan, files };
}
export async function build({ clean = true } = {}) {
  const [irBytes, descriptorBytes] = await Promise.all([readFile(irPath, 'utf8'), readFile(descriptorPath, 'utf8')]);
  const started = performance.now(), { loweringPlan, files } = lower(JSON.parse(irBytes), JSON.parse(descriptorBytes));
  if (clean) await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  for (const file of files) await writeFile(join(output, file.path), file.source);
  const index = files.map(file => `export * from "./${file.path.slice(0, -4)}";`).join('\n') + '\n'; await writeFile(join(output, 'index.ts'), index);
  const manifest = { schemaVersion: 'kumo.solid-lowering-manifest/v2', target: 'solid', ssr: true, hydratable: true, inputs: { ir: relative(here, irPath), irSha256: sha(irBytes), descriptor: relative(here, descriptorPath), descriptorSha256: sha(descriptorBytes), planSchema: loweringPlan.schemaVersion, planDigest: loweringPlan.manifestDigest }, shards: files.map(({ path, sha256, provenance }) => ({ path, sha256, provenance })), indexSha256: sha(index), guardSource: 'passed' };
  await writeFile(join(output, 'manifest.json'), stable(manifest)); return { elapsedMs: performance.now() - started, manifest, files };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) { const result = await build(); console.log(`generated ${result.files.length} Solid shards in ${result.elapsedMs.toFixed(3)}ms`); }
