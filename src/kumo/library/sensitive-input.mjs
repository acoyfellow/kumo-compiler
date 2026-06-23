import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {digest} from './index.mjs';

export const SENSITIVE_INPUT_VERSION = 'kumo.sensitive-input/v1';
const here = path.dirname(fileURLToPath(import.meta.url));
const CONTRACT_VERSION = 'kumo.observable/v1';
export const SENSITIVE_INPUT_COMPONENTS = ['sensitive-input'];
const note = (field, reason) => ({field, status: 'unknown', reason});

// Derives the supported, observable sensitive-input behavior asserted by the canonical vectors:
// a div root wrapping a masked container and a password-typed input that holds the value, where
// revealing focuses the input, edits update the value (firing value:<next>) while the input
// stays type=password, and a copy control writes the value to the clipboard, announces it in a
// live region, and fires a copy event. Vendor behavior beyond this is an explicit unknown.
export function deriveSensitiveInput(contracts) {
  const byName = new Map(contracts.map(contract => [contract.component, contract]));
  const contract = byName.get('sensitive-input');
  if (contract?.schemaVersion !== CONTRACT_VERSION) throw new Error('sensitive-input canonical contract required');
  const ids = contract.vectors.map(v => v.id);
  for (const required of ['masked', 'reveal-edit-escape', 'copy']) {
    if (!ids.includes(required)) throw new Error(`sensitive-input canonical vector ${required} missing`);
  }
  for (const v of contract.vectors) {
    if (v.expected?.root?.tag !== 'div') throw new Error(`sensitive-input vector ${v.id} must assert a div root`);
  }
  const value = {
    schemaVersion: SENSITIVE_INPUT_VERSION,
    component: 'sensitive-input',
    support: 'supported',
    root: {tag: 'div'},
    parts: ['masked-container', 'input', 'reveal', 'copy'],
    input: {type: 'password', holdsValue: true, defaultValueProp: 'defaultValue'},
    reveal: {trigger: 'click masked-container', focuses: 'input'},
    edit: {event: 'value:<next>', staysType: 'password'},
    copy: {writesClipboard: 'current value', announcesLiveRegion: true, event: 'copy'},
    unknowns: [
      note('inheritedVendorBehavior', 'Vendor behavior beyond the asserted masked/reveal/edit/copy observable surface is not established by the canonical contract.')
    ],
    vectorIds: ids,
    provenance: {
      component: 'sensitive-input',
      contractPath: 'contracts/kumo.observable/v1/components/sensitive-input.json',
      contractDigest: digest(contract),
      vectorIds: ids
    }
  };
  return {...value, capabilityDigest: digest(value)};
}

export function validateSensitiveInput(value) {
  if (value?.schemaVersion !== SENSITIVE_INPUT_VERSION) throw new Error('invalid sensitive-input capability');
  if (value.support !== 'supported') throw new Error('sensitive-input must prove supported behavior');
  if (value.root?.tag !== 'div') throw new Error('sensitive-input root must be div');
  if (value.input?.type !== 'password' || value.input.holdsValue !== true) throw new Error('sensitive-input input model invalid');
  if (value.reveal?.focuses !== 'input' || value.edit?.event !== 'value:<next>' || value.edit.staysType !== 'password') throw new Error('sensitive-input reveal/edit invalid');
  if (value.copy?.event !== 'copy' || value.copy.announcesLiveRegion !== true) throw new Error('sensitive-input copy invalid');
  if (!Array.isArray(value.parts) || !value.parts.includes('masked-container') || !value.parts.includes('input')) throw new Error('sensitive-input parts invalid');
  if (!Array.isArray(value.unknowns) || value.unknowns.some(x => !x.field || x.status !== 'unknown' || !x.reason)) throw new Error('sensitive-input unknowns must remain explicit');
  const {capabilityDigest, ...unsigned} = value;
  if (capabilityDigest !== digest(unsigned)) throw new Error('sensitive-input capability digest mismatch');
  return value;
}

export function loadSensitiveInput(file = path.join(here, 'capabilities/sensitive-input.json')) {
  return validateSensitiveInput(JSON.parse(fs.readFileSync(file, 'utf8')));
}
