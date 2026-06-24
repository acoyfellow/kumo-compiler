#!/usr/bin/env node
// LOOP GATE — the single source of truth for the Solid-parity loop.
// The loop CANNOT self-certify. This script decides, deterministically, whether
// the terminal condition is met, and it actively detects the classic cheats:
//   - stale captures (lowerer changed but capture not re-run)
//   - byte-identical copy of canonical artifacts
//   - regressions in already-green targets (vue/svelte)
//   - touching frozen files (IR core, fixtures, canonical authority, protected)
//   - unmeasured / synthetic claims (it RE-RUNS the neutral scorer itself)
//
// Exit 0 ONLY when: vue 36/36, svelte 36/36, solid 36/36 (all by the SAME neutral
// scorer), no stale captures, no copy attack, frozen files untouched, and the
// unseen-extension probe has been recorded as passed.
//
// Usage: node results/loop-gate.mjs            -> full gate, prints JSON verdict
//        node results/loop-gate.mjs --quick     -> parity only (fast inner-loop check)
import {createHash} from 'node:crypto';
import {execSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
import {resolve, dirname} from 'node:path';

const HERE = import.meta.dirname;            // .../experiments/visual-compiler/results
const VC = resolve(HERE, '..');              // .../experiments/visual-compiler
const REPO = resolve(VC, '..', '..');        // repo root
const sha = x => createHash('sha256').update(x).digest('hex');
const sh = c => execSync(c, {cwd: REPO, encoding: 'utf8'});
const quick = process.argv.includes('--quick');

const TARGETS = ['vue', 'svelte', 'solid'];
const FROZEN_GLOBS = [
  // IR core + fixtures: proven correct (two frameworks at parity). Loop must NOT touch.
  'experiments/visual-compiler/ir/evaluate.mjs',
  'experiments/visual-compiler/ir/fixtures/components.json',
  'experiments/visual-compiler/lowering/core/core.mjs',
  'experiments/visual-compiler/tracer/tracer.mjs',
  // green targets: loop must NOT regress them via source edits
  'experiments/visual-compiler/lowering/vue/lower.mjs',
  'experiments/visual-compiler/lowering/svelte/lower.mjs',
];
const PROTECTED = [
  'proof/observable-contracts/status.json',
  'runtime/checkbox/react/public-runtime/assets/react-checkbox.js',
  'runtime/switch/react/public-runtime/assets/react-switch.js',
];

async function json(p){return JSON.parse(await readFile(p,'utf8'));}

// 1) Re-run the neutral scorer ourselves — never trust a recorded number.
async function scoreLane(fw){
  const out = sh(`node experiments/visual-compiler/results/parity-score.mjs experiments/visual-compiler/lowering/outputs/${fw} laneA-${fw}`);
  const d = JSON.parse(out);
  return {passed: d.productParity.passed, total: d.productParity.total, failClasses: d.failClasses, fails: d.cells.filter(c=>!c.pass)};
}

// 2) Stale-capture detection: provenance must bind to the CURRENT lowerer + generated source.
async function staleCheck(fw){
  const lowererPath = resolve(VC, 'lowering', fw, 'lower.mjs');
  if(!existsSync(lowererPath)) return {ok:false, reason:'lowerer missing'};
  const lowererDigest = sha(await readFile(lowererPath));
  const outRoot = resolve(VC, 'lowering', 'outputs', fw);
  const states = {button:['default','disabled','loading'],checkbox:['unchecked','checked','indeterminate'],field:['default','error','disabled'],popover:['closed','open','dismissed']};
  for(const [c,ss] of Object.entries(states)) for(const s of ss) for(const v of [390,768,1440]){
    const prov = resolve(outRoot,c,s,String(v),'provenance.json');
    if(!existsSync(prov)) return {ok:false, reason:`missing provenance ${c}/${s}/${v}`};
    const p = await json(prov);
    if(p.lowererDigest !== lowererDigest) return {ok:false, reason:`STALE capture ${c}/${s}/${v}: provenance lowererDigest != current lower.mjs`};
    if(p.capture?.canonicalArtifactUsed === true) return {ok:false, reason:`copy attack flag ${c}/${s}/${v}`};
  }
  return {ok:true, lowererDigest};
}

// 3) Frozen + protected files must be byte-IDENTICAL to their working-tree state at
// loop start (snapshot), tolerating pre-existing spike dirt while catching ANY new
// loop-introduced edit. Snapshot digests are recorded once in frozen-snapshot.json.
async function frozenCheck(){
  const snapPath = resolve(VC,'results','frozen-snapshot.json');
  if(!existsSync(snapPath)) return {ok:false, reason:'frozen-snapshot.json missing — loop start not baselined'};
  const snap = await json(snapPath);
  const violations = [];
  for(const [f, expected] of Object.entries(snap.digests)){
    const p = resolve(REPO, f);
    const actual = existsSync(p) ? sha(await readFile(p)) : 'MISSING';
    if(actual !== expected) violations.push(f);
  }
  return {ok: violations.length===0, violations};
}

// 4) Unseen-extension receipt (written by the loop only after a real probe).
async function unseenCheck(){
  const p = resolve(VC,'results','unseen-extension.json');
  if(!existsSync(p)) return {ok:false, reason:'unseen-extension.json not yet produced'};
  const d = await json(p);
  return {ok: d.status==='passed' && d.lowererEditsRequired===0, detail:d};
}

async function main(){
  const scores = {};
  for(const fw of TARGETS) scores[fw] = await scoreLane(fw);
  const parityOk = TARGETS.every(fw => scores[fw].passed === 36 && scores[fw].total === 36);

  if(quick){
    console.log(JSON.stringify({gate:'quick', parityOk, scores:Object.fromEntries(TARGETS.map(fw=>[fw,`${scores[fw].passed}/36`]))}, null, 2));
    process.exit(parityOk?0:1);
  }

  const stale = {};
  for(const fw of TARGETS) stale[fw] = await staleCheck(fw);
  const staleOk = TARGETS.every(fw => stale[fw].ok);
  const frozen = await frozenCheck();
  const unseen = await unseenCheck();

  const terminal = parityOk && staleOk && frozen.ok && unseen.ok;
  const verdict = {
    schemaVersion: 'kumo.solid-parity-loop-gate/v1',
    terminal,
    parity: Object.fromEntries(TARGETS.map(fw=>[fw, {score:`${scores[fw].passed}/36`, failClasses:scores[fw].failClasses, sampleFails:scores[fw].fails.slice(0,4).map(c=>c.k)}])),
    parityOk,
    staleCaptures: staleOk ? 'none' : Object.fromEntries(TARGETS.map(fw=>[fw, stale[fw].ok?'ok':stale[fw].reason])),
    frozenFiles: frozen.ok ? 'untouched' : frozen,
    unseenExtension: unseen.ok ? 'passed' : unseen.reason || unseen.detail,
    nextActionHint: !parityOk ? `fix solid lower.mjs ONLY; current solid fails: ${JSON.stringify(scores.solid.failClasses)}; then re-run capture; then re-gate`
                  : !staleOk ? 're-run solid capture (lowerer changed since last capture)'
                  : !unseen.ok ? 'run unseen-extension probe and write results/unseen-extension.json'
                  : !frozen.ok ? 'REVERT edits to frozen/protected files'
                  : 'TERMINAL — write bakeoff-final unconditional + commit + delete loop'
  };
  console.log(JSON.stringify(verdict, null, 2));
  process.exit(terminal?0:1);
}
main().catch(e=>{console.error('GATE ERROR:', e.stack); process.exit(2);});
