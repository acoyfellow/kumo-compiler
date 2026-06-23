import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {digest} from './index.mjs';

export const TABS_NAVIGATION_VERSION = 'kumo.tabs-navigation/v1';
const here = path.dirname(fileURLToPath(import.meta.url));
const CONTRACT_VERSION = 'kumo.observable/v1';
export const TABS_NAVIGATION_COMPONENTS = ['tabs'];
const note = (field, reason) => ({field, status: 'unknown', reason});

// Derives the supported, observable tabs navigation behavior asserted by the canonical vectors:
// a div root containing role=tab buttons with aria-selected; ArrowRight moves the roving focus to
// the next tab; in MANUAL activation (default) the value commits only on Enter/Space on the focused
// tab, while in AUTOMATIC activation (activateOnFocus) the value commits as focus moves. Selection
// emits value:<v> and focus settles on the selected tab. Exact variant/size class styling and full
// Home/End/wraparound semantics beyond the asserted next-move are explicit unknowns.
export function deriveTabsNavigation(contracts) {
  const byName = new Map(contracts.map(contract => [contract.component, contract]));
  const contract = byName.get('tabs');
  if (contract?.schemaVersion !== CONTRACT_VERSION) throw new Error('tabs canonical contract required');
  const ids = contract.vectors.map(v => v.id);
  for (const required of ['segmented-uncontrolled-first', 'underline-selected-value', 'manual-arrow-then-enter', 'automatic-arrow']) {
    if (!ids.includes(required)) throw new Error(`tabs canonical vector ${required} missing`);
  }
  const value = {
    schemaVersion: TABS_NAVIGATION_VERSION,
    component: 'tabs',
    support: 'supported',
    root: {tag: 'div'},
    tab: {role: 'tab', selectedAttribute: 'aria-selected'},
    activation: {
      manual: {default: true, move: 'ArrowRight focuses next tab without committing', commit: 'Enter or Space on focused tab commits value'},
      automatic: {prop: 'activateOnFocus', move: 'ArrowRight focuses and commits the next tab'}
    },
    selection: {controlledProp: 'selectedValue', event: 'value:<value>', focus: 'selected tab'},
    unknowns: [
      note('variantSizeStyling', 'Canonical vectors assert tab roles, counts, selection and activation, not the exact variant/size class lists.'),
      note('homeEndWraparound', 'Canonical vectors assert ArrowRight next-move and Enter commit; Home/End and full wraparound semantics are not asserted.')
    ],
    vectorIds: ids,
    provenance: {
      component: 'tabs',
      contractPath: 'contracts/kumo.observable/v1/components/tabs.json',
      contractDigest: digest(contract),
      vectorIds: ids
    }
  };
  return {...value, capabilityDigest: digest(value)};
}

export function validateTabsNavigation(value) {
  if (value?.schemaVersion !== TABS_NAVIGATION_VERSION) throw new Error('invalid tabs-navigation capability');
  if (value.support !== 'supported') throw new Error('tabs-navigation must prove supported navigation behavior');
  if (value.root?.tag !== 'div') throw new Error('tabs-navigation root must be div');
  if (value.tab?.role !== 'tab' || value.tab.selectedAttribute !== 'aria-selected') throw new Error('tabs-navigation tab role/selection invalid');
  if (!value.activation?.manual?.default || value.activation.automatic?.prop !== 'activateOnFocus') throw new Error('tabs-navigation activation modes invalid');
  if (value.selection?.controlledProp !== 'selectedValue' || value.selection.event !== 'value:<value>' || value.selection.focus !== 'selected tab') throw new Error('tabs-navigation selection semantics invalid');
  if (!Array.isArray(value.unknowns) || value.unknowns.some(x => !x.field || x.status !== 'unknown' || !x.reason)) throw new Error('tabs-navigation unknowns must remain explicit');
  const {capabilityDigest, ...unsigned} = value;
  if (capabilityDigest !== digest(unsigned)) throw new Error('tabs-navigation capability digest mismatch');
  return value;
}

export function loadTabsNavigation(file = path.join(here, 'capabilities/tabs-navigation.json')) {
  return validateTabsNavigation(JSON.parse(fs.readFileSync(file, 'utf8')));
}
