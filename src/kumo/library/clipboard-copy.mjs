import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {digest} from './index.mjs';

export const CLIPBOARD_COPY_VERSION = 'kumo.clipboard-copy/v1';
const here = path.dirname(fileURLToPath(import.meta.url));
const CONTRACT_VERSION = 'kumo.observable/v1';
export const CLIPBOARD_COPY_COMPONENTS = ['clipboard-text'];
const note = (field, reason) => ({field, status: 'unknown', reason});

function provenance(contract) {
  return {
    component: contract.component,
    contractPath: `contracts/kumo.observable/v1/components/${contract.component}.json`,
    contractDigest: digest(contract),
    vectorIds: contract.vectors.map(vector => vector.id)
  };
}

// Derives the observable copy behavior that the canonical clipboard-text vectors assert:
// a div root with a copy button; trusted activation (click or Enter) writes the copy text
// to navigator.clipboard, fires the copy callback, and announces a success message; focus
// stays on the button. Exact live-region aria/DOM placement and failure handling are not
// asserted by canonical vectors and remain explicit unknowns (mirrored from clipboard-live-region).
export function deriveClipboardCopy(contracts) {
  const byName = new Map(contracts.map(contract => [contract.component, contract]));
  const contract = byName.get('clipboard-text');
  if (contract?.schemaVersion !== CONTRACT_VERSION) throw new Error('clipboard-text canonical contract required');
  const click = contract.vectors.find(v => v.id === 'click-copy');
  const keyboard = contract.vectors.find(v => v.id === 'keyboard');
  if (!click || !keyboard) throw new Error('clipboard-text click-copy and keyboard vectors required');
  const successMessage = click.expected.state.live[0];
  const copyEvent = click.expected.events[0];
  if (successMessage !== 'Copied' || copyEvent !== 'copy') throw new Error('clipboard-text canonical copy semantics changed');
  const value = {
    schemaVersion: CLIPBOARD_COPY_VERSION,
    component: 'clipboard-text',
    support: 'supported',
    root: 'div',
    copySource: {prop: 'textToCopy', fallback: 'text'},
    activations: [
      {trigger: {type: 'click', selector: 'button'}, vector: 'click-copy'},
      {trigger: {type: 'key', selector: 'button', key: 'Enter'}, vector: 'keyboard'}
    ],
    behavior: {
      writesClipboard: true,
      clipboardWriteValue: 'resolved copy text (textToCopy, else text)',
      firesCopyCallback: copyEvent,
      announcesSuccess: successMessage,
      retainsButtonFocus: true
    },
    // The exact live-region role/aria/DOM and failure handling are not asserted by canonical vectors.
    unknowns: [
      note('liveRegionAriaAndDom', 'Canonical vectors assert the announced text "Copied", not the live-region element, role, aria-live, aria-atomic, or DOM placement.'),
      note('failureCallbackAndAnnouncement', 'Canonical vectors specify only successful copy; failure callback and failure announcement behavior are not established.'),
      note('announcementTimingAndClearing', 'Insertion delay, retention, clearing, and repeated-copy behavior are not established by canonical vectors.'),
      note('buttonAccessibleName', 'Canonical vectors assert button activation and focus, not the button accessible name, type, or descendants.')
    ],
    vectorIds: contract.vectors.map(v => v.id),
    provenance: CLIPBOARD_COPY_COMPONENTS.map(name => provenance(byName.get(name)))
  };
  return {...value, capabilityDigest: digest(value)};
}

export function validateClipboardCopy(value) {
  if (value?.schemaVersion !== CLIPBOARD_COPY_VERSION) throw new Error('invalid clipboard-copy capability');
  if (value.support !== 'supported') throw new Error('clipboard-copy must prove supported copy behavior');
  if (value.root !== 'div') throw new Error('clipboard-copy root must be div');
  if (value.copySource?.prop !== 'textToCopy' || value.copySource.fallback !== 'text') throw new Error('clipboard-copy copy source must be textToCopy with text fallback');
  if (!Array.isArray(value.activations) || value.activations.length !== 2) throw new Error('clipboard-copy requires click and keyboard activations');
  for (const activation of value.activations) {
    if (!activation.trigger?.type || activation.trigger.selector !== 'button' || !activation.vector) throw new Error('clipboard-copy activation must target the button with a vector');
  }
  if (value.behavior?.writesClipboard !== true || value.behavior.firesCopyCallback !== 'copy' || value.behavior.announcesSuccess !== 'Copied' || value.behavior.retainsButtonFocus !== true) throw new Error('clipboard-copy behavior must assert write+copy+announce+focus');
  if (!Array.isArray(value.unknowns) || value.unknowns.some(x => !x.field || x.status !== 'unknown' || !x.reason)) throw new Error('clipboard-copy unknowns must remain explicit');
  const {capabilityDigest, ...unsigned} = value;
  if (capabilityDigest !== digest(unsigned)) throw new Error('clipboard-copy capability digest mismatch');
  return value;
}

export function loadClipboardCopy(file = path.join(here, 'capabilities/clipboard-copy.json')) {
  return validateClipboardCopy(JSON.parse(fs.readFileSync(file, 'utf8')));
}
