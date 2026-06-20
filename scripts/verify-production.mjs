import { pathToFileURL } from 'node:url';
import { accessConfig } from './verify-access.mjs';

export async function probeProduction(env = process.env, fetcher = fetch) {
  const { hostname } = accessConfig(env);
  const base = `https://${hostname}`;
  const denied = await fetcher(`${base}/_health`, { redirect: 'manual' });
  const deniedOk = denied.status === 302 || denied.status === 401 || denied.status === 403;
  const clientId = env.CF_ACCESS_CLIENT_ID;
  const clientSecret = env.CF_ACCESS_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error(`unauthenticated probe status=${denied.status}; CF_ACCESS_CLIENT_ID and CF_ACCESS_CLIENT_SECRET are required for authorized probe`);
  const headers = { 'CF-Access-Client-Id': clientId, 'CF-Access-Client-Secret': clientSecret };
  const allowed = await fetcher(`${base}/_health`, { headers, redirect: 'manual' });
  const body = await allowed.json().catch(() => null);
  if (!deniedOk || !allowed.ok || body?.ok !== true) throw new Error(`production probe failed: denied=${denied.status} allowed=${allowed.status}`);
  return { hostname, deniedStatus: denied.status, allowedStatus: allowed.status, health: body, rayIds: [denied.headers.get('cf-ray'), allowed.headers.get('cf-ray')].filter(Boolean) };
}
if (import.meta.url === pathToFileURL(process.argv[1]).href) probeProduction().then((result) => console.log(JSON.stringify(result, null, 2))).catch((error) => { console.error(error.message); process.exitCode = 1; });
