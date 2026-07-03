import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {digest} from './index.mjs';

export const RADIO_GROUP_VERSION = 'kumo.radio-group/v1';
const here = path.dirname(fileURLToPath(import.meta.url));
const CONTRACT_VERSION = 'kumo.observable/v1';
export const RADIO_GROUP_COMPONENTS = ['radio'];
const note = (field, reason) => ({field, status: 'unknown', reason});

// Derives the supported, observable radio-group behavior asserted by the canonical vectors:
// a div[role=radiogroup] of single-select items; trusted click or ArrowDown on an enabled item
// selects it and emits value:<v>; a disabled item or disabled group blocks selection and emits
// nothing; selection focus settles on the group root. Canonical live-DOM verification additionally
// pins the label/control structure, hidden native input, legend linkage, and selected-item roving
// tabindex. Full arrow wraparound semantics beyond the asserted next-selection remain unknown.
export function deriveRadioGroup(contracts) {
  const byName = new Map(contracts.map(contract => [contract.component, contract]));
  const contract = byName.get('radio');
  if (contract?.schemaVersion !== CONTRACT_VERSION) throw new Error('radio canonical contract required');
  const ids = contract.vectors.map(v => v.id);
  for (const required of ['default-click', 'controlled-click', 'arrow', 'disabled-item', 'disabled-group']) {
    if (!ids.includes(required)) throw new Error(`radio canonical vector ${required} missing`);
  }
  const value = {
    schemaVersion: RADIO_GROUP_VERSION,
    component: 'radio',
    support: 'supported',
    root: {tag: 'div', attributes: {role: 'radiogroup'}},
    selection: {
      mode: 'single',
      controlledProp: 'value',
      uncontrolledProp: 'defaultValue',
      triggers: [{type: 'click', selects: 'target item'}, {type: 'key', key: 'ArrowDown', selects: 'next enabled item'}],
      event: 'value:<value>',
      focus: 'root'
    },
    disabled: {item: 'disabled item blocks selection, emits nothing, focus none', group: 'disabled group blocks all selection, emits nothing, focus none'},
    structure: {
      group: 'div[role=radiogroup] > fieldset[aria-labelledby=legend-id]',
      legend: 'div[id].text-base.font-medium.text-kumo-default',
      item: 'label[id] > span[role=radio][id][aria-labelledby=label-id] + input[type=radio][aria-hidden=true] + span',
      stateAttributes: ['data-checked', 'data-unchecked'],
      tabindex: 'selected enabled item 0; every other item -1',
      nativeInput: 'visually hidden; value mirrors item; checked mirrors selection'
    },
    unknowns: [
      note('keyboardWraparound', 'Canonical vectors assert ArrowDown selecting the next item, not Home/End or full wraparound semantics.')
    ],
    vectorIds: ids,
    provenance: {
      component: 'radio',
      contractPath: 'contracts/kumo.observable/v1/components/radio.json',
      contractDigest: digest(contract),
      vectorIds: ids
    }
  };
  return {...value, capabilityDigest: digest(value)};
}

export function validateRadioGroup(value) {
  if (value?.schemaVersion !== RADIO_GROUP_VERSION) throw new Error('invalid radio-group capability');
  if (value.support !== 'supported') throw new Error('radio-group must prove supported selection behavior');
  if (value.root?.tag !== 'div' || value.root.attributes?.role !== 'radiogroup') throw new Error('radio-group root must be div[role=radiogroup]');
  if (value.selection?.mode !== 'single' || value.selection.controlledProp !== 'value' || value.selection.event !== 'value:<value>' || value.selection.focus !== 'root') throw new Error('radio-group selection semantics invalid');
  if (!Array.isArray(value.selection.triggers) || value.selection.triggers.length !== 2) throw new Error('radio-group requires click and ArrowDown triggers');
  if (!value.disabled?.item || !value.disabled.group) throw new Error('radio-group disabled item/group semantics required');
  if (!value.structure?.group || !value.structure?.item || value.structure.tabindex !== 'selected enabled item 0; every other item -1' || !value.structure.nativeInput) throw new Error('radio-group accessible structure required');
  if (!Array.isArray(value.structure.stateAttributes) || value.structure.stateAttributes.join(',') !== 'data-checked,data-unchecked') throw new Error('radio-group state attributes invalid');
  if (!Array.isArray(value.unknowns) || value.unknowns.some(x => !x.field || x.status !== 'unknown' || !x.reason)) throw new Error('radio-group unknowns must remain explicit');
  const {capabilityDigest, ...unsigned} = value;
  if (capabilityDigest !== digest(unsigned)) throw new Error('radio-group capability digest mismatch');
  return value;
}

export function loadRadioGroup(file = path.join(here, 'capabilities/radio-group.json')) {
  return validateRadioGroup(JSON.parse(fs.readFileSync(file, 'utf8')));
}
