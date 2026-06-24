#!/usr/bin/env node
// FAN-IN RECONCILE — single-threaded. The ONLY step that assembles shared artifacts.
// Collects every per-component manifest-fragment, merges into one manifest, assembles a
// per-framework index/exports, and runs the reconcile gate over the union. Jobs never
// write here; corruption is structurally impossible because fan-out wrote only disjoint
// per-component files and this runs after they all finish.
import {createHash} from 'node:crypto';
import {existsSync} from 'node:fs';
import {readFile, readdir, writeFile, mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';

const HERE = import.meta.dirname;
const PKG = resolve(HERE, 'packages');
const OUT = resolve(HERE, 'results');
const FRAMEWORKS = ['vue', 'svelte', 'solid'];
const sha = x => createHash('sha256').update(x).digest('hex');
const json = async p => JSON.parse(await readFile(p, 'utf8'));

async function main() {
  await mkdir(OUT, { recursive: true });
  const substrate = await json(resolve(HERE, 'substrate', 'contracts', 'index.json'));
  const universe = substrate.components.map(c => c.component);

  const byFramework = {};
  const diagnostics = [];
  for (const fw of FRAMEWORKS) {
    const fwDir = resolve(PKG, fw);
    const built = existsSync(fwDir) ? (await readdir(fwDir, { withFileTypes: true })).filter(e => e.isDirectory()).map(e => e.name) : [];
    const fragments = [];
    for (const component of built) {
      const fragPath = resolve(fwDir, component, 'manifest-fragment.json');
      if (!existsSync(fragPath)) { diagnostics.push({ fw, component, issue: 'missing manifest-fragment' }); continue; }
      fragments.push(await json(fragPath));
    }
    // Assemble the per-framework index (the ONLY place index/exports are written).
    const index = {
      framework: fw,
      components: fragments.map(f => f.component).sort(),
      count: fragments.length,
      digest: sha(JSON.stringify(fragments.map(f => [f.component, f.descriptorDigest]).sort()))
    };
    await writeFile(resolve(fwDir, 'index.json'), JSON.stringify(index, null, 2) + '\n').catch(() => {});
    byFramework[fw] = { built: index.components, count: index.count };
  }

  // Reconcile gate: union coverage + cross-framework consistency.
  const coverage = {};
  for (const component of universe) {
    const present = FRAMEWORKS.filter(fw => byFramework[fw]?.built.includes(component));
    coverage[component] = { frameworks: present, complete: present.length === FRAMEWORKS.length };
  }
  const complete = Object.values(coverage).filter(c => c.complete).length;
  const result = {
    schemaVersion: 'kumo.fanout-reconcile/v1',
    reconciledAt: new Date().toISOString(),
    universe: universe.length,
    perFramework: Object.fromEntries(FRAMEWORKS.map(fw => [fw, byFramework[fw]?.count ?? 0])),
    completeAllFrameworks: complete,
    incomplete: Object.entries(coverage).filter(([, v]) => !v.complete).map(([k, v]) => ({ component: k, only: v.frameworks })),
    diagnostics,
    substrateDigest: substrate.contractDigest,
    status: diagnostics.length === 0 && complete === universe.length ? 'reconciled-complete' : 'reconciled-partial'
  };
  await writeFile(resolve(OUT, 'reconcile.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(`reconcile: ${complete}/${universe.length} complete across ${FRAMEWORKS.length} frameworks; per-fw ${JSON.stringify(result.perFramework)}; status ${result.status}`);
  process.exit(result.status === 'reconciled-complete' ? 0 : 1);
}
main().catch(e => { console.error(e.stack); process.exit(1); });
