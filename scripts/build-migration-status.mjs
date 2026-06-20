import { existsSync } from 'node:fs';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const frameworks = ['react', 'vue', 'svelte', 'solid'];
const v1Checks = {
  vue: ['build','runtime','assets','styles','console','dom','aria','behavior','ssrHydration','package','screenshot','nativeSfc','provenance','staticRules'],
  svelte: ['build','runtime','assets','styles','console','dom','aria','behavior','ssrHydration','package','screenshot','nativeSfc','provenance','staticRules'],
  solid: ['productionBuild','network','console','domAria','behavior','ssrHydration','screenshotPixel','assetsStylesPackage','provenance']
};
const reactChecks = ['canonicalSourceProvenance','packageEvidence','productionBuild','runtimeRoute','ssrMarkup','hydration','assetsStyles','console','network','domAria','behaviorVectors','screenshotPixel'];

function fail(path, message) { throw new Error(`${path}: ${message}`); }
function exactChecks(receipt, expected, path, objectValues = false) {
  if (!receipt.checks || typeof receipt.checks !== 'object' || Array.isArray(receipt.checks)) fail(path, 'checks must be an object');
  const actual = Object.keys(receipt.checks).sort();
  if (actual.join('\0') !== [...expected].sort().join('\0')) fail(path, 'required check names do not match schema');
  for (const [name, value] of Object.entries(receipt.checks)) {
    if (objectValues ? (!value || typeof value !== 'object' || !['passed','failed','blocked'].includes(value.status)) : typeof value !== 'boolean') fail(path, `invalid check ${name}`);
  }
}

async function loadJson(path) {
  try { return JSON.parse(await readFile(path, 'utf8')); }
  catch (error) { fail(path, `invalid JSON (${error.message})`); }
}

async function validateReceipt(receipt, component, framework, root, path, catalogIds) {
  if (!receipt || typeof receipt !== 'object' || Array.isArray(receipt)) fail(path, 'receipt must be an object');
  if (!catalogIds.has(receipt.component)) fail(path, 'component is not in catalog');
  if (receipt.component !== component || receipt.framework !== framework) fail(path, 'receipt identity does not match filename/catalog slot');
  if (framework === 'react') {
    if (receipt.schemaVersion !== 'kumo.receipt/v3') fail(path, 'unsupported receipt schema');
    exactChecks(receipt, reactChecks, path, true);
    if (!['passed','failed','blocked'].includes(receipt.classification) || receipt.canonicalInput !== true) fail(path, 'invalid classification or canonical identity');
    if (!receipt.sourceEvidence || typeof receipt.sourceEvidence !== 'object' || typeof receipt.sourceEvidence.manifest !== 'string' || typeof receipt.sourceEvidence.bindingVerified !== 'boolean') fail(path, 'missing provenance fields');
  } else {
    if (receipt.schemaVersion !== 'kumo.receipt/v1') fail(path, 'unsupported receipt schema');
    exactChecks(receipt, v1Checks[framework], path);
    if (typeof receipt.irHash !== 'string' || !receipt.irHash || typeof receipt.emitterHash !== 'string' || !receipt.emitterHash) fail(path, 'missing IR/emitter hashes');
    const provenancePath = resolve(root, 'runtime', component, framework, 'provenance.json');
    const provenance = await loadJson(provenancePath);
    if (provenance.schemaVersion !== 'kumo.ir/v1' || provenance.component !== component || provenance.framework !== framework || provenance.irHash !== receipt.irHash || provenance.emitterHash !== receipt.emitterHash) fail(path, 'receipt does not match current provenance');
  }
}

export async function buildMigrationStatus({ root = defaultRoot, outputPath = resolve(root, 'generated/migration-status.json') } = {}) {
  const ir = await loadJson(resolve(root, 'generated/catalog.ir.json'));
  if (ir.schemaVersion !== 'kumo.ir/v1' || !Array.isArray(ir.components) || !ir.components.length) throw new Error('catalog IR is malformed or empty');
  const catalogIds = new Set(ir.components.map(component => component.id));
  if (catalogIds.size !== ir.components.length || [...catalogIds].some(id => typeof id !== 'string' || !id)) throw new Error('catalog component identities are invalid');
  const components = {};
  for (const component of ir.components) {
    const status = {};
    for (const framework of frameworks) {
      const relativeReceipt = `generated/receipts/${component.id}.${framework}.json`;
      const receiptPath = resolve(root, relativeReceipt);
      if (!existsSync(receiptPath)) { status[framework] = 'missing'; status[`${framework}Receipt`] = null; continue; }
      const receipt = await loadJson(receiptPath);
      await validateReceipt(receipt, component.id, framework, root, receiptPath, catalogIds);
      const checks = Object.values(receipt.checks);
      const passed = framework === 'react' ? receipt.classification === 'passed' : checks.every(value => value === true);
      status[framework] = passed ? (framework === 'react' ? 'passed' : 'verified') : (receipt.classification ?? 'failed');
      status[`${framework}Receipt`] = relativeReceipt;
    }
    components[component.id] = status;
  }
  const output = { schemaVersion: 'kumo.migration-status/v2', catalogSchema: ir.schemaVersion, derivedOnlyFromReceipts: true, components, auditSummary: { react: 'generated/react-audit-summary.json' } };
  await mkdir(dirname(outputPath), { recursive: true });
  const temporary = `${outputPath}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temporary, JSON.stringify(output, null, 2) + '\n');
  await rename(temporary, outputPath);
  return output;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const output = await buildMigrationStatus();
  const counts = Object.fromEntries(frameworks.map(framework => [framework, Object.values(output.components).filter(component => ['passed', 'verified'].includes(component[framework])).length]));
  console.log(`migration status rebuilt: ${JSON.stringify(counts)}`);
}
