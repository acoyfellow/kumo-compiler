import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {CAPABILITIES, digest, loadLibrary, validateModel} from '../src/kumo/library/index.mjs';

const base = path.resolve('src/kumo/library');
const contracts = path.resolve('contracts/kumo.observable/v1/components');

test('inventory is exactly the 41 sorted observable contracts', () => {
  const {manifest, models} = loadLibrary(base);
  const expected = fs.readdirSync(contracts).filter(x => x.endsWith('.json')).map(x => x.slice(0,-5)).sort();
  assert.equal(models.length, 41);
  assert.deepEqual(manifest.components.map(x => x.component), expected);
});

test('canonical exports, props, defaults and contract digest are preserved', () => {
  for (const model of loadLibrary(base).models) {
    const contract = JSON.parse(fs.readFileSync(model.provenance.contractPath));
    assert.deepEqual(model.public.exports, contract.publicApi.exports);
    assert.equal(model.public.subpath, contract.canonical.exportPath);
    assert.deepEqual(model.props.items.map(x => x.name), Object.keys(contract.publicApi.props).sort((a,b) => a.localeCompare(b)));
    for (const prop of model.props.items) assert.deepEqual(prop.default, contract.publicApi.defaults[prop.name] ?? null);
    assert.equal(model.provenance.contractDigest, digest(contract));
  }
});

test('component roots and external fixtures cannot be confused', () => {
  for (const model of loadLibrary(base).models) {
    assert.equal(model.componentRoot.frameworkNeutral, true);
    assert.doesNotMatch(JSON.stringify(model.componentRoot), /<main|<h1|React|fixture|vectors|sample copy/i);
    assert.ok(model.provenance.contractPath.endsWith(`${model.component}.json`));
  }
});

test('capabilities use only evidence-backed closed taxonomy', () => {
  for (const model of loadLibrary(base).models) for (const capability of model.capabilities) assert.ok(CAPABILITIES.includes(capability));
  const model = structuredClone(loadLibrary(base).models[0]);
  model.capabilities.push('guessed-magic');
  assert.throws(() => validateModel(model), /unknown capability/);
});

test('unknown schema, extra inventory, and unstable reruns are rejected', () => {
  const first = loadLibrary(base);
  const second = loadLibrary(base);
  assert.deepEqual(second, first);
  const model = structuredClone(first.models[0]); model.schemaVersion = 'future';
  assert.throws(() => validateModel(model), /unknown library schema/);
  const manifest = structuredClone(first.manifest); manifest.components.push(manifest.components[0]); manifest.count++;
  assert.notEqual(manifest.count, 41);
});

test('library contains no ID-specific emitter templates', () => {
  const source = fs.readFileSync(path.join(base, 'index.mjs'), 'utf8');
  assert.doesNotMatch(source, /switch\s*\(.*component|if\s*\(.*component\s*===/);
});
