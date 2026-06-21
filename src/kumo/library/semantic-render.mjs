import fs from 'node:fs';
import path from 'node:path';
import {digest} from './index.mjs';

export const SEMANTIC_RENDER_VERSION = 'kumo.semantic-render/v1';
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const SELECTOR = /^(?:[a-z][a-z0-9-]*|\[[a-zA-Z_:][-a-zA-Z0-9_:.]*(?:=(?:"[^"]*"|'[^']*'|[-a-zA-Z0-9_:.]+))?\])$/;

function predicate(props, fixture) {
  const predicates = Object.keys(props).sort().map(name => ({kind:'prop-equals', name, value:props[name]}));
  if (fixture !== undefined) predicates.push({kind:'fixture-equals', value:fixture});
  return predicates;
}
function requirements(expected, where) {
  const out = {};
  if (expected.tag !== undefined) out.tag = expected.tag;
  if (expected.count !== undefined) out.count = expected.count;
  if (expected.attributes !== undefined) out.attributes = expected.attributes;
  if (expected.classes !== undefined) out.classes = expected.classes;
  if (expected.text !== undefined) out.text = expected.text;
  const allowed = new Set(['tag','count','attributes','classes','text']);
  for (const key of Object.keys(expected)) if (!allowed.has(key)) throw new Error(`${where}: unknown semantic requirement ${key}`);
  return out;
}
function conflict(a, b) {
  if (a.tag && b.tag && a.tag !== b.tag) return true;
  if (a.count !== undefined && b.count !== undefined && a.count !== b.count) return true;
  for (const group of ['attributes','classes','text']) {
    const ai = a[group]?.includes, bi = b[group]?.includes;
    if (object(ai) && object(bi)) for (const key of Object.keys(ai)) if (key in bi && ai[key] !== bi[key]) return true;
  }
  return false;
}
export function validateSemanticRender(capability) {
  if (capability.schemaVersion !== SEMANTIC_RENDER_VERSION) throw new Error('unknown semantic render schema');
  for (const component of capability.components) for (const vector of component.vectors) {
    if (!Array.isArray(vector.when)) throw new Error(`${component.component}/${vector.id}: predicates required`);
    for (const p of vector.when) if (!((p.kind === 'prop-equals' && typeof p.name === 'string') || p.kind === 'fixture-equals')) throw new Error(`${component.component}/${vector.id}: invalid predicate`);
    for (const node of vector.nodes) {
      if (node.selector !== ':root' && !SELECTOR.test(node.selector)) throw new Error(`${component.component}/${vector.id}: unknown selector ${node.selector}`);
      requirements(node.require, `${component.component}/${vector.id}/${node.selector}`);
    }
  }
  for (const component of capability.components) for (let i=0;i<component.vectors.length;i++) for (let j=i+1;j<component.vectors.length;j++) {
    const a=component.vectors[i], b=component.vectors[j];
    if (JSON.stringify(a.when) !== JSON.stringify(b.when)) continue;
    for (const an of a.nodes) for (const bn of b.nodes) if (an.selector===bn.selector && conflict(an.require,bn.require)) throw new Error(`${component.component}: contradictory semantic constraints`);
  }
  const signed = capability.capabilityDigest;
  const unsigned = Object.fromEntries(Object.entries(capability).filter(([key]) => key !== 'capabilityDigest'));
  if (signed !== digest(unsigned)) throw new Error('semantic render digest mismatch');
  return capability;
}
export function deriveSemanticRender(contractsDirectory) {
  const components=[];
  for (const file of fs.readdirSync(contractsDirectory).filter(x=>x.endsWith('.json')).sort()) {
    const contract=JSON.parse(fs.readFileSync(path.join(contractsDirectory,file),'utf8')), vectors=[];
    for (const vector of contract.vectors ?? []) {
      if (vector.actions?.length || !vector.expected?.root) continue;
      const nodes=[{selector:':root',require:requirements(vector.expected.root,`${contract.component}/${vector.id}/root`)}];
      for (const descendant of vector.expected.descendants ?? []) {
        if (!SELECTOR.test(descendant.selector)) throw new Error(`${contract.component}/${vector.id}: unknown selector ${descendant.selector}`);
        const {selector,...rest}=descendant; nodes.push({selector,require:requirements(rest,`${contract.component}/${vector.id}/${selector}`)});
      }
      vectors.push({id:vector.id,when:predicate(vector.props ?? {}, vector.fixture),fixtureRef:vector.fixture ? (vector.fixture.kind ? {kind:vector.fixture.kind} : {}) : null,nodes,provenance:{contractPath:`contracts/kumo.observable/v1/components/${file}`,vectorId:vector.id,contractDigest:digest(contract)}});
    }
    if (vectors.length) components.push({component:contract.component,vectors});
  }
  const unsigned={schemaVersion:SEMANTIC_RENDER_VERSION,components};
  const capability={schemaVersion:unsigned.schemaVersion,components:unsigned.components,capabilityDigest:digest(unsigned)};
  validateSemanticRender(capability);
  return capability;
}
