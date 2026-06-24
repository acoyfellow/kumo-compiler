#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';
import { lower as plan, validatePlan } from '../core/core.mjs';
const nativeBooleanAttributes = new Set(['disabled', 'checked', 'required', 'readonly', 'multiple', 'selected', 'autofocus', 'hidden', 'open', 'indeterminate']);
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
  // Prefer the `class` attribute.set when present: it preserves CANONICAL class order
  // (class.add ops are alphabetically sorted by the tracer, which can shift sub-pixel
  // placeholder/text rendering). Fall back to class.add only when no class attribute.set
  // exists. This matches the Vue lowerer (which emits the ordered class attribute).
  const hasClassAttr = node.ops.some(op => op.kind === 'attribute.set' && op.name === 'class');
  if (!hasClassAttr) {
    const classAddOps = node.ops.filter(op => op.kind === 'class.add');
    const classes = classAddOps.map(op => conditional(op.value, op.when));
    if (classes.length) attrs.push(`class={${classes.length === 1 ? classes[0] : `[${classes.join(', ')}].filter(Boolean).join(" ")`}}`);
  }
  const setOps = node.ops.filter(op => op.kind === 'attribute.set');
  const setByName = new Map();
  for (const op of setOps) { const list = setByName.get(op.name) ?? []; list.push(op); setByName.set(op.name, list); }
  for (const [attrName, ops] of setByName) {
    // Merge all same-name attribute.set ops into ONE chained-ternary expression so
    // JSX keeps a single attribute (multiple same-name JSX attrs => only last wins).
    // A boolean-typed value coerces to `true` ONLY for genuine HTML boolean attributes
    // or data-* presence attributes; otherwise an empty string is a string (e.g.
    // class="" must stay empty, never become "true"). Mirrors the Vue lowerer.
    const presenceAttr = nativeBooleanAttributes.has(attrName.toLowerCase()) || attrName.startsWith('data-');
    const val = op => (op.valueType === 'boolean' && presenceAttr) ? expression(true) : expression(op.value);
    // `value` maps to a DOM property that coerces undefined -> the string "undefined" on
    // hydration; its absent-fallback must be an empty string, not undefined. Other
    // attributes use undefined (omits the attribute).
    const absent = attrName.toLowerCase() === 'value' ? "''" : 'undefined';
    // Build right-to-left so an unconditional op becomes the fallback; conditional
    // ops wrap it as (cond) ? value : <rest>.
    const finalExpr = ops.reduceRight((rest, op) =>
      op.when == null ? val(op) : `(${predicate(op.when)}) ? ${val(op)} : ${rest}`, absent);
    attrs.push(`${attrName}={${finalExpr}}`);
  }
  for (const op of node.ops.filter(op => op.kind === 'attribute.remove')) attrs.push(`${op.name}={${op.when == null ? 'undefined' : `!(${condition(op.when)}) ? props.attributes?.[${q(op.name)}] : undefined`}}`);
  for (const op of node.ops.filter(op => op.kind === 'event.listen')) attrs.push(`on${op.event}={${op.when == null ? '' : `(${condition(op.when)}) ? `}() => props.dispatch?.(${q(op.dispatch ?? op.event)})${op.when == null ? '' : ' : undefined'}}`);
  // `type` is NOT auto-injected: canonical text inputs carry no type attribute and the
  // IR already provides type via attribute.set when it is real (e.g. checkbox/switch
  // hidden input type="checkbox"). Auto-injecting type="text" diverged from canonical
  // and broke input placeholder-state pixel parity.
  if (create.semantics === 'dialog') attrs.push('role="dialog"');
  const allTextOps = node.ops.filter(op => op.kind === 'node.text');
  // own text = text ops without afterElement; interleaved = mixed-content fragments
  const textOps = allTextOps.filter(op => !Number.isInteger(op.afterElement));
  const interleaved = allTextOps.filter(op => Number.isInteger(op.afterElement));
  const partText = create.explicitPart == null ? '' : `{props.parts?.[${q(create.explicitPart)}]}`;
  let body;
  if (interleaved.length) {
    // splice text fragments between element children by afterElement (-1 = before first).
    // Merge ALL fragments at the same position into ONE concatenated expression so Solid
    // emits a single text node (adjacent {" of"}{" "} expressions collapse the standalone
    // whitespace; "" + " of" + " " preserves it as one node).
    const textAt = idx => { const ops = interleaved.filter(op => op.afterElement === idx); if (!ops.length) return ''; return `{${ops.map(op => `(${conditional(op.value, op.when, q(''))})`).join(' + ')}}`; };
    let assembled = partText + textAt(-1);
    node.children.forEach((child, i) => { assembled += `\n${render(child, depth + 1)}` + textAt(i); });
    body = assembled + (node.children.length ? `\n${pad}` : '');
  } else {
    body = `${partText}${textOps.map(op => `{${conditional(op.value, op.when, q(''))}}`).join('')}${node.children.map(child => `\n${render(child, depth + 1)}`).join('')}${node.children.length ? `\n${pad}` : ''}`;
  }
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
