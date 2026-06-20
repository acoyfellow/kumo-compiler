import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { validateDeployManifest } from './validate-deploy-manifest.mjs';

export async function deploymentIdentity({ allowModified = false } = {}) {
  const manifestBytes = await readFile(new URL('../deploy-manifest.json', import.meta.url));
  const manifest = JSON.parse(manifestBytes);
  const config = JSON.parse((await readFile(new URL('../wrangler.jsonc', import.meta.url), 'utf8')).replace(/^\s*\/\/.*$/gm, ''));
  if (manifest.schemaVersion !== 1 || !manifest.service || !manifest.version || !manifest.routes?.length) throw new Error('invalid deploy-manifest.json');
  await validateDeployManifest(manifest);
  const gitCommit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  if (gitCommit !== manifest.sourceCommit) throw new Error(`refusing deployment from source commit ${gitCommit}; pinned commit is ${manifest.sourceCommit}`);
  if (!allowModified && execFileSync('git', ['status', '--porcelain', '--untracked-files=no'], { encoding: 'utf8' }).trim()) throw new Error('refusing deployment from a modified tracked worktree');
  const targetRoute = config.routes?.find(({ pattern }) => pattern === manifest.target?.hostname);
  if (config.name !== manifest.service || config.account_id !== manifest.target?.accountId || !targetRoute?.custom_domain || config.routes.length !== 1) {
    throw new Error('wrangler target does not exactly match the pinned manifest service/account/custom domain');
  }
  const manifestHash = createHash('sha256').update(manifestBytes).digest('hex');
  return { service: manifest.service, version: manifest.version, gitCommit, manifestHash, target: manifest.target };
}

export async function deploy({ dryRun = true } = {}) {
  const identity = await deploymentIdentity({ allowModified: dryRun });
  console.log(`Deploy target: ${identity.service} -> https://${identity.target.hostname} (${identity.target.accountName}, ${identity.target.accountId}; manifest ${identity.manifestHash}; commit ${identity.gitCommit})`);
  const args = ['wrangler', 'deploy', '--name', identity.service, '--var', `WORKER_VERSION:${identity.version}`, '--var', `GIT_COMMIT:${identity.gitCommit}`];
  if (dryRun) args.push('--dry-run');
  const result = spawnSync('npx', args, { stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`deployment command failed (${result.status})`);
  return identity;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  deploy({ dryRun: !process.argv.includes('--execute') }).then((identity) => console.log(JSON.stringify(identity))).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
