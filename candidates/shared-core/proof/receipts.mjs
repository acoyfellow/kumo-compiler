import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { components, frameworks } from './fixtures.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const receiptDir = path.join(root, 'proof/bakeoff/shared-core/receipts');
const revision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
const run = `proof-${new Date().toISOString()}`;
const browserGates = ['domAria', 'behavior', 'ssr', 'hydrationWarnings', 'nodePreservation'];
const files = fs.readdirSync(receiptDir).filter(x => x.endsWith('.json'));

// Every receipt emitted by this run gets traceable revision/run identity.
for (const file of files) {
  const existing = JSON.parse(fs.readFileSync(path.join(receiptDir, file)));
  fs.writeFileSync(path.join(receiptDir, file), JSON.stringify({ ...existing, revision, run }, null, 2) + '\n');
}

for (const component of components) for (const framework of frameworks) {
  const file = `${component}.${framework}.json`;
  const existing = JSON.parse(fs.readFileSync(path.join(receiptDir, file)));
  const gates = { ...existing.gates };
  for (const gate of browserGates) gates[gate] = 'not-run';
  // These also lack an independently executed target build/package proof.
  for (const gate of ['publicApi', 'nativeErgonomics', 'packageTreeShaking', 'upstreamCostProxy']) gates[gate] = 'not-run';
  const marker = `proof/bakeoff/shared-core/evidence/${framework}/${component}/not-run.json`;
  fs.writeFileSync(path.join(receiptDir, file), JSON.stringify({
    ...existing, revision, run, status: 'partial', gates,
    evidence: [marker, existing.nativeCode.path, 'candidates/shared-core/proof/fixtures.mjs'],
    limitations: ['No browser execution', 'No target framework SSR/client build', 'Browser, SSR, hydration, node, network, and console gates are not run']
  }, null, 2) + '\n');
}

const receipts = files.map(file => JSON.parse(fs.readFileSync(path.join(receiptDir, file))));
const gateCounts = {};
for (const receipt of receipts) for (const value of Object.values(receipt.gates)) gateCounts[value] = (gateCounts[value] ?? 0) + 1;
const matrix = receipts.map(({ component, framework, status, gates }) => ({ component, framework, status, gates }));
fs.writeFileSync(path.join(root, 'proof/bakeoff/shared-core/summary.json'), JSON.stringify({
  candidate: 'shared-core', revision, run, receipts: receipts.length, gateCounts,
  verdict: 'partial-no-target-browser-or-ssr-execution',
  pilot: { targets: 12, passed: 0, partial: 12, failed: 0, blocked: 0 }, matrix
}, null, 2) + '\n');
console.log(gateCounts);
