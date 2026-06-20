import { pathToFileURL } from 'node:url';

export function accessConfig(env = process.env) {
  const hostname = env.PRODUCTION_HOSTNAME;
  const audience = env.CLOUDFLARE_ACCESS_AUD;
  if (!hostname || !audience) throw new Error('PRODUCTION_HOSTNAME and CLOUDFLARE_ACCESS_AUD are required; Access policy is external Cloudflare configuration');
  if (!/^[a-z0-9.-]+$/i.test(hostname) || !/^[a-f0-9]{32,64}$/i.test(audience)) throw new Error('invalid hostname or Access audience');
  return { hostname, audience, policySource: 'external-cloudflare-access' };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { console.log(JSON.stringify(accessConfig())); } catch (error) { console.error(error.message); process.exitCode = 2; }
}
