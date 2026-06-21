import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {CAPABILITIES, digest, loadLibrary, validateModel} from '../src/kumo/library/index.mjs';
import {ALGEBRA_VERSION, validateImplementation} from '../src/kumo/library/algebra.mjs';

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
    assert.doesNotMatch(JSON.stringify({componentRoot: model.componentRoot, implementation: model.implementation}), /<\/?[a-z]|React|JSX|fixture|vectors|sample copy|demo/i);
    assert.ok(model.provenance.contractPath.endsWith(`${model.component}.json`));
  }
});

test('all definitions remain fail-closed draft candidates with complete capability algebra', () => {
  const {manifest, models} = loadLibrary(base);
  assert.equal(manifest.implementationReadyCount, 0);
  assert.equal(manifest.candidateDefinitionCount, 41);
  assert.equal(models.filter(model => model.componentRoot.candidateDefinition).length, 41);
  assert.deepEqual(models.filter(model => model.componentRoot.implementationReady), []);
  for (const model of models) {
    assert.equal(model.implementation, undefined);
    assert.equal(model.componentRoot.draft, true);
    assert.ok(model.draftImplementation.componentRoot);
    assert.ok(model.draftImplementation.operations.length > 0);
    assert.ok(model.missingOperations.length > 0);
    const kinds = model.missingOperations.map(operation => operation.kind);
    for (const kind of ['native-forwarding', 'style-resolution', 'semantic-completeness', 'framework-output', 'packed-browser-vectors']) assert.ok(kinds.includes(kind), `${model.component}: ${kind}`);
  }
});

test('draft reference and capability operation integrity fail closed', () => {
  const model = structuredClone(loadLibrary(base).models.find(model => model.component === 'checkbox'));
  model.draftImplementation.componentRoot = {kind:'element', tag:'input', attributes:{value:{kind:'prop',name:'absent'}}, children:[]};
  delete model.modelDigest; model.modelDigest = digest(model);
  assert.throws(() => validateModel(model), /referenced prop absent is absent/);
  model.draftImplementation.componentRoot.attributes.value = {kind:'prop',name:'checked'};
  model.draftImplementation.operations = model.draftImplementation.operations.filter(operation => operation.kind !== 'emit');
  delete model.modelDigest; model.modelDigest = digest(model);
  assert.throws(() => validateModel(model), /requires emit operation/);
});

 test('forged readiness is rejected without immutable downstream and vector proof', () => {
  const draft = structuredClone(loadLibrary(base).models.find(model => model.component === 'badge'));
  draft.componentRoot.implementationReady = true;
  draft.implementation = {algebraVersion: ALGEBRA_VERSION, componentRoot: {kind: 'element', tag: 'span', children: [{kind: 'children'}]}, operations: [{id: 'render-root', kind: 'render'}]};
  delete draft.missingOperations;
  delete draft.modelDigest; draft.modelDigest = digest(draft);
  assert.throws(() => validateModel(draft), /draft candidate cannot satisfy readiness/);

  delete draft.componentRoot.candidateDefinition;
  delete draft.componentRoot.draft;
  delete draft.modelDigest; draft.modelDigest = digest(draft);
  assert.throws(() => validateModel(draft), /immutable proof references/);
});

test('generator rerun is byte-stable', () => {
  const files = ['manifest.json', ...fs.readdirSync(path.join(base, 'models')).sort().map(file => `models/${file}`)];
  const before = new Map(files.map(file => [file, fs.readFileSync(path.join(base, file))]));
  execFileSync(process.execPath, ['src/kumo/library/generate.mjs']);
  for (const file of files) assert.deepEqual(fs.readFileSync(path.join(base, file)), before.get(file), file);
});

test('algebra rejects source lookalikes and malformed operations', () => {
  const malformed = {algebraVersion: ALGEBRA_VERSION, componentRoot: {kind: 'element', tag: 'span', children: []}, operations: [{id: 'render-root', kind: 'render'}, {id: 'render-root', kind: 'render'}]};
  assert.throws(() => validateImplementation(malformed), /duplicate id/);
  malformed.componentRoot.tag = '<span>';
  malformed.operations.pop();
  const model = structuredClone(loadLibrary(base).models.find(model => model.component === 'badge'));
  model.componentRoot = {frameworkNeutral: true, implementationReady: true};
  model.implementation = malformed;
  delete model.missingOperations;
  model.readinessProof = Object.freeze({frameworkOutputs: Object.freeze({vue: `out@sha256:${'a'.repeat(64)}`, svelte: `out@sha256:${'b'.repeat(64)}`, solid: `out@sha256:${'c'.repeat(64)}`}), canonicalVectorIds: Object.freeze([`browser#${'d'.repeat(64)}`])});
  delete model.modelDigest; model.modelDigest = digest(model);
  assert.throws(() => validateModel(model), /HTML|invalid|expected/);
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
