import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export async function deploymentIdentity() {
  const manifestBytes = await readFile(new URL('../deploy-manifest.json', import.meta.url));
  const manifest = JSON.parse(manifestBytes);
  if (manifest.schemaVersion !== 1 || !manifest.service || !manifest.version || !manifest.routes?.length) throw new Error('invalid deploy-manifest.json');
  const gitCommit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  return { service: manifest.service, version: manifest.version, gitCommit, manifestHash: createHash('sha256').update(manifestBytes).digest('hex') };
}

export async function deploy({ dryRun = true } = {}) {
  const identity = await deploymentIdentity();
  const args = ['wrangler', 'deploy', '--var', `WORKER_VERSION:${identity.version}`, '--var', `GIT_COMMIT:${identity.gitCommit}`];
  if (dryRun) args.push('--dry-run');
  const result = spawnSync('npx', args, { stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`deployment command failed (${result.status})`);
  return identity;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  deploy({ dryRun: !process.argv.includes('--execute') }).then((identity) => console.log(JSON.stringify(identity))).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
