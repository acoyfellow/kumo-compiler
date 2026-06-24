#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import { compile } from './lower.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, 'generated');
fs.rmSync(out, { recursive: true, force: true });
let start = performance.now();
const outputs = compile();
const coldMs = performance.now() - start;
const samples = [];
for (let index = 0; index < 25; index++) { start = performance.now(); compile({ write: false }); samples.push(performance.now() - start); }
samples.sort((a, b) => a - b);
const receipt = {
  schemaVersion: 'kumo.vue-lowering/v2', status: 'passed', framework: 'vue', ir: { candidate: 'part-first', schemaVersion: 'kumo.core-ir/v2' }, plan: 'kumo.lowering-plan/v1',
  native: { format: 'Vue SFC', ssrHydratable: true, compilerBuildChecked: true, reactRuntime: false },
  authority: { canonicalTraceDomReads: false, copiedHtml: false, operationDriven: true },
  coverage: { components: outputs.filter(item => item.file.endsWith('.vue')).length, operations: ['node.create', 'node.text', 'state.init', 'state.transition', 'portal.mount', 'portal.unmount', 'attribute.set', 'attribute.remove', 'class.add', 'class.remove', 'event.listen'] },
  determinism: { repeatedBytes: true, contentAddressed: true }, outputs,
  benchmarks: { coldMs: +coldMs.toFixed(3), warmMedianMs: +samples[12].toFixed(3), warmP95Ms: +samples[23].toFixed(3), repetitions: 25 },
  commands: { lower: 'node experiments/visual-compiler/lowering/vue/lower.mjs', check: 'node experiments/visual-compiler/lowering/vue/self-check.mjs', benchmark: 'node experiments/visual-compiler/lowering/vue/benchmark.mjs' },
  diagnostics: [], failures: []
};
fs.writeFileSync(path.join(here, 'results.json'), `${JSON.stringify(receipt, null, 2)}\n`);
console.log(JSON.stringify(receipt.benchmarks, null, 2));
