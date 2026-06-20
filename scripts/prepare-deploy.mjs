import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { validateDeployManifest } from './validate-deploy-manifest.mjs';
import manifest from '../deploy-manifest.json' with { type: 'json' };

const root = resolve(import.meta.dirname, '..');
const run = (command, args) => {
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed (${result.status})`);
};
run('npm', ['--prefix', 'astro', 'run', 'build']);
await validateDeployManifest(manifest);

const destination = resolve(root, 'deploy');
await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
await cp(resolve(root, 'astro/dist'), destination, { recursive: true });

const runtimeRoute = manifest.routes.find((route) => route.id === 'component-runtime');
for (const component of runtimeRoute.components) {
  const componentPage = resolve(root, 'astro/dist/components', component, 'index.html');
  const compare = resolve(destination, component, 'compare');
  await mkdir(compare, { recursive: true });
  await cp(componentPage, resolve(compare, 'index.html'));
  for (const framework of runtimeRoute.frameworks) {
    const source = framework === 'react'
      ? resolve(root, 'runtime-canonical', component, 'public-runtime')
      : resolve(root, 'runtime', component, framework, 'public-runtime');
    await cp(source, resolve(destination, component, framework), { recursive: true });
  }
}

await cp(resolve(root, 'benchmarks/site'), resolve(destination, 'benchmarks'), { recursive: true });
await mkdir(resolve(destination, 'benchmarks/data'), { recursive: true });
await writeFile(resolve(destination, 'benchmarks/data/catalog.json'), await readFile(resolve(root, 'benchmarks/catalog.json')));
console.log(`Prepared deploy/ with ${runtimeRoute.components.length * runtimeRoute.frameworks.length} runtimes, Astro catalog, receipts, comparisons, and benchmarks`);
