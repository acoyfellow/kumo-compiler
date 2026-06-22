import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {digest} from './index.mjs';
import {maxPage, clampPage, nextPage, previousPage, commitPageInput} from './pagination-state.mjs';

export const PAGINATION_CONTROLS_VERSION = 'kumo.pagination-controls/v1';
const here = path.dirname(fileURLToPath(import.meta.url));
const CONTRACT_VERSION = 'kumo.observable/v1';
export const PAGINATION_CONTROLS_COMPONENTS = ['pagination'];
const note = (field, reason) => ({field, status: 'unknown', reason});

// Derives the supported, observable Pagination controls behavior asserted by the canonical
// vectors: a div[data-slot=pagination] root containing a nav[aria-label] with first/previous/
// next/last buttons and a page-number input; controlled page proposals with inclusive clamping;
// Enter/blur input commit with parse+clamp; boundary disabling. The exact page-size dropdown
// popup presentation and invalid-input user feedback remain explicit unknowns.
export function derivePaginationControls(contracts) {
  const byName = new Map(contracts.map(contract => [contract.component, contract]));
  const contract = byName.get('pagination');
  if (contract?.schemaVersion !== CONTRACT_VERSION) throw new Error('pagination canonical contract required');
  const ids = contract.vectors.map(v => v.id);
  for (const required of ['legacy-page-one', 'next-controlled', 'boundaries', 'input-enter-clamp', 'input-blur-clamp']) {
    if (!ids.includes(required)) throw new Error(`pagination canonical vector ${required} missing`);
  }
  // Bind the proven state algebra so the capability digest changes if algebra changes.
  const maximum = maxPage(35, 10); // canonical legacy fixture: totalCount 35, perPage 10 => maxPage 4
  const algebra = {
    maxPage: maximum,
    clampAbove: clampPage(99, maximum),
    clampBelow: clampPage(1, maximum),
    next: nextPage(2, maximum).proposal,
    previous: previousPage(2, maximum).proposal,
    enterClamp: commitPageInput(2, '99', maximum, {trigger: 'Enter'}).proposal,
    blurClamp: commitPageInput(2, '0', maximum, {trigger: 'blur'}).proposal
  };
  if (algebra.maxPage !== 4 || algebra.clampAbove !== 4 || algebra.clampBelow !== 1 || algebra.next !== 3 || algebra.enterClamp !== 4 || algebra.blurClamp !== 1) {
    throw new Error('pagination state algebra diverged from canonical clamping');
  }
  const value = {
    schemaVersion: PAGINATION_CONTROLS_VERSION,
    component: 'pagination',
    support: 'supported',
    root: {tag: 'div', attributes: {'data-slot': 'pagination'}},
    legacy: {
      nav: {tag: 'nav', ariaLabel: 'Pagination'},
      buttons: ['first', 'previous', 'next', 'last'],
      pageInput: {ariaLabel: 'Page number', valueProp: 'page'}
    },
    behavior: {
      ownership: 'controlled proposes, uncontrolled commits',
      navigationClamp: 'inclusive [1, maxPage]',
      boundaries: 'first/previous disabled at page 1; next/last disabled at maxPage',
      pageEvent: 'page:<n> on accepted change',
      input: {commitTriggers: ['Enter', 'blur'], parse: 'trimmed unsigned base-10', clamp: 'inclusive [1, maxPage]', invalid: 'restore current without proposal'}
    },
    stateAlgebra: algebra,
    // The exact page-size dropdown popup presentation and invalid-input feedback are not asserted.
    unknowns: [
      note('pageSizeDropdownPresentation', 'Canonical vectors assert button counts, not the page-size dropdown popup platform presentation, listbox semantics, or open/close behavior.'),
      note('invalidPageInputFeedback', 'Canonical vectors restore the current page on invalid input but do not establish validation UI or announcements.')
    ],
    vectorIds: ids,
    provenance: {
      component: 'pagination',
      contractPath: 'contracts/kumo.observable/v1/components/pagination.json',
      contractDigest: digest(contract),
      vectorIds: ids
    }
  };
  return {...value, capabilityDigest: digest(value)};
}

export function validatePaginationControls(value) {
  if (value?.schemaVersion !== PAGINATION_CONTROLS_VERSION) throw new Error('invalid pagination-controls capability');
  if (value.support !== 'supported') throw new Error('pagination-controls must prove supported behavior');
  if (value.root?.tag !== 'div' || value.root.attributes?.['data-slot'] !== 'pagination') throw new Error('pagination-controls root must be div[data-slot=pagination]');
  if (value.legacy?.nav?.ariaLabel !== 'Pagination' || value.legacy.buttons.join(',') !== 'first,previous,next,last' || value.legacy.pageInput?.ariaLabel !== 'Page number') throw new Error('pagination-controls legacy structure invalid');
  const a = value.stateAlgebra;
  if (!a || a.maxPage !== 4 || a.clampAbove !== 4 || a.clampBelow !== 1 || a.next !== 3 || a.enterClamp !== 4 || a.blurClamp !== 1) throw new Error('pagination-controls state algebra must bind canonical clamping');
  if (value.behavior?.pageEvent !== 'page:<n> on accepted change') throw new Error('pagination-controls page event invalid');
  if (!Array.isArray(value.unknowns) || value.unknowns.some(x => !x.field || x.status !== 'unknown' || !x.reason)) throw new Error('pagination-controls unknowns must remain explicit');
  const {capabilityDigest, ...unsigned} = value;
  if (capabilityDigest !== digest(unsigned)) throw new Error('pagination-controls capability digest mismatch');
  return value;
}

export function loadPaginationControls(file = path.join(here, 'capabilities/pagination-controls.json')) {
  return validatePaginationControls(JSON.parse(fs.readFileSync(file, 'utf8')));
}
