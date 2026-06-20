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
  c.header('Cache-Control', c.req.path.startsWith('/_') ? 'no-store' : 'public, max-age=300');
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
app.get('/favicon.ico', (c) => c.body(null, 204));
app.get('*', (c) => {
  const url = new URL(c.req.url);
  const route = runtimeRoute(url.pathname);
  if (route?.needsSlash) return c.redirect(`${url.pathname}/${url.search}`, 308);
  if (route) url.pathname = route.asset;
  else if (url.pathname === '/') url.pathname = '/index.html';
  else if (url.pathname.endsWith('/')) url.pathname += 'index.html';
  return c.env.ASSETS.fetch(new Request(url, c.req.raw));
});

export default app;
