import { canonicalJson, canonicalJsonBytes, sha256Bytes, writeImmutableBytes } from '../lib/immutable-receipts.mjs';

export const PACKAGE_ATTESTATION_SCHEMA_VERSION = 'kumo.package-attestation/v1';
export const PACKAGE_VERSION = '0.0.1';
export const PACKAGE_IDENTITIES = Object.freeze({
  vue: '@acoyfellow/kumo-vue',
  svelte: '@acoyfellow/kumo-svelte',
  solid: '@acoyfellow/kumo-solid',
});
export const REQUIRED_GATES = Object.freeze(['freshConsumerInstall', 'clientBuild', 'ssrBuild']);
const SHA256 = /^[a-f0-9]{64}$/;
const AUTOMATABLE_STATUSES = new Set(['passed', 'failed', 'blocked', 'not-run']);
const DEFAULT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

function object(value) { return value && typeof value === 'object' && !Array.isArray(value); }

export function validatePackageAttestation(attestation, { tarballBytes, prerequisites, now, maxAgeMs = DEFAULT_MAX_AGE_MS } = {}) {
  const errors = [];
  if (!object(attestation)) return { valid: false, errors: ['attestation must be an object'] };
  const expectedName = PACKAGE_IDENTITIES[attestation.framework];
  if (attestation.schemaVersion !== PACKAGE_ATTESTATION_SCHEMA_VERSION) errors.push('invalid schemaVersion');
  if (!expectedName) errors.push('invalid framework');
  if (attestation.package?.name !== expectedName) errors.push('stale or mixed package identity');
  if (attestation.package?.version !== PACKAGE_VERSION) errors.push('invalid package version');
  if (!SHA256.test(attestation.package?.tarballSha256 ?? '')) errors.push('invalid tarballSha256');
  if (tarballBytes !== undefined && attestation.package?.tarballSha256 !== sha256Bytes(tarballBytes)) errors.push('tarball hash mismatch');
  const inventory = attestation.inventory;
  for (const key of ['manifestCount', 'exportCount', 'typeCount', 'componentCount']) if (!Number.isInteger(inventory?.[key]) || inventory[key] < 1) errors.push(`invalid ${key}`);
  if (inventory?.componentCount !== 41) errors.push('component inventory must contain exactly 41 components');
  const packs = attestation.deterministicPackSha256;
  if (!Array.isArray(packs) || packs.length !== 2 || packs.some(hash => !SHA256.test(hash)) || packs?.[0] !== packs?.[1]) errors.push('deterministic double-pack hashes must match');
  if (packs?.[0] && attestation.package?.tarballSha256 !== packs[0]) errors.push('pack hash does not match tarball');
  for (const gate of REQUIRED_GATES) {
    const check = attestation.checks?.[gate];
    if (!object(check)) errors.push(`missing automatable gate: ${gate}`);
    else {
      if (!AUTOMATABLE_STATUSES.has(check.status)) errors.push(`invalid gate status: ${gate}`);
      if (check.status !== 'passed') errors.push(`automatable gate did not pass: ${gate}`);
      if (typeof check.checkedAt !== 'string' || !Number.isFinite(Date.parse(check.checkedAt))) errors.push(`invalid gate timestamp: ${gate}`);
      else if (now !== undefined) {
        const age = new Date(now).getTime() - Date.parse(check.checkedAt);
        if (age < 0) errors.push(`gate timestamp is in the future: ${gate}`);
        else if (age > maxAgeMs) errors.push(`gate timestamp is stale: ${gate}`);
      }
    }
  }
  if (!Array.isArray(attestation.prerequisites) || attestation.prerequisites.length === 0) errors.push('missing prerequisite digests');
  else for (const [index, prerequisite] of attestation.prerequisites.entries()) if (!object(prerequisite) || typeof prerequisite.identity !== 'string' || !prerequisite.identity || !SHA256.test(prerequisite.sha256 ?? '')) errors.push(`invalid prerequisite at index ${index}`);
  if (prerequisites !== undefined && canonicalJson(attestation.prerequisites) !== canonicalJson(prerequisites)) errors.push('prerequisites do not match expected digests');
  if (attestation.status !== 'passed') errors.push('attestation status must be passed');
  return { valid: errors.length === 0, errors };
}

export function createPackageAttestation(input) {
  const attestation = {
    schemaVersion: PACKAGE_ATTESTATION_SCHEMA_VERSION,
    framework: input.framework,
    package: { name: input.name, version: input.version, tarballSha256: sha256Bytes(input.tarballBytes) },
    inventory: { ...input.inventory },
    deterministicPackSha256: [...input.deterministicPackSha256],
    checks: structuredClone(input.checks),
    prerequisites: structuredClone(input.prerequisites),
    status: 'passed',
  };
  const result = validatePackageAttestation(attestation, { tarballBytes: input.tarballBytes, prerequisites: input.prerequisites, now: input.now });
  if (!result.valid) throw new Error(`invalid package attestation: ${result.errors.join('; ')}`);
  return attestation;
}

export async function writePackageAttestation(root, relativePath, attestation, options = {}) {
  const result = validatePackageAttestation(attestation, options);
  if (!result.valid) throw new Error(`invalid package attestation: ${result.errors.join('; ')}`);
  return writeImmutableBytes(root, relativePath, canonicalJsonBytes(attestation));
}
