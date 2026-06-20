import test from 'node:test';
import assert from 'node:assert/strict';
import { deployManifest, runtimeRoute } from '../runtime-routes.mjs';
import { validateDeployManifest } from '../scripts/validate-deploy-manifest.mjs';

test('every manifest route resolves and maps to an html asset', () => {
  for (const route of deployManifest.routes) {
    const path = route.pattern.replace(':component', route.components?.[0] || '').replace(':framework', route.frameworks?.[0] || '');
    const result = runtimeRoute(path);
    assert.equal(result?.id, route.id);
    assert.match(result.asset, /\/index\.html$/);
  }
});

test('deploy manifest inventory exactly matches catalog IR and supported frameworks', async () => {
  const inventory = await validateDeployManifest(deployManifest);
  assert.equal(inventory.components.length, 41);
  assert.deepEqual(inventory.frameworks, ['react', 'solid', 'svelte', 'vue']);

  await assert.rejects(validateDeployManifest({ ...deployManifest, routes: deployManifest.routes.map((route) => route.id === 'component-runtime' ? { ...route, components: route.components.slice(1) } : route) }), /inventory drift/);
  await assert.rejects(validateDeployManifest({ ...deployManifest, routes: deployManifest.routes.map((route) => route.id === 'component-runtime' ? { ...route, frameworks: [...route.frameworks, 'angular'] } : route) }), /framework inventory drift/);
});

test('route constraints and canonical slash are enforced', () => {
  assert.equal(runtimeRoute('/not-a-component/react/'), null);
  assert.equal(runtimeRoute('/select/angular/'), null);
  assert.equal(runtimeRoute('/select/react').needsSlash, true);
  assert.equal(runtimeRoute('/select/react/').needsSlash, false);
});
