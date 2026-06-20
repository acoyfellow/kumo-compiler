import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { validateDeployManifest } from './validate-deploy-manifest.mjs';
import manifest from '../deploy-manifest.json' with { type: 'json' };

const root = resolve(import.meta.dirname, '..');
const build = spawnSync('npm', ['--prefix', 'astro', 'run', 'build'], { cwd: root, stdio: 'inherit' });
if (build.status !== 0) throw new Error(`Astro build failed (${build.status})`);
await validateDeployManifest(manifest);
const source = resolve(root, 'astro/dist');
const destination = resolve(root, 'deploy');
await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
await cp(source, destination, { recursive: true });
console.log('Prepared deploy/ from astro/dist and validated deploy-manifest.json routes');
