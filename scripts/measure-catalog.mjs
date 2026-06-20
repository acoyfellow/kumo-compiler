import { spawnSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
const file = new URL('../benchmarks/catalog.json', import.meta.url);
const catalog = JSON.parse(readFileSync(file, 'utf8'));
const frameworks = ['react', 'vue', 'svelte', 'solid'];
const median = values => [...values].sort((a,b)=>a-b)[Math.floor(values.length/2)];
for (const component of catalog.components) {
  const buildMs = {};
  const bundleBytes = {};
  for (const framework of frameworks) {
    const root = component.id === 'select' ? `runtime/${framework}` : `runtime/${component.id}/${framework}`;
    if (!existsSync(root)) throw new Error(`${component.id}/${framework}: runtime missing`);
    const runs = [];
    for (let i = 0; i < 3; i++) {
      const start = performance.now();
      const result = spawnSync('npx', ['vite', 'build', root], { encoding: 'utf8' });
      if (result.status !== 0) throw new Error(`${component.id}/${framework}: build failed\n${result.stderr}`);
      runs.push(performance.now() - start);
    }
    buildMs[framework] = median(runs);
    const assetDir = `${root}/public-runtime/assets`;
    bundleBytes[framework] = readdirSync(assetDir)
      .filter(name => name.endsWith('.js'))
      .reduce((sum, name) => sum + statSync(`${assetDir}/${name}`).size, 0);
  }
  component.metrics ??= {};
  component.metrics.buildMs = buildMs;
  component.metrics.bundleBytes = bundleBytes;
  component.metrics.runtimeBuildMedianMs = median(Object.values(buildMs));
  component.metrics.measured = true;
}
writeFileSync(file, JSON.stringify(catalog, null, 2) + '\n');
console.log(`Measured ${catalog.components.length} components × ${frameworks.length} frameworks × 3 runs`);
