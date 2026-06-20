import { pathToFileURL } from 'node:url';

export function verifyObservability(probe) {
  if (!probe?.rayIds?.length) throw new Error('no Cloudflare cf-ray log correlation IDs captured');
  if (!probe.hostname || !Number.isInteger(probe.deniedStatus) || !Number.isInteger(probe.allowedStatus)) throw new Error('incomplete production probe');
  return { observable: true, logCorrelationIds: probe.rayIds };
}
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  let input = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => input += chunk);
  process.stdin.on('end', () => { try { console.log(JSON.stringify(verifyObservability(JSON.parse(input)))); } catch (error) { console.error(error.message); process.exitCode = 1; } });
}
