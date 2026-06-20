import test from 'node:test';
import assert from 'node:assert/strict';
import { deployManifest, runtimeRoute } from '../runtime-routes.mjs';

test('every manifest route resolves and maps to an html asset', () => {
  for (const route of deployManifest.routes) {
    const path = route.pattern.replace(':component', route.components?.[0] || '').replace(':framework', route.frameworks?.[0] || '');
    const result = runtimeRoute(path);
    assert.equal(result?.id, route.id);
    assert.match(result.asset, /\/index\.html$/);
  }
});

test('route constraints and canonical slash are enforced', () => {
  assert.equal(runtimeRoute('/not-a-component/react/'), null);
  assert.equal(runtimeRoute('/select/angular/'), null);
  assert.equal(runtimeRoute('/select/react').needsSlash, true);
  assert.equal(runtimeRoute('/select/react/').needsSlash, false);
});
