import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {digest} from './index.mjs';

export const COMBOBOX_COLLECTION_VERSION = 'kumo.combobox-collection/v1';
const here = path.dirname(fileURLToPath(import.meta.url));
const CONTRACT_VERSION = 'kumo.observable/v1';
export const COMBOBOX_COLLECTION_COMPONENTS = ['combobox'];
const note = (field, reason) => ({field, status: 'unknown', reason});

// Derives the supported, observable combobox single-select behavior asserted by the canonical
// vector: an input trigger root composing a content list of items, where clicking the input
// opens the list (open:true), ArrowDown highlights the first option, and Enter selects it
// (value:<item>) and closes the list (open:false), keeping focus on the input. Generated ids
// and multiple-chip DOM remain explicit unknowns.
export function deriveComboboxCollection(contracts) {
  const byName = new Map(contracts.map(contract => [contract.component, contract]));
  const contract = byName.get('combobox');
  if (contract?.schemaVersion !== CONTRACT_VERSION) throw new Error('combobox canonical contract required');
  const ids = contract.vectors.map(v => v.id);
  if (!ids.includes('single-select')) throw new Error('combobox canonical vector single-select missing');
  const vec = contract.vectors.find(v => v.id === 'single-select');
  if (vec.expected?.root?.tag !== 'input') throw new Error('combobox root must be the trigger input');
  const value = {
    schemaVersion: COMBOBOX_COLLECTION_VERSION,
    component: 'combobox',
    support: 'supported',
    root: {tag: 'input'},
    api: {compound: ['.TriggerInput', '.Content', '.List', '.Item']},
    open: {trigger: 'click input', event: 'open:<bool>'},
    navigate: {key: 'ArrowDown', model: 'highlight first then next option'},
    select: {key: 'Enter', event: 'value:<item>', closesList: true},
    focus: {retains: 'input'},
    events: ['open:true', 'value:<item>', 'open:false'],
    unknowns: [
      note('generatedIds', 'Option/list association ids are generated and are not stable contract surface.'),
      note('multipleChipDom', 'Multi-select chip DOM is not asserted by the canonical single-select vector.')
    ],
    vectorIds: ids,
    provenance: {
      component: 'combobox',
      contractPath: 'contracts/kumo.observable/v1/components/combobox.json',
      contractDigest: digest(contract),
      vectorIds: ids
    }
  };
  return {...value, capabilityDigest: digest(value)};
}

export function validateComboboxCollection(value) {
  if (value?.schemaVersion !== COMBOBOX_COLLECTION_VERSION) throw new Error('invalid combobox-collection capability');
  if (value.support !== 'supported') throw new Error('combobox-collection must prove supported behavior');
  if (value.root?.tag !== 'input') throw new Error('combobox-collection root must be input');
  if (value.open?.event !== 'open:<bool>' || value.select?.event !== 'value:<item>' || value.select.closesList !== true) throw new Error('combobox-collection open/select invalid');
  if (value.navigate?.key !== 'ArrowDown' || value.focus?.retains !== 'input') throw new Error('combobox-collection navigate/focus invalid');
  if (!Array.isArray(value.api?.compound) || !value.api.compound.includes('.Item')) throw new Error('combobox-collection compound api invalid');
  if (!Array.isArray(value.unknowns) || value.unknowns.some(x => !x.field || x.status !== 'unknown' || !x.reason)) throw new Error('combobox-collection unknowns must remain explicit');
  const {capabilityDigest, ...unsigned} = value;
  if (capabilityDigest !== digest(unsigned)) throw new Error('combobox-collection capability digest mismatch');
  return value;
}

export function loadComboboxCollection(file = path.join(here, 'capabilities/combobox-collection.json')) {
  return validateComboboxCollection(JSON.parse(fs.readFileSync(file, 'utf8')));
}
