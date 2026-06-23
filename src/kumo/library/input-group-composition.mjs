import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {digest} from './index.mjs';

export const INPUT_GROUP_COMPOSITION_VERSION = 'kumo.input-group-composition/v1';
const here = path.dirname(fileURLToPath(import.meta.url));
const CONTRACT_VERSION = 'kumo.observable/v1';
export const INPUT_GROUP_COMPOSITION_COMPONENTS = ['input-group'];
const note = (field, reason) => ({field, status: 'unknown', reason});

// Derives the supported, observable input-group composition asserted by the canonical vectors:
// a div root composing label, description, and the Addon/Input/Button/Suffix slots, where the
// label is associated with the grouped input so a label click focuses it, typed input values
// are observable, and focus targets are addressable. Inherited vendor behavior beyond the
// asserted composition remains an explicit unknown.
export function deriveInputGroupComposition(contracts) {
  const byName = new Map(contracts.map(contract => [contract.component, contract]));
  const contract = byName.get('input-group');
  if (contract?.schemaVersion !== CONTRACT_VERSION) throw new Error('input-group canonical contract required');
  const ids = contract.vectors.map(v => v.id);
  for (const required of ['composition', 'field-focus', 'disabled-error']) {
    if (!ids.includes(required)) throw new Error(`input-group canonical vector ${required} missing`);
  }
  for (const v of contract.vectors) {
    if (v.expected?.root?.tag !== 'div') throw new Error(`input-group vector ${v.id} must assert a div root`);
  }
  const value = {
    schemaVersion: INPUT_GROUP_COMPOSITION_VERSION,
    component: 'input-group',
    support: 'supported',
    root: {tag: 'div'},
    slots: ['.Addon', '.Input', '.Button', '.Suffix'],
    label: {association: 'label for grouped input', click: 'focuses the grouped input'},
    state: {values: 'observable input values', tracked: 'input value'},
    focus: {targets: ['input', 'button']},
    unknowns: [
      note('inheritedVendorBehavior', 'Vendor behavior beyond the asserted composition, label association, value tracking, and focus targets is not established by the canonical contract.')
    ],
    vectorIds: ids,
    provenance: {
      component: 'input-group',
      contractPath: 'contracts/kumo.observable/v1/components/input-group.json',
      contractDigest: digest(contract),
      vectorIds: ids
    }
  };
  return {...value, capabilityDigest: digest(value)};
}

export function validateInputGroupComposition(value) {
  if (value?.schemaVersion !== INPUT_GROUP_COMPOSITION_VERSION) throw new Error('invalid input-group-composition capability');
  if (value.support !== 'supported') throw new Error('input-group-composition must prove supported behavior');
  if (value.root?.tag !== 'div') throw new Error('input-group-composition root must be div');
  if (!Array.isArray(value.slots) || !value.slots.includes('.Input')) throw new Error('input-group-composition slots invalid');
  if (value.label?.click !== 'focuses the grouped input') throw new Error('input-group-composition label association invalid');
  if (!Array.isArray(value.focus?.targets) || !value.focus.targets.includes('input')) throw new Error('input-group-composition focus targets invalid');
  if (!Array.isArray(value.unknowns) || value.unknowns.some(x => !x.field || x.status !== 'unknown' || !x.reason)) throw new Error('input-group-composition unknowns must remain explicit');
  const {capabilityDigest, ...unsigned} = value;
  if (capabilityDigest !== digest(unsigned)) throw new Error('input-group-composition capability digest mismatch');
  return value;
}

export function loadInputGroupComposition(file = path.join(here, 'capabilities/input-group-composition.json')) {
  return validateInputGroupComposition(JSON.parse(fs.readFileSync(file, 'utf8')));
}
