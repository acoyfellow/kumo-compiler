import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {digest} from './index.mjs';

export const AUTOCOMPLETE_COLLECTION_VERSION = 'kumo.autocomplete-collection/v1';
const here = path.dirname(fileURLToPath(import.meta.url));
const CONTRACT_VERSION = 'kumo.observable/v1';
export const AUTOCOMPLETE_COLLECTION_COMPONENTS = ['autocomplete'];
const note = (field, reason) => ({field, status: 'unknown', reason});

// Derives the supported, observable autocomplete filter-and-select behavior asserted by the
// canonical vector: an input root composing a content list; typing emits value:<input> per
// keystroke and opens the list (open:true) on the first character; ArrowDown highlights the
// first option; Enter commits the highlighted option (value:<item>) and closes (open:false);
// focus stays on the input. Portal container, SSR popup presence, and the default filtering
// algorithm remain explicit unknowns (the contract does not assert them).
export function deriveAutocompleteCollection(contracts) {
  const byName = new Map(contracts.map(contract => [contract.component, contract]));
  const contract = byName.get('autocomplete');
  if (contract?.schemaVersion !== CONTRACT_VERSION) throw new Error('autocomplete canonical contract required');
  const ids = contract.vectors.map(v => v.id);
  if (!ids.includes('filter-and-select')) throw new Error('autocomplete canonical vector filter-and-select missing');
  const vec = contract.vectors.find(v => v.id === 'filter-and-select');
  if (vec.expected?.root?.tag !== 'input') throw new Error('autocomplete root must be the trigger input');
  const value = {
    schemaVersion: AUTOCOMPLETE_COLLECTION_VERSION,
    component: 'autocomplete',
    support: 'supported',
    root: {tag: 'input'},
    api: {compound: ['.InputGroup', '.Content', '.List', '.Item']},
    type: {event: 'value:<input>', opensOnFirstChar: true},
    navigate: {key: 'ArrowDown', model: 'highlight first then next option'},
    select: {key: 'Enter', event: 'value:<item>', closesList: true},
    focus: {retains: 'input'},
    unknowns: [
      note('portal.container', 'Portal container target is not asserted by the canonical contract.'),
      note('ssr.popup', 'Whether the popup is present in SSR is not asserted by the canonical contract.'),
      note('defaultFiltering', 'The default filtering algorithm is not asserted by the canonical contract.')
    ],
    vectorIds: ids,
    provenance: {
      component: 'autocomplete',
      contractPath: 'contracts/kumo.observable/v1/components/autocomplete.json',
      contractDigest: digest(contract),
      vectorIds: ids
    }
  };
  return {...value, capabilityDigest: digest(value)};
}

export function validateAutocompleteCollection(value) {
  if (value?.schemaVersion !== AUTOCOMPLETE_COLLECTION_VERSION) throw new Error('invalid autocomplete-collection capability');
  if (value.support !== 'supported') throw new Error('autocomplete-collection must prove supported behavior');
  if (value.root?.tag !== 'input') throw new Error('autocomplete-collection root must be input');
  if (value.type?.event !== 'value:<input>' || value.type.opensOnFirstChar !== true) throw new Error('autocomplete-collection type model invalid');
  if (value.select?.event !== 'value:<item>' || value.select.closesList !== true || value.navigate?.key !== 'ArrowDown') throw new Error('autocomplete-collection select/navigate invalid');
  if (value.focus?.retains !== 'input' || !Array.isArray(value.api?.compound) || !value.api.compound.includes('.Item')) throw new Error('autocomplete-collection focus/api invalid');
  if (!Array.isArray(value.unknowns) || value.unknowns.some(x => !x.field || x.status !== 'unknown' || !x.reason)) throw new Error('autocomplete-collection unknowns must remain explicit');
  const {capabilityDigest, ...unsigned} = value;
  if (capabilityDigest !== digest(unsigned)) throw new Error('autocomplete-collection capability digest mismatch');
  return value;
}

export function loadAutocompleteCollection(file = path.join(here, 'capabilities/autocomplete-collection.json')) {
  return validateAutocompleteCollection(JSON.parse(fs.readFileSync(file, 'utf8')));
}
