import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const dir = path.join(root, 'proof/bakeoff/shared-core/receipts');
const pilot = new Set(['button', 'field', 'tabs']);
const vocab = new Set(['passed', 'failed', 'blocked', 'not-run']);
const browserGates = ['domAria', 'behavior', 'ssr', 'hydrationWarnings', 'nodePreservation'];
const receipts = fs.readdirSync(dir).filter(x => x.endsWith('.json')).map(x => JSON.parse(fs.readFileSync(path.join(dir, x))));

test('receipt vocabulary and truthful partial pilot status', () => {
  for (const receipt of receipts) {
    for (const status of Object.values(receipt.gates)) assert.ok(vocab.has(status));
    if (pilot.has(receipt.component)) assert.equal(receipt.status, 'partial');
  }
});

test('pilot browser-related gates are not-run without real target execution', () => {
  for (const receipt of receipts.filter(x => pilot.has(x.component))) {
    const evidence = receipt.evidence.map(p => path.join(root, p)).filter(p => p.endsWith('.json')).map(p => JSON.parse(fs.readFileSync(p)));
    assert.ok(evidence.some(e => e.execution?.kind === 'not-run'));
    for (const gate of browserGates) assert.equal(receipt.gates[gate], 'not-run');
  }
});

test('synthetic or deterministic harness cannot support passed browser gates', () => {
  for (const receipt of receipts) for (const evidencePath of receipt.evidence.filter(p => p.endsWith('.json'))) {
    const evidence = JSON.parse(fs.readFileSync(path.join(root, evidencePath)));
    const kind = String(evidence.execution?.kind ?? '').toLowerCase();
    if (kind.includes('synthetic') || kind.includes('deterministic') || kind.includes('harness')) {
      for (const gate of browserGates) assert.notEqual(receipt.gates[gate], 'passed');
    }
  }
});

test('revision and run are generated identities', () => {
  for (const receipt of receipts) {
    assert.match(receipt.revision, /^[0-9a-f]{40}$/);
    assert.notEqual(receipt.revision, 'follow-up-working-tree');
    assert.match(receipt.run, /^proof-\d{4}-\d\d-\d\dT/);
  }
});
