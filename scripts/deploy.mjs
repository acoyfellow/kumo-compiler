import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { validateDeployManifest } from './validate-deploy-manifest.mjs';
import { DEPLOY_DIGEST_ALGORITHM, PROTECTED_DEPLOY_PATHS, deployPayloadDigest } from './deploy-source.mjs';

const root = resolve(import.meta.dirname, '..');

export async function deploymentIdentity() {
  const manifestBytes = await readFile(resolve(root, 'deploy-manifest.json'));
  const manifest = JSON.parse(manifestBytes);
  const config = JSON.parse((await readFile(resolve(root, 'wrangler.jsonc'), 'utf8')).replace(/^\s*\/\/.*$/gm, ''));
  if (manifest.schemaVersion !== 1 || !manifest.service || !manifest.version || !manifest.routes?.length) throw new Error('invalid deploy-manifest.json');
  await validateDeployManifest(manifest);
  const gitCommit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  if (execFileSync('git', ['status', '--porcelain', '--untracked-files=no'], { cwd: root, encoding: 'utf8' }).trim()) throw new Error('refusing deployment from a modified tracked worktree');
  const targetRoute = config.routes?.find(({ pattern }) => pattern === manifest.target?.hostname);
  if (config.name !== manifest.service || config.account_id !== manifest.target?.accountId || !targetRoute?.custom_domain || config.routes.length !== 1 || manifest.target?.customDomain !== true || manifest.target?.zoneName !== 'coey.dev' || manifest.target?.zoneId !== '1563da24f904f018b89fdcb2147c558b') {
    throw new Error('wrangler target does not exactly match the pinned manifest service/account/custom domain/zone');
  }
  if (manifest.source?.algorithm !== DEPLOY_DIGEST_ALGORITHM || !/^[a-f0-9]{64}$/.test(manifest.source?.deployPayloadSha256 || '')) throw new Error('invalid immutable deploy payload source rule');
  const payload = await deployPayloadDigest(resolve(root, config.assets?.directory || ''));
  if (payload.sha256 !== manifest.source.deployPayloadSha256) throw new Error(`refusing stale or modified deploy payload (expected ${manifest.source.deployPayloadSha256}, got ${payload.sha256})`);
  const trackedPayload = execFileSync('git', ['ls-files', '--', config.assets.directory], { cwd: root, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const protectedIncluded = trackedPayload.filter((path) => PROTECTED_DEPLOY_PATHS.some((protectedPath) => path === protectedPath || path.endsWith(`/${protectedPath}`)));
  if (protectedIncluded.length) throw new Error(`protected deployment files must not be included in the asset bundle: ${protectedIncluded.join(', ')}`);
  const manifestHash = createHash('sha256').update(manifestBytes).digest('hex');
  return { service: manifest.service, version: manifest.version, gitCommit, manifestHash, payloadHash: payload.sha256, payloadFiles: payload.files, target: manifest.target };
}

export async function deploy({ dryRun = true } = {}) {
  const identity = await deploymentIdentity();
  console.log(`Deploy target: ${identity.service} -> https://${identity.target.hostname} (${identity.target.accountName}, ${identity.target.accountId}; manifest ${identity.manifestHash}; payload ${identity.payloadHash}; commit ${identity.gitCommit})`);
  const args = ['wrangler', 'deploy', '--name', identity.service, '--var', `WORKER_VERSION:${identity.version}`, '--var', `GIT_COMMIT:${identity.gitCommit}`];
  if (dryRun) args.push('--dry-run');
  const result = spawnSync('npx', args, { stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`deployment command failed (${result.status})`);
  return identity;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  deploy({ dryRun: !process.argv.includes('--execute') }).then((identity) => console.log(JSON.stringify(identity))).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
