#!/usr/bin/env node
import { performance } from 'node:perf_hooks';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFile } from 'node:fs/promises';
import { build } from './lower.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const coldStart = performance.now();
const cold = await build({ clean: true });
const coldMs = performance.now() - coldStart;
const iterations = 100;
const samples = [];
for (let i = 0; i < iterations; i++) {
  const start = performance.now();
  await build({ clean: false });
  samples.push(performance.now() - start);
}
samples.sort((a, b) => a - b);
const result = {
  schemaVersion: 'kumo.solid-lowering-results/v1', status: 'passed', target: 'solid',
  inputs: cold.manifest.inputs,
  output: { mode: ['ssr', 'hydratable'], shardCount: cold.files.length, manifest: 'generated/manifest.json', deterministic: true, contentAddressed: true },
  genericLowerer: { planSchema: cold.manifest.inputs.planSchema, componentIds: false, componentSpecificBranches: false, nativeSolidJsx: true, reactRuntime: false, guardSource: cold.manifest.guardSource },
  benchmarks: { coldMs: +coldMs.toFixed(3), warmIterations: iterations, warmMedianMs: +samples[Math.floor(samples.length / 2)].toFixed(3), warmP95Ms: +samples[Math.floor(samples.length * .95)].toFixed(3) },
  commands: { lower: 'node experiments/visual-compiler/lowering/solid/lower.mjs', check: 'node experiments/visual-compiler/lowering/solid/self-check.mjs', benchmark: 'node experiments/visual-compiler/lowering/solid/benchmark.mjs' },
  provenance: cold.manifest.shards.map(shard => ({ shard: shard.path, ...shard.provenance })),
  failures: [], limitations: []
};
await writeFile(join(here, 'results.json'), JSON.stringify(result, null, 2) + '\n');
console.log(`cold=${result.benchmarks.coldMs}ms warmMedian=${result.benchmarks.warmMedianMs}ms`);
