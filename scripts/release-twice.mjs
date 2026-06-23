import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { deployPayloadDigest } from './deploy-source.mjs';

const root = resolve(import.meta.dirname, '..');
const SHA256 = /^[a-f0-9]{64}$/;
export const RELEASE_TWICE_SCHEMA_VERSION = 'kumo.release-twice/v1';
export const RELEASE_CHECK_COMMAND = ['npm', 'run', 'release:check'];
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const canonical = (value) => JSON.stringify(value, Object.keys(value).sort());

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', ...options });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed (${result.status}): ${result.stderr || result.stdout}`);
  return result.stdout.trim();
}

export function compareReleaseObservations(first, second) {
  if (!first || !second) throw new Error('two release observations are required');
  assert.deepEqual(first, second, 'independent release observations differ');
  return first;
}

export function validateObservation(value) {
  if (!value || typeof value !== 'object') throw new Error('release observation must be an object');
  if (!Array.isArray(value.packages) || value.packages.length !== 3) throw new Error('exactly three package hashes are required');
  for (const group of [value.packages, value.githubReleaseAssets]) {
    if (!Array.isArray(group) || !group.length) throw new Error('artifact hash group is missing');
    for (const item of group) if (!item.file || !SHA256.test(item.sha256 ?? '')) throw new Error('artifact entry is invalid');
  }
  if (!SHA256.test(value.deployManifestSourceSha256 ?? '') || !SHA256.test(value.deployPayloadSha256 ?? '')) throw new Error('deploy hashes are invalid');
  return value;
}

async function hashFile(path) { return sha256(await readFile(path)); }
export async function observeRelease(directory = root) {
  const packageManifest = JSON.parse(await readFile(resolve(directory, 'library-artifacts/manifest.json')));
  const packages = await Promise.all(packageManifest.packages.map(async ({ friendlyName }) => ({ file: friendlyName, sha256: await hashFile(resolve(directory, 'library-artifacts', friendlyName)) })));
  const releaseDirectory = resolve(directory, 'release/github/libraries-v0.0.1');
  const githubManifest = JSON.parse(await readFile(resolve(releaseDirectory, 'manifest.json')));
  const githubReleaseAssets = await Promise.all(githubManifest.assets.map(async ({ file, sha256: declaredHash }) => {
    let actualHash;
    try { actualHash = await hashFile(resolve(releaseDirectory, file)); }
    catch (error) {
      if (error.code !== 'ENOENT') throw error;
      actualHash = await hashFile(resolve(directory, 'library-artifacts', file));
    }
    if (actualHash !== declaredHash) throw new Error(`${file}: GitHub release manifest mismatch`);
    return { file, sha256: actualHash };
  }));
  const deployManifestBytes = await readFile(resolve(directory, 'deploy-manifest.json'));
  const deployManifest = JSON.parse(deployManifestBytes);
  const payload = await deployPayloadDigest(resolve(directory, 'deploy'));
  const observation = {
    packages: packages.sort((a, b) => a.file.localeCompare(b.file)),
    githubReleaseAssets: githubReleaseAssets.sort((a, b) => a.file.localeCompare(b.file)),
    deployManifestSourceSha256: sha256(deployManifestBytes),
    deployPayloadSha256: payload.sha256,
  };
  validateObservation(observation);
  if (payload.sha256 !== deployManifest.source?.deployPayloadSha256 && directory !== root) throw new Error('computed deploy payload does not match deploy manifest');
  for (const item of observation.packages) {
    const manifestItem = packageManifest.packages.find((entry) => entry.friendlyName === item.file);
    if (manifestItem.sha256 !== item.sha256) throw new Error(`${item.file}: package manifest mismatch`);
  }
  return observation;
}

export function createComparisonReceipt({ commit, observation, nodeVersion = process.versions.node, npmVersion, runMode }) {
  validateObservation(observation);
  if (!/^[0-9a-f]{40}$/.test(commit)) throw new Error('receipt requires an exact commit');
  const body = {
    schemaVersion: RELEASE_TWICE_SCHEMA_VERSION,
    status: 'passed',
    commit,
    runMode,
    command: RELEASE_CHECK_COMMAND.join(' '),
    environment: { node: nodeVersion, npm: npmVersion },
    independentRuns: 2,
    observation,
    publication: { npm: false, github: false, deploy: false, gitPush: false },
  };
  return { ...body, receiptSha256: sha256(Buffer.from(JSON.stringify(body))) };
}

async function verifyCurrent() {
  const observation = await observeRelease(root);
  const latest = JSON.parse(await readFile(resolve(root, 'proof/release/latest.json')));
  validateObservation(latest.observation);
  compareReleaseObservations(latest.observation, observation);
  if (latest.receiptSha256 !== sha256(Buffer.from(JSON.stringify({ ...latest, receiptSha256: undefined }, (key, value) => key === 'receiptSha256' ? undefined : value)))) {
    // Older/current checked-in receipts use the body digest below; calculate without mutating key order.
    const { receiptSha256, ...body } = latest;
    if (receiptSha256 !== sha256(Buffer.from(JSON.stringify(body)))) throw new Error('receipt content hash mismatch');
  }
  console.log(`Verified current release artifacts (${latest.receiptSha256})`);
}

async function terminalRun() {
  const nodeMajor = Number(process.versions.node.split('.')[0]);
  const npmVersion = run('npm', ['--version']);
  if (nodeMajor !== 22 || Number(npmVersion.split('.')[0]) !== 11) throw new Error(`terminal run requires Node 22 and npm 11 (got Node ${process.versions.node}, npm ${npmVersion})`);
  const commit = run('git', ['rev-parse', 'HEAD'], { cwd: root });
  const temporaryRoot = await mkdtemp(resolve(tmpdir(), 'kumo-release-twice-'));
  const observations = [];
  try {
    for (let index = 1; index <= 2; index++) {
      const checkout = resolve(temporaryRoot, `run-${index}`);
      run('git', ['clone', '--quiet', '--no-hardlinks', root, checkout]);
      run('git', ['checkout', '--quiet', '--detach', commit], { cwd: checkout });
      run('npm', ['ci'], { cwd: checkout, stdio: 'inherit' });
      run(RELEASE_CHECK_COMMAND[0], RELEASE_CHECK_COMMAND.slice(1), { cwd: checkout, stdio: 'inherit' });
      observations.push(await observeRelease(checkout));
    }
    const observation = compareReleaseObservations(...observations);
    const receipt = createComparisonReceipt({ commit, observation, npmVersion, runMode: 'terminal-detached-clean-copies' });
    const directory = resolve(root, 'proof/release');
    await mkdir(directory, { recursive: true });
    const bytes = `${JSON.stringify(receipt, null, 2)}\n`;
    await writeFile(resolve(directory, `${receipt.receiptSha256}.json`), bytes, { flag: 'wx' }).catch(async (error) => {
      if (error.code !== 'EEXIST' || await readFile(resolve(directory, `${receipt.receiptSha256}.json`), 'utf8') !== bytes) throw error;
    });
    await writeFile(resolve(directory, 'latest.json'), bytes);
    console.log(`Release reproducibility passed; receipt proof/release/${receipt.receiptSha256}.json`);
  } finally { await rm(temporaryRoot, { recursive: true, force: true }); }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.length === 3 && process.argv[2] === '--verify-current') await verifyCurrent();
  else if (process.argv.length === 2) await terminalRun();
  else throw new Error('usage: node scripts/release-twice.mjs [--verify-current]');
}
