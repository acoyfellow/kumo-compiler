import { writeFile } from 'node:fs/promises';
import { deployManifest } from '../runtime-routes.mjs';
import { deploymentIdentity } from '../scripts/deploy.mjs';
import { probeProduction } from '../verify-production.mjs';
import { verifyObservability } from '../verify-observability.mjs';

const probe = await probeProduction();
const identity = await deploymentIdentity();
const observation = verifyObservability(probe);
const headers = process.env.CF_ACCESS_CLIENT_ID ? { 'CF-Access-Client-Id': process.env.CF_ACCESS_CLIENT_ID, 'CF-Access-Client-Secret': process.env.CF_ACCESS_CLIENT_SECRET } : {};
const routes = [];
for (const route of deployManifest.routes) {
  const path = route.pattern.replace(':component', route.components?.[0] || '').replace(':framework', route.frameworks?.[0] || '');
  const response = await fetch(`https://${probe.hostname}${path}`, { headers });
  routes.push({ id: route.id, path, status: response.status, ok: response.ok });
}
if (routes.some((route) => !route.ok)) throw new Error('one or more manifest routes failed');
const proof = { hostname: probe.hostname, workerVersion: probe.health.version, gitCommit: identity.gitCommit, manifestHash: identity.manifestHash, timestamp: new Date().toISOString(), routes, access: { deniedStatus: probe.deniedStatus, allowedStatus: probe.allowedStatus, logCorrelationIds: observation.logCorrelationIds } };
await writeFile(process.argv[2] || 'production-proof.json', `${JSON.stringify(proof, null, 2)}\n`, { flag: 'wx' });
console.log('Production proof written from live probes');
