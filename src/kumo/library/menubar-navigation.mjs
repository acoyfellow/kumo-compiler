import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {digest} from './index.mjs';

export const MENUBAR_NAVIGATION_VERSION = 'kumo.menubar-navigation/v1';
const here = path.dirname(fileURLToPath(import.meta.url));
const CONTRACT_VERSION = 'kumo.observable/v1';
export const MENUBAR_NAVIGATION_COMPONENTS = ['menu-bar'];
const note = (field, reason) => ({field, status: 'unknown', reason});

// Derives the supported, observable menu-bar navigation behavior asserted by the canonical
// vectors: a nav root carrying the canonical class set, a button per option (icon + tooltip),
// all buttons natively tabbable with no aria selection state, an active option addressed by
// index or id, ArrowLeft/ArrowRight roving focus, and a click:<index> event on activation.
// Exact icon glyph rendering and tooltip presentation remain explicit unknowns.
export function deriveMenubarNavigation(contracts) {
  const byName = new Map(contracts.map(contract => [contract.component, contract]));
  const contract = byName.get('menu-bar');
  if (contract?.schemaVersion !== CONTRACT_VERSION) throw new Error('menu-bar canonical contract required');
  const ids = contract.vectors.map(v => v.id);
  for (const required of ['empty-nav-ssr', 'buttons-active-index', 'active-by-id']) {
    if (!ids.includes(required)) throw new Error(`menu-bar canonical vector ${required} missing`);
  }
  // The canonical root classes are part of the observable contract (subset assertion), so
  // they are derived from the contract — not hand-authored lookalikes.
  const empty = contract.vectors.find(v => v.id === 'empty-nav-ssr');
  const rootClasses = empty.expected.root.classes.includes;
  if (!Array.isArray(rootClasses) || !rootClasses.length) throw new Error('menu-bar canonical root classes missing');
  const value = {
    schemaVersion: MENUBAR_NAVIGATION_VERSION,
    component: 'menu-bar',
    support: 'supported',
    root: {tag: 'nav', classes: rootClasses},
    options: {prop: 'options', addressing: {index: 'isActive number', id: 'isActive string with optionIds'}, button: {tabbable: 'native', ariaSelection: 'absent'}},
    navigation: {keys: ['ArrowLeft', 'ArrowRight'], model: 'roving focus across option buttons'},
    activation: {event: 'click:<index>', trigger: 'click on option button'},
    unknowns: [
      note('iconGlyphRendering', 'Canonical vectors assert option buttons and tooltips, not the exact icon glyph markup.'),
      note('tooltipPresentation', 'Canonical vectors carry option tooltips, but the exact tooltip element, trigger, and timing are not asserted.')
    ],
    vectorIds: ids,
    provenance: {
      component: 'menu-bar',
      contractPath: 'contracts/kumo.observable/v1/components/menu-bar.json',
      contractDigest: digest(contract),
      vectorIds: ids
    }
  };
  return {...value, capabilityDigest: digest(value)};
}

export function validateMenubarNavigation(value) {
  if (value?.schemaVersion !== MENUBAR_NAVIGATION_VERSION) throw new Error('invalid menubar-navigation capability');
  if (value.support !== 'supported') throw new Error('menubar-navigation must prove supported behavior');
  if (value.root?.tag !== 'nav' || !Array.isArray(value.root.classes) || !value.root.classes.length) throw new Error('menubar-navigation root must be nav with canonical classes');
  if (value.options?.prop !== 'options' || value.options.button?.tabbable !== 'native' || value.options.button.ariaSelection !== 'absent') throw new Error('menubar-navigation option model invalid');
  if (!Array.isArray(value.navigation?.keys) || value.activation?.event !== 'click:<index>') throw new Error('menubar-navigation navigation/activation invalid');
  if (!Array.isArray(value.unknowns) || value.unknowns.some(x => !x.field || x.status !== 'unknown' || !x.reason)) throw new Error('menubar-navigation unknowns must remain explicit');
  const {capabilityDigest, ...unsigned} = value;
  if (capabilityDigest !== digest(unsigned)) throw new Error('menubar-navigation capability digest mismatch');
  return value;
}

export function loadMenubarNavigation(file = path.join(here, 'capabilities/menubar-navigation.json')) {
  return validateMenubarNavigation(JSON.parse(fs.readFileSync(file, 'utf8')));
}
