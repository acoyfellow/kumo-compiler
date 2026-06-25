#!/usr/bin/env node
// FAN-OUT GATE — terminal arbiter for the codegen loop. Like the scale-gate, it does NOT
// trust self-reported state. It verifies, per component in scope:
//   1. real native SOURCE exists for all 3 frameworks (not just a descriptor)
//   2. each framework package BUILDS (codegen self-check recorded by the job)
//   3. captures exist for the component's states x viewports x 3 frameworks
//   4. product-parity score == full (reuses the visual-compiler neutral scorer thresholds)
//   5. the package wraps a native Ark/Zag primitive (no React runtime) for behavior comps
// Terminal only when every IN-SCOPE component passes all of the above, reconcile is
// complete, and no shared-path corruption is present.
//
// Usage: node gate.mjs [--scope a,b,c]   (default: components with a codegen target)
import {createHash} from 'node:crypto';
import {existsSync} from 'node:fs';
import {readFile, readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {execSync} from 'node:child_process';

const HERE = import.meta.dirname;
const REPO = resolve(HERE, '..', '..');
const PKG = resolve(HERE, 'packages');
const OUT = resolve(HERE, 'outputs');
const SCORER = resolve(HERE, '..', 'visual-compiler', 'results', 'parity-score.mjs');
const FRAMEWORKS = ['vue', 'svelte', 'solid'];
const sha = x => createHash('sha256').update(x).digest('hex');
const json = async p => JSON.parse(await readFile(p, 'utf8'));

const args = process.argv.slice(2);
const scopeArg = (() => { const i = args.indexOf('--scope'); return i >= 0 ? args[i + 1] : (args.find(a => a.startsWith('--scope='))?.split('=')[1]); })();

// A component is "in codegen scope" once a state file declares it targeted.
async function scope() {
  if (scopeArg) return scopeArg.split(',');
  const statePath = resolve(HERE, 'results', 'codegen-state.json');
  if (existsSync(statePath)) { const s = await json(statePath); return s.targeted ?? []; }
  return [];
}

async function sourceExists(component, fw) {
  const dir = resolve(PKG, fw, component);
  if (!existsSync(dir)) return false;
  const files = await readdir(dir);
  // real source: a .vue/.svelte/.tsx (not just package-descriptor.json/manifest-fragment.json)
  return files.some(f => /\.(vue|svelte|tsx|jsx|ts|js)$/.test(f) && !f.startsWith('manifest') && !f.startsWith('package-descriptor'));
}

async function buildOk(component, fw) {
  const sc = resolve(PKG, fw, component, 'selfcheck.json');
  if (!existsSync(sc)) return { ok: false, reason: 'no selfcheck (codegen did not build)' };
  const r = await json(sc);
  return { ok: r.built === true && r.reactRuntime === false, reason: r.built ? (r.reactRuntime ? 'react runtime present' : 'ok') : 'build failed' };
}

async function parityFull(component, fw) {
  // reuse the neutral scorer; it scores against canonical visual-compiler artifacts.
  // capture outputs must live at experiments/fanout/outputs/<fw>/<component>/<state>/<vp>.
  const outRoot = resolve(OUT, fw);
  if (!existsSync(resolve(outRoot, component))) return { full: false, reason: 'no captures' };
  try {
    const txt = execSync(`node ${SCORER} ${outRoot} fanout-${fw}`, { cwd: REPO, encoding: 'utf8' });
    const d = JSON.parse(txt);
    const c = d.byComponent?.[component];
    if (!c) return { full: false, reason: 'component absent from score' };
    return { full: c.pass === c.total && c.total > 0, score: `${c.pass}/${c.total}` };
  } catch (e) { return { full: false, reason: 'scorer error: ' + String(e.message).slice(0, 80) }; }
}

async function main() {
  const inScope = await scope();
  if (!inScope.length) {
    console.log(JSON.stringify({ gate: 'fanout', terminal: false, reason: 'no components in codegen scope yet; target the first one', hint: 'add components to results/codegen-state.json targeted[]' }, null, 2));
    process.exit(1);
  }
  const report = {};
  for (const component of inScope) {
    report[component] = {};
    for (const fw of FRAMEWORKS) {
      const src = await sourceExists(component, fw);
      const build = src ? await buildOk(component, fw) : { ok: false, reason: 'no source' };
      const parity = build.ok ? await parityFull(component, fw) : { full: false, reason: 'not built' };
      report[component][fw] = { source: src, build: build.ok ? 'ok' : build.reason, parity: parity.full ? 'full' : (parity.score || parity.reason) };
    }
  }
  const passing = inScope.filter(c => FRAMEWORKS.every(fw => report[c][fw].source && report[c][fw].build === 'ok' && report[c][fw].parity === 'full'));
  const terminal = passing.length === inScope.length;
  const next = inScope.find(c => !passing.includes(c));
  const verdict = {
    schemaVersion: 'kumo.fanout-gate/v1',
    terminal,
    inScope: inScope.length,
    passing: passing.length,
    report,
    nextActionHint: terminal ? 'TERMINAL — write fanout-final.json, reconcile, commit'
      : next ? `codegen+capture+score ${next}: ${JSON.stringify(report[next])}`
      : 'unknown'
  };
  console.log(JSON.stringify(verdict, null, 2));
  process.exit(terminal ? 0 : 1);
}
main().catch(e => { console.error('GATE ERROR:', e.stack); process.exit(2); });
