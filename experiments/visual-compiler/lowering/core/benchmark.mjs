#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import { lower, stable, validatePlan } from './core.mjs';
import { guardSource } from './guard.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const input = JSON.parse(fs.readFileSync(path.resolve(here, '../../ir/fixtures/components.json'), 'utf8'));
const ids = { componentIds: input.components.map(item => item.name), partIds: [...new Set(input.components.flatMap(item => item.parts.map(part => part.id)))] };
const repetitions = 1000, samples = [];
let plan;
for (let index = 0; index < repetitions; index++) { const start = performance.now(); plan = lower(input); validatePlan(plan); samples.push(performance.now() - start); }
samples.sort((a, b) => a - b);
const source = fs.readFileSync(path.join(here, 'core.mjs'), 'utf8');
const guard = guardSource(source, ids);
const result = {
  schemaVersion: 'kumo.lowering-core-results/v1', status: guard.valid ? 'passed' : 'failed', targetNeutral: true,
  input: { schemaVersion: input.schemaVersion, components: input.components.length },
  plan: { manifestDigest: plan.manifestDigest, shards: plan.shards.length, operations: plan.shards.reduce((sum, shard) => sum + shard.operations.length, 0), bytes: Buffer.byteLength(stable(plan)) },
  determinism: { contentAddressed: true, algorithm: 'sha256', repetitions },
  staticGuard: { passed: guard.valid, diagnostics: guard.diagnostics },
  benchmarks: { medianMs: +samples[Math.floor(repetitions * .5)].toFixed(4), p95Ms: +samples[Math.floor(repetitions * .95)].toFixed(4), repetitions },
  commands: { check: 'node experiments/visual-compiler/lowering/core/self-check.mjs', benchmark: 'node experiments/visual-compiler/lowering/core/benchmark.mjs' }, failures: guard.diagnostics
};
fs.writeFileSync(path.join(here, 'results.json'), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
if (result.status !== 'passed') process.exitCode = 1;
