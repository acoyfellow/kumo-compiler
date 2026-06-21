import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, rm, copyFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '../..');
const output = resolve(root, 'library-artifacts');
const frameworks = ['vue', 'svelte', 'solid'];
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const fail = (message) => { throw new Error(message); };
const canonicalReceiptDigest = (receipt) => {
  const copy = structuredClone(receipt);
  delete copy.receiptHash;
  return sha256(Buffer.from(JSON.stringify(copy)));
};

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
const entries = [];
const seen = new Set();
for (const framework of frameworks) {
  const source = resolve(root, 'dx/packages', `kumo-${framework}`);
  const receiptPath = resolve(root, 'proof/dx', `${framework}-library/receipt.json`);
  const receipt = JSON.parse(await readFile(receiptPath, 'utf8'));
  const pkg = JSON.parse(await readFile(resolve(source, 'package.json'), 'utf8'));
  const expectedName = `@acoyfellow/kumo-${framework}`;
  if (pkg.name !== expectedName || pkg.version !== '0.0.1' || receipt.package !== `${expectedName}@0.0.1`)
    fail(`${framework}: unexpected package identity`);
  if (canonicalReceiptDigest(receipt) !== receipt.receiptHash)
    fail(`${framework}: receipt digest is invalid; rerun/update the individual library runner`);
  for (const [check, result] of Object.entries(receipt.checks)) {
    if (result !== 'passed' && result !== 'not-run') fail(`${framework}: receipt check ${check}=${result}`);
  }
  const exportNames = Object.keys(pkg.exports);
  if (!exportNames.includes('./button') || !exportNames.includes('./field') || exportNames.some((x) => /select|tabs/i.test(x)))
    fail(`${framework}: package must expose Button and Field only`);

  const temp = await mkdtemp(resolve(tmpdir(), 'kumo-library-'));
  const hashes = [];
  let packed;
  for (let run = 0; run < 2; run++) {
    const result = spawnSync('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', temp], { cwd: source, encoding: 'utf8' });
    if (result.status !== 0) fail(`${framework}: npm pack failed: ${result.stderr}`);
    packed = resolve(temp, JSON.parse(result.stdout)[0].filename);
    hashes.push(sha256(await readFile(packed)));
  }
  if (hashes[0] !== hashes[1]) fail(`${framework}: repeated npm pack bytes differ`);
  if (hashes[0] !== receipt.packageSha256)
    fail(`${framework}: package hash ${hashes[0]} differs from receipt ${receipt.packageSha256}; rerun/update the individual library runner if source changed`);
  const bytes = await readFile(packed);
  const contentName = `${hashes[0]}.tgz`;
  const friendlyName = `kumo-${framework}-0.0.1.tgz`;
  if (seen.has(contentName) || seen.has(friendlyName)) fail(`artifact filename collision: ${friendlyName}`);
  seen.add(contentName); seen.add(friendlyName);
  await copyFile(packed, resolve(output, contentName));
  await copyFile(packed, resolve(output, friendlyName));
  await rm(temp, { recursive: true, force: true });
  entries.push({
    package: pkg.name, version: pkg.version, framework, sha256: hashes[0],
    integrity: `sha512-${createHash('sha512').update(bytes).digest('base64')}`,
    bytes: bytes.length, components: ['Button', 'Field'],
    installUrl: `/packages/${friendlyName}`, artifact: contentName, friendlyName,
    receiptDigest: receipt.receiptHash, sourceTree: receipt.sourceTree,
    sourceTreeDigest: receipt.sourceTreeDigest
  });
}
await writeFile(resolve(output, 'manifest.json'), `${JSON.stringify({ schemaVersion: 1, packages: entries }, null, 2)}\n`);
console.log(`Built ${entries.length} deterministic library artifacts in ${basename(output)}/`);
