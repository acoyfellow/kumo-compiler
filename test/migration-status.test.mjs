import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { buildMigrationStatus } from '../scripts/build-migration-status.mjs';

const checks = { build:true,runtime:true,assets:true,styles:true,console:true,dom:true,aria:true,behavior:true,ssrHydration:true,package:true,screenshot:true,nativeSfc:true,provenance:true,staticRules:true };
async function fixture(receipt) {
  const root = await mkdtemp(join(tmpdir(), 'migration-status-'));
  await mkdir(join(root, 'generated/receipts'), { recursive: true });
  await mkdir(join(root, 'runtime/widget/vue'), { recursive: true });
  await writeFile(join(root, 'generated/catalog.ir.json'), JSON.stringify({ schemaVersion:'kumo.ir/v1', components:[{ id:'widget' }] }));
  await writeFile(join(root, 'runtime/widget/vue/provenance.json'), JSON.stringify({ schemaVersion:'kumo.ir/v1', component:'widget', framework:'vue', irHash:'ir', emitterHash:'emitter' }));
  if (receipt) await writeFile(join(root, 'generated/receipts/widget.vue.json'), JSON.stringify(receipt));
  return root;
}
const valid = () => ({ schemaVersion:'kumo.receipt/v1', component:'widget', framework:'vue', checks:{...checks}, irHash:'ir', emitterHash:'emitter' });

test('builds from module-independent temporary fixture and writes complete output', async () => {
  const root = await fixture(valid());
  const output = await buildMigrationStatus({ root });
  assert.equal(output.components.widget.vue, 'verified');
  assert.deepEqual(JSON.parse(await readFile(join(root, 'generated/migration-status.json'))), output);
});

test('rejects malformed, swapped, unknown-schema, incomplete, and stale receipts', async t => {
  for (const [name, mutate] of [
    ['swapped identity', r => { r.component='other'; }],
    ['unknown schema', r => { r.schemaVersion='kumo.receipt/v99'; }],
    ['missing check', r => { delete r.checks.runtime; }],
    ['wrong check type', r => { r.checks.runtime='yes'; }],
    ['stale provenance', r => { r.irHash='old'; }]
  ]) await t.test(name, async () => {
    const receipt=valid(); mutate(receipt); const root=await fixture(receipt);
    await assert.rejects(buildMigrationStatus({ root }));
  });
  await t.test('malformed JSON', async () => {
    const root=await fixture(); await writeFile(join(root,'generated/receipts/widget.vue.json'), '{');
    await assert.rejects(buildMigrationStatus({ root }), /invalid JSON/);
  });
  await t.test('empty catalog', async () => {
    const root=await fixture(); await writeFile(join(root,'generated/catalog.ir.json'), JSON.stringify({schemaVersion:'kumo.ir/v1',components:[]}));
    await assert.rejects(buildMigrationStatus({ root }), /empty/);
  });
});
