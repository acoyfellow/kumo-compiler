#!/usr/bin/env node
// FAN-OUT JOB — builds ONE component's native package for ONE framework from the frozen
// substrate. Pure, isolated: reads ONLY the frozen substrate contract; writes ONLY
// packages/<framework>/<component>/. No shared mutable state. Safe to run in parallel
// as long as (component, framework) pairs are disjoint (one writer per path).
//
// Usage: node build-component.mjs <component> <framework>
//   framework in {vue, svelte, solid}
//
// Output: packages/<fw>/<component>/{component source, manifest.json}
// The manifest fragment is what reconcile merges; the job never touches index files.
import {createHash} from 'node:crypto';
import {existsSync} from 'node:fs';
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';

const HERE = import.meta.dirname;
const ROOT = resolve(HERE, '..');
const sha = x => createHash('sha256').update(x).digest('hex');
const json = async p => JSON.parse(await readFile(p, 'utf8'));

const [component, framework] = process.argv.slice(2);
if (!component || !framework) { console.error('usage: build-component <component> <framework>'); process.exit(2); }
if (!['vue', 'svelte', 'solid'].includes(framework)) { console.error('framework must be vue|svelte|solid'); process.exit(2); }

// Behavior binding plan: which Ark/Zag primitive backs this component. Components with a
// pure-presentational contract need no behavior primitive (bind: null). Behavior-heavy
// components name their Ark module + part->primitive mapping. This table is the ONLY
// per-component knowledge, and it lives in the substrate layer (data), not in a lowerer.
const BINDINGS = {
  'dropdown-menu': { ark: 'menu', primitives: { trigger: 'Trigger', content: 'Content', item: 'Item' } },
  'select':        { ark: 'select', primitives: { trigger: 'Trigger', content: 'Content', item: 'Item' } },
  'dialog':        { ark: 'dialog', primitives: { trigger: 'Trigger', content: 'Content', close: 'CloseTrigger' } },
  'popover':       { ark: 'popover', primitives: { trigger: 'Trigger', content: 'Content' } },
  'combobox':      { ark: 'combobox', primitives: { trigger: 'Trigger', content: 'Content', item: 'Item' } },
  'menu-bar':      { ark: 'menu', primitives: {} },
  'toasty':        { ark: 'toast', primitives: {} },
  'date-picker':   { ark: 'date-picker', primitives: {} },
  'date-range-picker': { ark: 'date-picker', primitives: {} },
  'sidebar':       { ark: null, primitives: {} },
  'command-palette': { ark: 'combobox', primitives: {} },
  'autocomplete':  { ark: 'combobox', primitives: {} }
};

async function main() {
  const contractPath = resolve(ROOT, 'substrate', 'contracts', `${component}.json`);
  if (!existsSync(contractPath)) { console.error(`no substrate contract for ${component}`); process.exit(1); }
  const contract = await json(contractPath);
  const binding = BINDINGS[component] ?? { ark: null, primitives: {} };

  // The styling layer: per part, the class list per state (framework-neutral data).
  const styleContract = contract.parts.map(p => ({
    part: p.part, tag: p.tag, role: p.role,
    classesByState: p.classesByCell, attrsByState: p.attrsByCell,
    text: p.textByCell, childText: p.childTextByCell
  }));

  // Emit a package descriptor. For presentational contracts this is a direct render plan;
  // for behavior-backed contracts it records the Ark primitive to wrap and the class map to
  // attach onto each data-part anchor. The actual framework codegen for behavior components
  // is the per-component work that follows — this job proves the isolated build + manifest
  // fragment that reconcile merges.
  const pkgDir = resolve(ROOT, 'packages', framework, component);
  await mkdir(pkgDir, { recursive: true });
  const descriptor = {
    schemaVersion: 'kumo.fanout-package/v1',
    component, framework,
    behavior: binding.ark ? { library: '@ark-ui/' + framework, module: binding.ark, primitives: binding.primitives } : { kind: 'presentational' },
    styleContract,
    substrateDigest: sha(JSON.stringify(contract)),
    builtAt: new Date().toISOString()
  };
  const bytes = Buffer.from(JSON.stringify(descriptor, null, 2) + '\n');
  await writeFile(resolve(pkgDir, 'package-descriptor.json'), bytes);
  // Manifest fragment: what reconcile collects (never an index file).
  const fragment = {
    component, framework,
    descriptorDigest: sha(bytes),
    behaviorBacked: Boolean(binding.ark),
    parts: styleContract.length
  };
  await writeFile(resolve(pkgDir, 'manifest-fragment.json'), JSON.stringify(fragment, null, 2) + '\n');
  console.log(`built ${framework}/${component}: ${styleContract.length} parts, behavior=${binding.ark ?? 'none'}`);
}
main().catch(e => { console.error(e.stack); process.exit(1); });
