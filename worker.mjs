import { Hono } from 'hono';
import { deployManifest, runtimeRoute } from './runtime-routes.mjs';

const app = new Hono();
const securityHeaders = {
  // Kumo and Astro emit both <style> blocks and component-level style attributes.
  // Keep scripts same-origin except for the Cloudflare Web Analytics beacon;
  // inline scripts remain allowed until the catalog tab handlers are externalized.
  'Content-Security-Policy': "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com https://static-staging.cloudflareinsights.com; connect-src 'self' https://cloudflareinsights.com https://*.cloudflareinsights.com; img-src 'self' data:; font-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'self'",
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

app.use('*', async (c, next) => {
  await next();
  for (const [name, value] of Object.entries(securityHeaders)) c.header(name, value);
  if (!c.res.headers.has('Cache-Control')) {
    c.header('Cache-Control', (c.req.path.startsWith('/_') || c.req.path === '/health' || c.req.path === '/version') ? 'no-store' : 'public, max-age=300');
  }
});

async function manifestHash() {
  const bytes = new TextEncoder().encode(JSON.stringify(deployManifest));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function identity(c) {
  return {
    service: deployManifest.service,
    version: c.env.WORKER_VERSION || deployManifest.version,
    gitCommit: c.env.GIT_COMMIT || 'unknown',
    manifestSchemaVersion: deployManifest.schemaVersion,
    manifestHash: await manifestHash(),
  };
}
app.get('/_health', async (c) => c.json({ ok: true, ...await identity(c) }));
app.get('/_version', async (c) => c.json(await identity(c)));
app.get('/health', async (c) => c.json({ ok: true, ...await identity(c) }));
app.get('/version', async (c) => c.json(await identity(c)));
app.get('/favicon.ico', (c) => c.body(null, 204));
app.get('/packages/*', async (c) => {
  const route = runtimeRoute(c.req.path);
  if (route?.id !== 'library-packages') return c.notFound();

  const assetResponse = await c.env.ASSETS.fetch(new Request(new URL(route.asset, c.req.url), c.req.raw));
  const headers = new Headers(assetResponse.headers);
  const filename = route.params.artifact;
  if (filename === 'manifest.json') {
    headers.set('Content-Type', 'application/json');
  } else {
    headers.set('Content-Type', 'application/gzip');
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    headers.set('Cache-Control', /^[0-9a-f]{64}\.tgz$/.test(filename)
      ? 'public, max-age=31536000, immutable'
      : 'public, max-age=300');
  }
  return new Response(assetResponse.body, {
    status: assetResponse.status,
    statusText: assetResponse.statusText,
    headers,
  });
});
app.get('*', (c) => {
  const url = new URL(c.req.url);
  if (url.pathname === '/packages' || url.pathname.startsWith('/packages/')) return c.notFound();
  const route = runtimeRoute(url.pathname);
  if (route?.needsSlash) return c.redirect(`${url.pathname}/${url.search}`, 308);
  if (route) url.pathname = route.asset;
  else if (url.pathname === '/') url.pathname = '/index.html';
  else if (url.pathname.endsWith('/')) url.pathname += 'index.html';
  return c.env.ASSETS.fetch(new Request(url, c.req.raw));
});

export default app;
