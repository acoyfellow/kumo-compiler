import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { validateDeployManifest } from './validate-deploy-manifest.mjs';
import { deployPayloadDigest } from './deploy-source.mjs';
import manifest from '../deploy-manifest.json' with { type: 'json' };

const root = resolve(import.meta.dirname, '..');
const run = (command, args) => {
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed (${result.status})`);
};
for (const required of [
  resolve(root, 'library-artifacts/manifest.json'),
  resolve(root, 'library-gallery/manifest.json'),
  resolve(root, 'example-artifacts/manifest.json')
]) {
  try { await readFile(required); }
  catch { throw new Error(`missing ${required.slice(root.length + 1)}; run npm run libraries:build && npm run libraries:gallery first`); }
}
run('npm', ['--prefix', 'astro', 'run', 'build']);
await validateDeployManifest(manifest);

const destination = resolve(root, 'deploy');
await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
await cp(resolve(root, 'astro/dist'), destination, { recursive: true });
// Library artifacts are source-staged and copied only after the Astro rebuild.
await cp(resolve(root, 'library-artifacts'), resolve(destination, 'packages'), { recursive: true });
await cp(resolve(root, 'library-gallery'), resolve(destination, 'library-gallery'), { recursive: true });
await cp(resolve(root, 'example-artifacts'), resolve(destination, 'examples/downloads'), { recursive: true });

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
const payload = await deployPayloadDigest(destination);
if (payload.algorithm !== manifest.source?.algorithm || payload.sha256 !== manifest.source?.deployPayloadSha256) {
  throw new Error(`prepared deploy payload is stale (expected ${manifest.source?.deployPayloadSha256 || 'no digest'}, got ${payload.sha256}); update deploy-manifest.json only after reviewing the generated payload`);
}
console.log(`Prepared deploy/ with ${runtimeRoute.components.length * runtimeRoute.frameworks.length} runtimes, Astro catalog, receipts, comparisons, and benchmarks (${payload.algorithm} ${payload.sha256}, ${payload.files} files)`);
