import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const receipt = () => readFile('proof/dx/vue-library/receipt.json', 'utf8').then(JSON.parse);

test('Vue package export surface is independently proven', async () => {
  const r = await receipt();
  assert.equal(r.framework, 'vue');
  assert.equal(r.package, '@acoyfellow/kumo-vue@0.0.1');
  assert.equal(r.exportSurface.componentCount, 41);
  assert.equal(r.exportSurface.rootImports, 'passed');
  assert.equal(r.exportSurface.subpathImports, 'passed');
  assert.equal(r.exportSurface.types, 'passed');
  assert.equal(r.exportSurface.noWorkspaceImports, 'passed');
  for (const key of ['packageSha256', 'sourceTreeDigest', 'receiptHash']) assert.match(r[key], /^[a-f0-9]{64}$/);
});

test('Vue browser conformance reports passing and pending claims honestly', async () => {
  const r = await receipt();
  for (const key of ['clientBuild','ssrBuild','renderToString','chromeHydration','buttonFieldBehavior','cssLoadedOnce'])
    assert.equal(r.browserConformance[key], 'passed', key);
  assert.ok(Object.values(r.contractVectors).includes('pending'));
  assert.equal(r.observations.serverNodePreserved, true);
  assert.equal(r.observations.click, 'Clicked 1');
  assert.equal(r.observations.disabledCount, 'Clicked 1');
  assert.equal(r.observations.model, 'changed');
  assert.deepEqual(r.observations.consoleMessages, []);
  assert.deepEqual(r.observations.exceptions, []);
  assert.deepEqual(r.observations.networkFailures, []);
});
