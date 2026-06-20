import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';

const ir = JSON.parse(await readFile('generated/catalog.ir.json', 'utf8'));
const frameworks = ['react', 'vue', 'svelte', 'solid'];

export async function buildMigrationStatus() {
  const components = {};
  for (const component of ir.components) {
    const status = {};
    for (const framework of frameworks) {
      const receiptPath = `generated/receipts/${component.id}.${framework}.json`;
      if (!existsSync(receiptPath)) {
        status[framework] = 'missing';
        status[`${framework}Receipt`] = null;
        continue;
      }
      const receipt = JSON.parse(await readFile(receiptPath, 'utf8'));
      const checks = Object.values(receipt.checks ?? {});
      const passed = framework === 'react'
        ? receipt.classification === 'passed'
        : checks.length > 0 && checks.every(value => value === true || value?.status === 'passed');
      status[framework] = passed ? (framework === 'react' ? 'passed' : 'verified') : (receipt.classification ?? 'failed');
      status[`${framework}Receipt`] = receiptPath;
    }
    components[component.id] = status;
  }
  const output = {
    schemaVersion: 'kumo.migration-status/v2',
    catalogSchema: ir.schemaVersion,
    derivedOnlyFromReceipts: true,
    components,
    auditSummary: { react: 'generated/react-audit-summary.json' }
  };
  await writeFile('generated/migration-status.json', JSON.stringify(output, null, 2) + '\n');
  return output;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const output = await buildMigrationStatus();
  const counts = Object.fromEntries(frameworks.map(framework => [framework, Object.values(output.components).filter(component => ['passed', 'verified'].includes(component[framework])).length]));
  console.log(`migration status rebuilt: ${JSON.stringify(counts)}`);
}
