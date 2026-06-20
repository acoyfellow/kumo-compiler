import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../worker.mjs';

const env = { WORKER_VERSION: 'test-version', GIT_COMMIT: 'a'.repeat(40), ASSETS: { fetch: async () => new Response('asset') } };

test('health and version expose deployment identity with security headers', async () => {
  for (const endpoint of ['/_health', '/_version']) {
    const response = await app.request(`https://example.test${endpoint}`, {}, env);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(response.headers.get('x-frame-options'), 'SAMEORIGIN');
    assert.equal(response.headers.get('cache-control'), 'no-store');
    const body = await response.json();
    assert.equal(body.version, 'test-version');
    assert.equal(body.gitCommit, 'a'.repeat(40));
    assert.match(body.manifestHash, /^[0-9a-f]{64}$/);
  }
});

test('manifest and Astro routes forward mapped assets', async () => {
  const paths = [];
  const routeEnv = { ...env, ASSETS: { fetch: async (request) => { paths.push(new URL(request.url).pathname); return new Response('asset'); } } };
  assert.equal((await app.request('https://example.test/select/react', {}, routeEnv)).status, 308);
  const response = await app.request('https://example.test/select/react/', {}, routeEnv);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-security-policy')?.includes("default-src 'self'"), true);
  await app.request('https://example.test/', {}, routeEnv);
  await app.request('https://example.test/components/select/', {}, routeEnv);
  assert.deepEqual(paths, ['/select/react/index.html', '/index.html', '/components/select/index.html']);
});

test('catalog pages can frame same-origin runtimes but CSP rejects foreign ancestors', async () => {
  const catalogEnv = {
    ...env,
    ASSETS: { fetch: async (request) => new Response(new URL(request.url).pathname === '/benchmarks/index.html'
      ? '<iframe src="/select/react/"></iframe>'
      : '<main>runtime</main>', { headers: { 'content-type': 'text/html' } }) },
  };
  const catalog = await app.request('https://example.test/benchmarks/', {}, catalogEnv);
  assert.match(await catalog.text(), /<iframe src="\/select\/react\/">/);
  const runtime = await app.request('https://example.test/select/react/', {}, catalogEnv);
  assert.equal(runtime.status, 200);
  const csp = runtime.headers.get('content-security-policy');
  assert.match(csp, /(?:^|;)\s*frame-ancestors 'self'(?:;|$)/);
  assert.match(csp, /(?:^|;)\s*style-src 'self' 'unsafe-inline'(?:;|$)/);
  assert.match(csp, /(?:^|;)\s*script-src 'self' 'unsafe-inline' https:\/\/static\.cloudflareinsights\.com https:\/\/static-staging\.cloudflareinsights\.com(?:;|$)/);
  assert.doesNotMatch(csp, /frame-ancestors https?:\/\//);
  assert.equal(runtime.headers.get('x-frame-options'), 'SAMEORIGIN');
});
