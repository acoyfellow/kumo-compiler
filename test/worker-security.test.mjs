import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../worker.mjs';

const env = { WORKER_VERSION: 'test-version', GIT_COMMIT: 'a'.repeat(40), ASSETS: { fetch: async () => new Response('asset') } };

test('health and version expose deployment identity with security headers', async () => {
  for (const endpoint of ['/_health', '/_version']) {
    const response = await app.request(`https://example.test${endpoint}`, {}, env);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(response.headers.get('x-frame-options'), 'DENY');
    assert.equal(response.headers.get('cache-control'), 'no-store');
    const body = await response.json();
    assert.equal(body.version, 'test-version');
    assert.equal(body.gitCommit, 'a'.repeat(40));
  }
});

test('manifest routes redirect canonically and forward mapped assets', async () => {
  assert.equal((await app.request('https://example.test/select/react', {}, env)).status, 308);
  const response = await app.request('https://example.test/select/react/', {}, env);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-security-policy')?.includes("default-src 'self'"), true);
});
