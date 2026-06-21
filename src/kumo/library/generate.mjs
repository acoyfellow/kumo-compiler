import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {ALGEBRA_VERSION} from './algebra.mjs';
import {canonicalJSON, digest} from './index.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const contracts = path.join(root, 'contracts/kumo.observable/v1/components');
const models = path.join(here, 'models');
const ready = new Set(['badge', 'banner', 'breadcrumbs', 'cloudflare-logo', 'code', 'empty', 'grid', 'grid-item', 'label', 'layer-card', 'link', 'loader', 'meter', 'surface', 'table', 'text']);
const lit = value => ({kind: 'literal', value});
const prop = name => ({kind: 'prop', name});
const style = name => ({kind: 'style-ref', name});
const children = {kind: 'children'};
const element = (tag, childNodes = [children], attributes = {}) => ({kind: 'element', tag, attributes, styles: [style('root')], children: childNodes});

const definitions = {
  badge: element('span'), banner: element('section', [{kind: 'slot', name: 'icon'}, {kind: 'text', value: prop('title')}, {kind: 'slot', name: 'description'}, {kind: 'slot', name: 'action'}, children]),
  breadcrumbs: element('nav', [children], {'aria-label': lit('Breadcrumbs')}),
  'cloudflare-logo': element('svg', [], {role: lit('img'), 'aria-label': lit('Cloudflare')}),
  code: element('code', [{kind: 'text', value: prop('code')}]),
  empty: element('section', [{kind: 'slot', name: 'icon'}, {kind: 'text', value: prop('title')}, {kind: 'slot', name: 'description'}, {kind: 'slot', name: 'contents'}]),
  grid: element('div'), 'grid-item': element('div'), label: element('label'), 'layer-card': element('div'),
  link: element('a', [children], {href: prop('href')}), loader: element('span', [], {role: lit('status'), 'aria-label': prop('aria-label')}),
  meter: element('div', [{kind: 'text', value: prop('label')}, {kind: 'element', tag: 'meter', properties: {value: prop('value'), min: prop('min'), max: prop('max')}, styles: [style('track')], children: []}, {kind: 'condition', when: prop('showValue'), then: {kind: 'text', value: {kind: 'coalesce', values: [prop('customValue'), prop('value')]}}}]),
  surface: element('div'), table: element('table'),
  text: {kind: 'element', tag: 'span', properties: {renderAs: {kind: 'coalesce', values: [prop('as'), lit('span')]}}, styles: [style('root')], children: [children]}
};

const capabilityOperations = {
  'static-element': ['render'], polymorphic: ['render'], 'compound-context': ['render'], 'controlled-state': ['state', 'emit'],
  'native-input': ['render', 'emit'], 'field-wiring': ['render', 'ref'], 'clipboard/live-region': ['browser-service', 'emit'],
  'roving-focus': ['state', 'focus', 'ref'], 'current-link': ['render'], 'collection/listbox': ['render', 'state', 'focus'],
  'dismissable-layer': ['portal', 'lifecycle'], 'modal-focus': ['focus', 'ref', 'lifecycle'], positioning: ['browser-service', 'lifecycle'],
  'responsive-media': ['browser-service', 'lifecycle'], 'inert/disclosure': ['state', 'render'], 'date/range': ['state', 'emit'],
  toast: ['portal', 'lifecycle', 'emit'], pagination: ['state', 'emit']
};

function implementation(name) {
  return {algebraVersion: ALGEBRA_VERSION, componentRoot: definitions[name], operations: [
    {id: 'render-root', kind: 'render'}, {id: 'apply-root-styles', kind: 'style', styles: [style('root')]}
  ]};
}
function missingFor(model) {
  const kinds = new Set(model.capabilities.flatMap(capability => capabilityOperations[capability] ?? []));
  if (!kinds.size) kinds.add('render');
  return [...kinds].sort().map(kind => ({kind, reason: `canonical ${kind} operation is not yet represented by the implementation algebra`}));
}

fs.mkdirSync(models, {recursive: true});
const entries = [];
for (const file of fs.readdirSync(contracts).filter(file => file.endsWith('.json')).sort((a, b) => a.slice(0, -5).localeCompare(b.slice(0, -5)))) {
  const name = file.slice(0, -5);
  const contractPath = `contracts/kumo.observable/v1/components/${file}`;
  const contract = JSON.parse(fs.readFileSync(path.join(root, contractPath), 'utf8'));
  const previous = JSON.parse(fs.readFileSync(path.join(models, file), 'utf8'));
  const model = {...previous, provenance: {...previous.provenance, contractPath, contractDigest: digest(contract)}};
  delete model.modelDigest;
  model.componentRoot = {frameworkNeutral: true, implementationReady: ready.has(name)};
  if (ready.has(name)) model.implementation = implementation(name);
  else { delete model.implementation; model.missingOperations = missingFor(model); }
  if (ready.has(name)) delete model.missingOperations;
  model.modelDigest = digest(model);
  fs.writeFileSync(path.join(models, file), `${JSON.stringify(model, null, 2)}\n`);
  entries.push({component: name, file: `models/${file}`, digest: model.modelDigest});
}
const manifest = {schemaVersion: 'kumo.library-manifest/v1', count: entries.length, implementationReadyCount: entries.filter(entry => ready.has(entry.component)).length, components: entries};
fs.writeFileSync(path.join(here, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
process.stdout.write(`${canonicalJSON({count: entries.length, implementationReadyCount: manifest.implementationReadyCount})}\n`);
