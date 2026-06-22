import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const receipt = () => readFile('proof/dx/vue-library/receipt.json', 'utf8').then(JSON.parse);
const reason = 'requires scripts/observable-browser-runner.mjs trusted conformance';

test('Vue package export surface is independently proven', async () => {
  const r = await receipt();
  assert.equal(r.framework, 'vue');
  assert.equal(r.package, '@acoyfellow/kumo-vue@0.0.1');
  assert.equal(r.exportSurface.componentCount, 41);
  assert.equal(r.exportSurface.rootImports, 'passed');
  assert.equal(r.exportSurface.compoundPathCount, 63);
  assert.equal(r.exportSurface.modelBindings, 'passed');
  assert.equal(r.exportSurface.compoundPaths, 'passed');
  assert.equal(r.exportSurface.subpathImports, 'passed');
  assert.equal(r.exportSurface.types, 'passed');
  assert.equal(r.exportSurface.noWorkspaceImports, 'passed');
  assert.equal(r.exportSurface.fileAudit, 'passed');
  assert.equal(r.exportSurface.treeShaking, 'passed');
  for (const key of ['packageSha256', 'sourceTreeDigest', 'receiptHash']) assert.match(r[key], /^[a-f0-9]{64}$/);
});

test('Vue package proof reports only deterministic static/package claims', async () => {
  const r = await receipt();
  for (const key of ['clientBuild', 'ssrBuild', 'renderToString', 'cssAssetsPresent'])
    assert.equal(r.packageConformance[key], 'passed', key);
  assert.equal(r.staticSemanticConformance.status, 'passed');
  assert.equal(r.staticSemanticConformance.passed, 66);
  assert.equal(r.staticSemanticConformance.unresolved, 0);
  for (const key of ['hydration', 'serverNodeIdentity', 'buttonFieldBehavior', 'hmr', 'screenReader']) {
    assert.equal(r.browserConformance[key], 'not-run', key);
    assert.equal(r.pendingReasons[key], reason, key);
  }
  assert.deepEqual(r.observations, {});
});

test('Vue package proof contains no synthetic events or manual browser lifecycle', async () => {
  const source = await readFile('proof/dx/vue-library/run.mjs', 'utf8');
  for (const pattern of [
    /Runtime\.evaluate/,
    /\.click\s*\(/,
    /dispatchEvent\s*\(/,
    /new Event\s*\(/,
    /remote-debugging-port/,
    /Google Chrome/,
    /new WebSocket/,
    /Page\.reload/,
  ]) assert.doesNotMatch(source, pattern);
});
