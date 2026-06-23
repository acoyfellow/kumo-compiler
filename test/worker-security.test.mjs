import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../worker.mjs';
import manifest from '../deploy-manifest.json' with { type: 'json' };

const env = { WORKER_VERSION: 'test-version', GIT_COMMIT: 'a'.repeat(40), ASSETS: { fetch: async () => new Response('asset') } };

test('health and version expose deployment identity with security headers', async () => {
  for (const endpoint of ['/_health', '/_version', '/health', '/version']) {
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

test('package routes override static asset types without changing bytes or status', async () => {
  const bytes = new Uint8Array([0x1f, 0x8b, 0x08, 0x00, 0xff]);
  const requested = [];
  const packageEnv = {
    ...env,
    ASSETS: { fetch: async (request) => {
      requested.push(new URL(request.url).pathname);
      return new Response(bytes, { status: 206, headers: { 'content-type': 'text/plain', 'x-asset': 'preserved' } });
    } },
  };

  const friendly = await app.request('https://example.test/packages/kumo-vue-0.0.1.tgz', {}, packageEnv);
  assert.equal(friendly.status, 206);
  assert.deepEqual(new Uint8Array(await friendly.arrayBuffer()), bytes);
  assert.equal(friendly.headers.get('content-type'), 'application/gzip');
  assert.equal(friendly.headers.get('content-disposition'), 'attachment; filename="kumo-vue-0.0.1.tgz"');
  assert.equal(friendly.headers.get('cache-control'), 'public, max-age=300');
  assert.equal(friendly.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(friendly.headers.get('x-asset'), 'preserved');

  const hash = manifest.routes.find(route => route.id === 'library-packages').artifacts.find(name => /^[a-f0-9]{64}\.tgz$/.test(name));
  assert.ok(hash);
  const addressed = await app.request(`https://example.test/packages/${hash}`, {}, packageEnv);
  assert.equal(addressed.status, 206);
  assert.equal(addressed.headers.get('cache-control'), 'public, max-age=31536000, immutable');
  assert.equal(addressed.headers.get('content-disposition'), `attachment; filename="${hash}"`);
  assert.deepEqual(requested, ['/packages/kumo-vue-0.0.1.tgz', `/packages/${hash}`]);
});

test('package manifest is JSON and unlisted or nested package paths never reach assets', async () => {
  let fetches = 0;
  const packageEnv = {
    ...env,
    ASSETS: { fetch: async () => {
      fetches += 1;
      return new Response('{}', { headers: { 'content-type': 'text/plain' } });
    } },
  };
  const manifest = await app.request('https://example.test/packages/manifest.json', {}, packageEnv);
  assert.equal(manifest.status, 200);
  assert.equal(manifest.headers.get('content-type'), 'application/json');
  assert.equal(manifest.headers.get('content-disposition'), null);
  assert.equal(manifest.headers.get('x-content-type-options'), 'nosniff');

  for (const path of ['/packages/not-declared.tgz', '/packages/%2fworker.mjs', '/packages/nested/file.tgz']) {
    assert.equal((await app.request(`https://example.test${path}`, {}, packageEnv)).status, 404);
  }
  assert.equal(fetches, 1);
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
