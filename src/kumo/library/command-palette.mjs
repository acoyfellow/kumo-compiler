import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {digest} from './index.mjs';

export const COMMAND_PALETTE_VERSION = 'kumo.command-palette/v1';
const here = path.dirname(fileURLToPath(import.meta.url));
const CONTRACT_VERSION = 'kumo.observable/v1';
export const COMMAND_PALETTE_COMPONENTS = ['command-palette'];
const note = (field, reason) => ({field, status: 'unknown', reason});

// Derives the supported, observable command-palette behavior asserted by the canonical vectors:
// (1) HighlightedText renders a span with mark elements for the supplied ranges; (2) an open
// palette renders a div root with input and item list, highlights the first item on open, emits
// value:<input> per edit, ArrowDown advances the highlight, and Escape emits open:false and
// closes with no focused palette element. Closed-root placeholder, plain-Enter selection, and
// SSR open-portal behavior remain explicit unknowns.
export function deriveCommandPalette(contracts) {
  const byName = new Map(contracts.map(contract => [contract.component, contract]));
  const contract = byName.get('command-palette');
  if (contract?.schemaVersion !== CONTRACT_VERSION) throw new Error('command-palette canonical contract required');
  const ids = contract.vectors.map(v => v.id);
  for (const required of ['highlighted-text', 'open-search-close']) {
    if (!ids.includes(required)) throw new Error(`command-palette canonical vector ${required} missing`);
  }
  const highlighted = contract.vectors.find(v => v.id === 'highlighted-text');
  const open = contract.vectors.find(v => v.id === 'open-search-close');
  if (highlighted.expected?.root?.tag !== 'span' || open.expected?.root?.tag !== 'div') throw new Error('command-palette canonical roots invalid');
  const value = {
    schemaVersion: COMMAND_PALETTE_VERSION,
    component: 'command-palette',
    support: 'supported',
    api: {compound: ['.Root', '.Input', '.List', '.Item', '.HighlightedText']},
    highlightedText: {root: 'span', rangeTag: 'mark', ranges: 'half-open [start,end]'},
    palette: {
      root: 'div',
      open: {initialHighlight: 'first item', event: 'highlight:<item>'},
      input: {event: 'value:<input>'},
      navigate: {key: 'ArrowDown', event: 'highlight:<item>'},
      dismiss: {key: 'Escape', event: 'open:false', focus: 'none'}
    },
    unknowns: [
      note('closedRootPlaceholder', 'Closed root placeholder DOM is not asserted by the canonical contract.'),
      note('selectionOnPlainEnter', 'Plain-Enter selection semantics are not asserted by the canonical vectors.'),
      note('ssrOpenPortal', 'SSR open-portal behavior is not asserted by the canonical contract.')
    ],
    vectorIds: ids,
    provenance: {
      component: 'command-palette',
      contractPath: 'contracts/kumo.observable/v1/components/command-palette.json',
      contractDigest: digest(contract),
      vectorIds: ids
    }
  };
  return {...value, capabilityDigest: digest(value)};
}

export function validateCommandPalette(value) {
  if (value?.schemaVersion !== COMMAND_PALETTE_VERSION) throw new Error('invalid command-palette capability');
  if (value.support !== 'supported') throw new Error('command-palette must prove supported behavior');
  if (value.highlightedText?.root !== 'span' || value.highlightedText.rangeTag !== 'mark') throw new Error('command-palette highlighted-text invalid');
  if (value.palette?.root !== 'div' || value.palette.open?.event !== 'highlight:<item>') throw new Error('command-palette palette/open invalid');
  if (value.palette.input?.event !== 'value:<input>' || value.palette.navigate?.key !== 'ArrowDown') throw new Error('command-palette input/navigation invalid');
  if (value.palette.dismiss?.key !== 'Escape' || value.palette.dismiss.event !== 'open:false' || value.palette.dismiss.focus !== 'none') throw new Error('command-palette dismissal invalid');
  if (!Array.isArray(value.unknowns) || value.unknowns.some(x => !x.field || x.status !== 'unknown' || !x.reason)) throw new Error('command-palette unknowns must remain explicit');
  const {capabilityDigest, ...unsigned} = value;
  if (capabilityDigest !== digest(unsigned)) throw new Error('command-palette capability digest mismatch');
  return value;
}

export function loadCommandPalette(file = path.join(here, 'capabilities/command-palette.json')) {
  return validateCommandPalette(JSON.parse(fs.readFileSync(file, 'utf8')));
}
