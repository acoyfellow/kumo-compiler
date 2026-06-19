import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const catalogPath = path.join(root, 'benchmarks/catalog.json');
const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));
const fail = message => { throw new Error(`benchmark catalog: ${message}`); };

if (catalog.schemaVersion !== 1) fail('schemaVersion must be 1');
if (!Array.isArray(catalog.components) || !catalog.components.length) fail('components must be non-empty');
if (!catalog.source?.commit?.match(/^[a-f0-9]{7,64}$/)) fail('source.commit is invalid');
const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
try {
  execFileSync('git', ['merge-base', '--is-ancestor', catalog.source.commit, head], { cwd: root, stdio: 'ignore' });
} catch { fail(`source commit ${catalog.source.commit} is not an ancestor of HEAD ${head}`); }

for (const component of catalog.components) {
  if (!component.id?.match(/^[a-z0-9-]+$/)) fail('invalid component id');
  for (const [name, route] of Object.entries(component.routes ?? {})) {
    if (!route.startsWith('/')) fail(`${component.id}/${name}: route must be root-relative`);
    const relative = route.replace(/^\//, '').replace(/\/$/, '');
    const candidates = [path.join(root, 'deploy', relative, 'index.html')];
    // Canonical embeds are worker aliases for the corresponding runtime artifact.
    if (route.startsWith(`/benchmarks/embed/${component.id}/`)) {
      const framework = route.split('/')[4];
      candidates.push(path.join(root, 'deploy', component.id, framework, 'index.html'));
    }
    let found = false;
    for (const candidate of candidates) { try { await access(candidate); found = true; break; } catch {} }
    if (!found) fail(`${component.id}/${name}: no deployed artifact for ${route}`);
  }
}

if (process.argv.includes('--build')) {
  const dataDir = path.join(root, 'deploy/benchmarks/data');
  await mkdir(dataDir, { recursive: true });
  await writeFile(path.join(dataDir, 'catalog.json'), JSON.stringify(catalog, null, 2) + '\n');
}
console.log(`Validated ${catalog.components.length} benchmark component(s) at ${head.slice(0, 12)}`);
