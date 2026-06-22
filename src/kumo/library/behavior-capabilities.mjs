import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {digest} from './index.mjs';

export const BEHAVIOR_CAPABILITIES_VERSION = 'kumo.behavior-capabilities/v1';
const here = path.dirname(fileURLToPath(import.meta.url));
const CONTRACT_VERSION = 'kumo.observable/v1';
const SUPPORT = new Set(['supported', 'requirements-only', 'unsupported']);
const REQUIREMENT_KEYS = ['states','transitions','events','focus','dom','aria','browserServices'];

function vectorIds(contract) { return contract.vectors.map(vector => vector.id); }
function requirement(id, contract, support, semantics = {}) {
  return {
    id, support,
    component: contract.component,
    contractDigest: digest(contract),
    requirements: Object.fromEntries(REQUIREMENT_KEYS.map(key => [key, Array.isArray(semantics[key]) ? semantics[key] : semantics[key] == null ? [] : [semantics[key]]])),
    controlled: semantics.controlled ?? {supported:false, reason:'canonical contract does not establish controlled semantics'},
    uncontrolled: semantics.uncontrolled ?? {supported:false, reason:'canonical contract does not establish uncontrolled semantics'},
    vectorIds: vectorIds(contract),
    missingOperations: semantics.missingOperations ?? []
  };
}

export function deriveBehaviorCapabilities(contracts) {
  const byName = new Map(contracts.map(contract => [contract.component, contract]));
  for (const contract of contracts) if (contract.schemaVersion !== CONTRACT_VERSION) throw new Error(`unsupported behavior contract: ${contract.component}`);
  const bindings = [];
  const clipboard = byName.get('clipboard-text');
  if (clipboard) bindings.push(requirement('clipboard-live-region', clipboard, 'requirements-only', {
    states:['clipboard writes','live announcements','copy events','button focus'], transitions:clipboard.transitions,
    events:['copy on successful clipboard write','failure behavior not established'], focus:clipboard.keyboardFocus,
    dom:[clipboard.semantics.root,'button','live-region element not established'], aria:clipboard.semantics.aria,
    browserServices:['navigator clipboard writeText after trusted button activation'],
    missingOperations:[
      {kind:'failure-transition',reason:'clipboard rejection behavior and failure callbacks are not established by canonical vectors'},
      {kind:'announcement-lifecycle',reason:'announcement timing, clearing, and repeated-copy behavior are not established by canonical vectors'},
      {kind:'live-region-semantics',reason:'live-region role, aria attributes, and DOM placement are not established by the canonical contract'},
      {kind:'button-semantics',reason:'button accessible name, type, descendants, and exact DOM placement are not established by the canonical contract'}
    ]
  }));
  const button = byName.get('button');
  if (!button) throw new Error('button contract required');
  bindings.push(requirement('native-button', button, 'supported', {
    states:['disabled','loading'], transitions:button.transitions, events:['click','submit'], focus:button.keyboardFocus,
    dom:['button','native attributes','loading svg before consumer content'], aria:button.semantics.aria, browserServices:['native form submission'],
    missingOperations:[]
  }));
  for (const name of ['checkbox','switch']) {
    const contract = byName.get(name); if (!contract) continue;
    bindings.push(requirement('toggle-control', contract, 'supported', {
      states:Object.keys(contract.initialState), transitions:contract.transitions, events:['checked-change'], focus:contract.keyboardFocus,
      dom:[contract.semantics.root], aria:contract.semantics.aria,
      controlled:{supported:true, prop:'checked'}, uncontrolled:{supported:true, source:'absence of checked'},
      missingOperations:[]
    }));
  }
  const radio = byName.get('radio');
  if (radio) bindings.push(requirement('radio-group', radio, 'requirements-only', {
    states:Object.keys(radio.initialState), transitions:radio.transitions, events:['value-change'], focus:radio.keyboardFocus,
    dom:['div','radio items'], aria:radio.semantics.aria,
    controlled:{supported:true, prop:'value'}, uncontrolled:{supported:true, prop:'defaultValue'},
    missingOperations:[
      {kind:'collection',reason:'radio item registration and disabled-item ordering are not yet implemented'},
      {kind:'roving-focus',reason:radio.unknowns[0].reason}
    ]
  }));
  for (const name of ['input','input-area','sensitive-input']) {
    const contract = byName.get(name); if (!contract) continue;
    bindings.push(requirement(name === 'sensitive-input' ? 'sensitive-field' : 'native-field', contract, 'requirements-only', {
      states:Object.keys(contract.initialState), transitions:contract.transitions, events:['native value change'], focus:contract.keyboardFocus,
      dom:[contract.semantics.root], aria:contract.semantics.aria,
      uncontrolled:{supported:true, prop:'defaultValue'},
      browserServices:name === 'sensitive-input' ? ['clipboard','live region'] : [],
      missingOperations:[{kind:'controlled-semantics',reason:'canonical contract does not establish a controlled value prop'},{kind:'vendor-behavior',reason:contract.unknowns[0].reason},{kind:'implementation',reason:'native forwarding and field wiring operations are not proven'}]
    }));
  }
  bindings.sort((a,b) => a.component.localeCompare(b.component));
  const value = {schemaVersion:BEHAVIOR_CAPABILITIES_VERSION,bindings};
  return {...value,capabilityDigest:digest(value)};
}

export function validateBehaviorCapabilities(value) {
  if (value?.schemaVersion !== BEHAVIOR_CAPABILITIES_VERSION || !Array.isArray(value.bindings)) throw new Error('invalid behavior capability registry');
  const keys = new Set();
  for (const binding of value.bindings) {
    const key = `${binding.id}:${binding.component}`;
    if (keys.has(key)) throw new Error(`duplicate behavior binding: ${key}`); keys.add(key);
    if (!SUPPORT.has(binding.support) || !/^[a-f0-9]{64}$/.test(binding.contractDigest ?? '')) throw new Error(`invalid behavior binding: ${key}`);
    for (const requirement of REQUIREMENT_KEYS) if (!Array.isArray(binding.requirements?.[requirement])) throw new Error(`${key}: missing ${requirement} requirements`);
    if (!Array.isArray(binding.vectorIds) || !binding.vectorIds.length || new Set(binding.vectorIds).size !== binding.vectorIds.length) throw new Error(`${key}: vector provenance required`);
    if (!Array.isArray(binding.missingOperations)) throw new Error(`${key}: missing operations required`);
    if (binding.support !== 'supported' && (!binding.missingOperations.length || binding.missingOperations.some(item => !item.kind || !item.reason))) throw new Error(`${key}: unresolved support requires explicit reasons`);
    if (binding.support === 'supported' && binding.missingOperations.length) throw new Error(`${key}: supported binding cannot be unresolved`);
  }
  if (value.bindings.map(x=>x.component).join('\0') !== [...value.bindings].sort((a,b)=>a.component.localeCompare(b.component)).map(x=>x.component).join('\0')) throw new Error('behavior bindings must be sorted');
  const {capabilityDigest,...unsigned}=value;
  if (capabilityDigest !== digest(unsigned)) throw new Error('behavior capability digest mismatch');
  return value;
}
export function loadBehaviorCapabilities(file=path.join(here,'capabilities/behavior-capabilities.json')) { return validateBehaviorCapabilities(JSON.parse(fs.readFileSync(file,'utf8'))); }
