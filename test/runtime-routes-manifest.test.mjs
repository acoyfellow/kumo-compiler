import test from 'node:test';
import assert from 'node:assert/strict';
import { deployManifest, runtimeRoute } from '../runtime-routes.mjs';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { validateDeployManifest } from '../scripts/validate-deploy-manifest.mjs';

const root = resolve(import.meta.dirname, '..');

test('every manifest route resolves to its declared asset kind', () => {
  for (const route of deployManifest.routes) {
    const path = route.pattern.replace(':component', route.components?.[0] || '').replace(':framework', route.frameworks?.[0] || '').replace(':artifact', route.artifacts?.[0] || '');
    const result = runtimeRoute(path);
    assert.equal(result?.id, route.id);
    route.id === 'library-packages' ? assert.equal(result.asset, `/packages/${route.artifacts[0]}`) : assert.match(result.asset, /\/index\.html$/);
  }
  assert.equal(runtimeRoute('/packages/not-declared.tgz'), null);
});

test('deploy manifest inventory exactly matches catalog IR and supported frameworks', async () => {
  const inventory = await validateDeployManifest(deployManifest);
  assert.equal(inventory.components.length, 41);
  assert.deepEqual(inventory.frameworks, ['react', 'solid', 'svelte', 'vue']);
  assert.equal(inventory.artifacts.length, 7);

  await assert.rejects(validateDeployManifest({ ...deployManifest, routes: deployManifest.routes.map((route) => route.id === 'component-runtime' ? { ...route, components: route.components.slice(1) } : route) }), /inventory drift/);
  await assert.rejects(validateDeployManifest({ ...deployManifest, routes: deployManifest.routes.map((route) => route.id === 'component-runtime' ? { ...route, frameworks: [...route.frameworks, 'angular'] } : route) }), /framework inventory drift/);
});

test('reviewed deploy snapshot contains every declared package with manifest SHA bytes', async () => {
  const manifest = JSON.parse(await readFile(resolve(root, 'library-artifacts/manifest.json'), 'utf8'));
  const route = deployManifest.routes.find(({ id }) => id === 'library-packages');
  assert.deepEqual(new Set(route.artifacts), new Set(['manifest.json', ...manifest.packages.flatMap(({ friendlyName, artifact }) => [friendlyName, artifact])]));
  for (const entry of manifest.packages) {
    const friendly = await readFile(resolve(root, 'library-artifacts', entry.friendlyName));
    const addressed = await readFile(resolve(root, 'library-artifacts', entry.artifact));
    assert.equal(createHash('sha256').update(friendly).digest('hex'), entry.sha256);
    assert.deepEqual(addressed, friendly);
  }
});

test('route constraints and canonical slash are enforced', () => {
  assert.equal(runtimeRoute('/not-a-component/react/'), null);
  assert.equal(runtimeRoute('/select/angular/'), null);
  assert.equal(runtimeRoute('/select/react').needsSlash, true);
  assert.equal(runtimeRoute('/select/react/').needsSlash, false);
});
