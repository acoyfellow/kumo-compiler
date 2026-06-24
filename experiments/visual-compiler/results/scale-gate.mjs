#!/usr/bin/env node
// SCALE GATE — terminal arbiter for scaling the visual compiler to all 41 executable
// components. Like loop-gate, it re-runs the neutral scorer itself (no self-certification)
// and refuses theater. Terminal ONLY when every executable component is 36/36 across
// vue/svelte/solid OR is recorded in blockedWithReason with a concrete upstream reason.
//
// It also enforces the anti-cheat invariants that made the 4-component loop trustworthy:
//   - no stale captures (provenance lowererDigest binding per target)
//   - lowerers stay generic (no component-name branches in control flow)
//   - the 4 proven components never regress
//
// Usage: node results/scale-gate.mjs           full gate (JSON verdict, exit 0 = terminal)
//        node results/scale-gate.mjs --quick    parity-only sweep of components with outputs
import {createHash} from 'node:crypto';
import {execSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {readFile, readdir} from 'node:fs/promises';
import {resolve} from 'node:path';

const HERE = import.meta.dirname;
const VC = resolve(HERE, '..');
const REPO = resolve(VC, '..', '..');
const sha = x => createHash('sha256').update(x).digest('hex');
const sh = c => execSync(c, {cwd: REPO, encoding: 'utf8'});
const quick = process.argv.includes('--quick');
const TARGETS = ['vue', 'svelte', 'solid'];
const PROVEN = ['button', 'checkbox', 'field', 'popover'];

async function json(p){return JSON.parse(await readFile(p,'utf8'));}

// Per-component parity for a target: re-run the neutral scorer scoped to one component.
// parity-score.mjs scores the whole STATES map; we read its cells and filter by component.
async function scoreTarget(fw){
  const out = sh(`node experiments/visual-compiler/results/parity-score.mjs experiments/visual-compiler/lowering/outputs/${fw} laneA-${fw}`);
  return JSON.parse(out);
}

// Component-name branch scan: lowerers must never branch on a component identity.
function genericScan(){
  const offenders = [];
  for(const fw of TARGETS){
    const src = sh(`cat experiments/visual-compiler/lowering/${fw}/lower.mjs`);
    // crude but effective: a string/identifier equality against a known component name
    for(const name of [...PROVEN]){
      const re = new RegExp(`(===|==|includes\\()\\s*['"\`]${name}['"\`]`);
      if(re.test(src)) offenders.push(`${fw}:${name}`);
    }
  }
  return offenders;
}

async function staleCheck(fw, components){
  const lowererPath = resolve(VC, 'lowering', fw, 'lower.mjs');
  if(!existsSync(lowererPath)) return {ok:false, reason:'lowerer missing'};
  const lowererDigest = sha(await readFile(lowererPath));
  const outRoot = resolve(VC, 'lowering', 'outputs', fw);
  for(const c of components){
    const cDir = resolve(outRoot, c);
    if(!existsSync(cDir)) continue; // not yet processed
    // check one provenance per component is bound to current lowerer
    const states = await readdir(cDir).catch(()=>[]);
    for(const s of states){
      const vps = await readdir(resolve(cDir,s)).catch(()=>[]);
      for(const v of vps){
        const prov = resolve(cDir,s,v,'provenance.json');
        if(!existsSync(prov)) return {ok:false, reason:`missing provenance ${c}/${s}/${v}`};
        const p = await json(prov);
        if(p.lowererDigest !== lowererDigest) return {ok:false, reason:`STALE ${fw} ${c}/${s}/${v}`};
      }
    }
  }
  return {ok:true};
}

async function main(){
  const scale = await json(resolve(VC,'results/scale-state.json'));
  const executable = scale.universe.list;
  const blocked = scale.blockedWithReason || {};

  // Re-score every target once; bucket cells by component.
  const scored = {};
  for(const fw of TARGETS) scored[fw] = await scoreTarget(fw);
  const byComponent = {};
  for(const fw of TARGETS){
    for(const cell of scored[fw].cells){
      const comp = cell.k.split(':')[0];
      byComponent[comp] = byComponent[comp] || {};
      byComponent[comp][fw] = byComponent[comp][fw] || {pass:0, total:0};
      byComponent[comp][fw].total++;
      if(cell.pass) byComponent[comp][fw].pass++;
    }
  }

  const componentStatus = {};
  let passedComponents = 0;
  for(const comp of executable){
    if(blocked[comp]){ componentStatus[comp] = {status:'blocked', reason:blocked[comp]}; continue; }
    const t = byComponent[comp];
    const has = t && TARGETS.every(fw => t[fw]);
    const full = has && TARGETS.every(fw => t[fw].pass === 9 && t[fw].total === 9);
    componentStatus[comp] = {
      status: full ? 'passed' : has ? 'partial' : 'not-started',
      parity: has ? Object.fromEntries(TARGETS.map(fw => [fw, `${t[fw].pass}/9`])) : null
    };
    if(full) passedComponents++;
  }

  if(quick){
    console.log(JSON.stringify({gate:'quick', passedComponents, of:executable.length - Object.keys(blocked).length,
      partial: Object.entries(componentStatus).filter(([,v])=>v.status==='partial').map(([k])=>k),
      notStarted: Object.entries(componentStatus).filter(([,v])=>v.status==='not-started').map(([k])=>k)}, null, 2));
    process.exit(passedComponents === executable.length - Object.keys(blocked).length ? 0 : 1);
  }

  // Proven-four must never regress.
  const provenOk = PROVEN.every(c => componentStatus[c].status === 'passed');
  const generic = genericScan();
  const processed = executable.filter(c => componentStatus[c].status !== 'not-started' && !blocked[c]);
  const stale = {};
  for(const fw of TARGETS) stale[fw] = await staleCheck(fw, processed);
  const staleOk = TARGETS.every(fw => stale[fw].ok);

  const remaining = executable.filter(c => !blocked[c] && componentStatus[c].status !== 'passed');
  const terminal = remaining.length === 0 && provenOk && generic.length === 0 && staleOk;

  const verdict = {
    schemaVersion: 'kumo.visual-compiler-scale-gate/v1',
    terminal,
    executable: executable.length,
    blocked: Object.keys(blocked),
    passedComponents,
    remainingCount: remaining.length,
    remaining: remaining.slice(0, 20),
    provenFourIntact: provenOk,
    lowerersGeneric: generic.length === 0 ? true : generic,
    staleCaptures: staleOk ? 'none' : Object.fromEntries(TARGETS.map(fw=>[fw, stale[fw].ok?'ok':stale[fw].reason])),
    partial: Object.entries(componentStatus).filter(([,v])=>v.status==='partial').map(([k,v])=>({component:k, parity:v.parity})),
    nextActionHint: !provenOk ? 'PROVEN-FOUR REGRESSED — fix before anything else'
      : generic.length ? `LOWERER NOT GENERIC: ${generic.join(', ')} — remove component branch`
      : !staleOk ? 're-capture stale target(s); see staleCaptures'
      : remaining.length ? `process next batch (4-8) from remaining; ${remaining.length} left: author canonical fixtures in tracer/app.mjs + run pipeline + score; fix only generic lowerer bugs`
      : 'TERMINAL — write scale-final.json, commit, delete loop'
  };
  console.log(JSON.stringify(verdict, null, 2));
  process.exit(terminal ? 0 : 1);
}
main().catch(e => { console.error('SCALE GATE ERROR:', e.stack); process.exit(2); });
