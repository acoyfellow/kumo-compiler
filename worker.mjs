import { Hono } from 'hono';
import { deployManifest, runtimeRoute } from './runtime-routes.mjs';

const app = new Hono();
const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

app.use('*', async (c, next) => {
  await next();
  for (const [name, value] of Object.entries(securityHeaders)) c.header(name, value);
  c.header('Cache-Control', c.req.path.startsWith('/_') ? 'no-store' : 'public, max-age=300');
});

function identity(c) {
  return {
    service: deployManifest.service,
    version: c.env.WORKER_VERSION || deployManifest.version,
    gitCommit: c.env.GIT_COMMIT || 'unknown',
    manifestSchemaVersion: deployManifest.schemaVersion,
  };
}
app.get('/_health', (c) => c.json({ ok: true, ...identity(c) }));
app.get('/_version', (c) => c.json(identity(c)));
app.get('*', (c) => {
  const url = new URL(c.req.url);
  const route = runtimeRoute(url.pathname);
  if (route?.needsSlash) return c.redirect(`${url.pathname}/${url.search}`, 308);
  if (route) url.pathname = route.asset;
  return c.env.ASSETS.fetch(new Request(url, c.req.raw));
});

export default app;
