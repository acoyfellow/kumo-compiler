#!/usr/bin/env node
// Generate the homepage's data.json from REAL sources: codegen-state (done/order),
// reconcile.json, blocked.json, and live parity scores. Nothing hardcoded.
import {execSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {readFile, writeFile, mkdir, readdir, copyFile, rm} from 'node:fs/promises';
import {resolve, join} from 'node:path';

const HERE = import.meta.dirname, FANOUT = resolve(HERE, '..'), REPO = resolve(FANOUT, '..', '..');
const json = async p => JSON.parse(await readFile(p, 'utf8'));

async function main() {
  const state = await json(resolve(FANOUT, 'results/codegen-state.json'));
  const blocked = existsSync(resolve(FANOUT, 'results/blocked.json')) ? await json(resolve(FANOUT, 'results/blocked.json')) : { components: {} };
  const reconcile = existsSync(resolve(FANOUT, 'results/reconcile.json')) ? await json(resolve(FANOUT, 'results/reconcile.json')) : null;

  // Live parity per framework for the done overlays (re-run the neutral scorer, do not trust cache).
  const frameworks = ['vue', 'svelte', 'solid'];
  const parity = {};
  for (const fw of frameworks) {
    try {
      const out = execSync(`node experiments/visual-compiler/results/parity-score.mjs experiments/fanout/outputs/${fw} fanout-${fw}`, { cwd: REPO, encoding: 'utf8' });
      const d = JSON.parse(out);
      parity[fw] = Object.fromEntries(state.done.map(c => [c, d.byComponent?.[c] ?? null]));
    } catch { parity[fw] = {}; }
  }

  const overlays = state.order.map(name => {
    const done = state.done.includes(name);
    const per = Object.fromEntries(frameworks.map(fw => {
      const p = parity[fw]?.[name];
      return [fw, p ? { pass: p.pass, total: p.total } : null];
    }));
    return {
      name, done,
      status: done ? 'done' : 'todo',
      parity: per,
      blockedReason: blocked.components?.[name]?.reason ?? null
    };
  });

  const data = {
    schemaVersion: 'kumo.fanout-homepage-data/v1',
    generatedAt: new Date().toISOString(),
    summary: {
      overlaysDone: state.done.length,
      overlaysTotal: state.order.length,
      frameworks
    },
    overlays,
    reconcile: reconcile ? { status: reconcile.status, perFramework: reconcile.perFramework } : null
  };
  await mkdir(resolve(HERE, 'src'), { recursive: true });
  await writeFile(resolve(HERE, 'src', 'data.json'), JSON.stringify(data, null, 2) + '\n');

  // Copy the done overlays' real native source into site/src/components/<fw>/ so Vite
  // globs them inside the root (globs do not reliably traverse outside root / symlinks).
  const compDir = resolve(HERE, 'src', 'components');
  await rm(compDir, { recursive: true, force: true });
  for (const fw of frameworks) {
    for (const c of state.done) {
      const srcDir = resolve(FANOUT, 'packages', fw, c);
      if (!existsSync(srcDir)) continue;
      const files = (await readdir(srcDir)).filter(f => /\.(vue|svelte|tsx)$/.test(f));
      const destDir = resolve(compDir, fw, c);
      await mkdir(destDir, { recursive: true });
      for (const f of files) await copyFile(join(srcDir, f), join(destDir, f));
    }
  }
  // Vendor the Kumo standalone CSS into the site (gitignored; regenerated each build).
  await copyFile(resolve(REPO,'node_modules/@cloudflare/kumo/dist/styles/kumo-standalone.css'), resolve(HERE,'kumo.css'));
  console.log(`homepage data: ${state.done.length}/${state.order.length} overlays done; copied native source for ${frameworks.length}×${state.done.length}`);
}
main().catch(e => { console.error(e.stack); process.exit(1); });
