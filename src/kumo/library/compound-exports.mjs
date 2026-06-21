import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {digest} from './index.mjs';

export const COMPOUND_EXPORTS_SCHEMA_VERSION = 'kumo.compound-exports/v1';
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');

const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const strings = (value, where) => {
  if (!Array.isArray(value) || value.some(item => typeof item !== 'string' || !item)) throw new Error(`${where}: expected strings`);
};

export function fixtureComponentRefs(fixture) {
  const refs = [];
  const visit = value => {
    if (Array.isArray(value)) return value.forEach(visit);
    if (!object(value)) return;
    if (value.kind === 'component') {
      if (typeof value.ref !== 'string' || !value.ref) throw new Error('component fixture requires ref');
      refs.push(value.ref);
    }
    Object.values(value).forEach(visit);
  };
  visit(fixture);
  return refs;
}

export function pathTree(paths) {
  const tree = {};
  for (const compoundPath of paths) {
    let cursor = tree;
    for (const segment of compoundPath.split('.')) cursor = cursor[segment] ??= {};
  }
  return tree;
}

export function deriveCompoundExports({contractsDir = path.join(root, 'contracts/kumo.observable/v1/components'), packedPath = path.join(root, 'proof/dx/conformance/shared/packed-fixtures.json')} = {}) {
  const contracts = new Map(fs.readdirSync(contractsDir).filter(file => file.endsWith('.json')).map(file => {
    const contract = JSON.parse(fs.readFileSync(path.join(contractsDir, file), 'utf8'));
    return [contract.component, contract];
  }));
  const packed = JSON.parse(fs.readFileSync(packedPath, 'utf8'));
  const roots = new Map();
  for (const vector of packed.vectors) {
    const component = vector.provenance.vector.split('/')[0];
    const contract = contracts.get(component);
    if (!contract) throw new Error(`unowned packed vector: ${vector.provenance.vector}`);
    const publicExports = contract.publicApi?.exports;
    strings(publicExports, `${component}.publicApi.exports`);
    for (const ref of fixtureComponentRefs(vector.fixture)) {
      const [canonicalRoot, ...segments] = ref.split('.');
      if (!publicExports.includes(canonicalRoot)) throw new Error(`${vector.provenance.vector}: unknown or unowned fixture root ${canonicalRoot}`);
      if (!segments.length) continue;
      const entry = roots.get(canonicalRoot) ?? {canonicalRoot, component, publicExports:[...publicExports].sort(), paths:new Map()};
      if (entry.component !== component) throw new Error(`${ref}: root is owned by both ${entry.component} and ${component}`);
      const compoundPath = segments.join('.');
      const vectors = entry.paths.get(compoundPath) ?? new Set();
      vectors.add(vector.provenance.vector);
      entry.paths.set(compoundPath, vectors);
      roots.set(canonicalRoot, entry);
    }
  }
  const result = {schemaVersion:COMPOUND_EXPORTS_SCHEMA_VERSION, roots:[...roots.values()].sort((a,b)=>a.canonicalRoot.localeCompare(b.canonicalRoot)).map(entry => {
    const paths = [...entry.paths].sort(([a],[b])=>a.localeCompare(b)).map(([compoundPath, vectorIds]) => ({path:compoundPath, vectorIds:[...vectorIds].sort()}));
    return {canonicalRoot:entry.canonicalRoot, component:entry.component, publicExports:entry.publicExports, tree:pathTree(paths.map(item=>item.path)), paths};
  })};
  return {...result, digest:digest(result)};
}

export function validateCompoundExports(capability) {
  if (capability.schemaVersion !== COMPOUND_EXPORTS_SCHEMA_VERSION) throw new Error(`unknown compound export schema: ${capability.schemaVersion}`);
  const roots = new Set();
  for (const entry of capability.roots ?? []) {
    if (roots.has(entry.canonicalRoot)) throw new Error(`duplicate compound root: ${entry.canonicalRoot}`);
    roots.add(entry.canonicalRoot);
    if (!entry.publicExports.includes(entry.canonicalRoot)) throw new Error(`${entry.canonicalRoot}: root is not public`);
    strings(entry.publicExports, `${entry.canonicalRoot}.publicExports`);
    const paths = entry.paths.map(item=>item.path);
    if (new Set(paths).size !== paths.length || paths.join('\0') !== [...paths].sort().join('\0')) throw new Error(`${entry.canonicalRoot}: paths must be unique and sorted`);
    if (JSON.stringify(entry.tree) !== JSON.stringify(pathTree(paths))) throw new Error(`${entry.canonicalRoot}: path tree mismatch`);
    for (const item of entry.paths) strings(item.vectorIds, `${entry.canonicalRoot}.${item.path}.vectorIds`);
  }
  const {digest: actual, ...unsigned} = capability;
  if (digest(unsigned) !== actual) throw new Error('compound export digest mismatch');
  return capability;
}

export function loadCompoundExports(base = here) {
  return validateCompoundExports(JSON.parse(fs.readFileSync(path.join(base, 'capabilities/compound-exports.json'), 'utf8')));
}
