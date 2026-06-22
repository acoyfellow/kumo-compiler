import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {digest} from './index.mjs';

export const CLIPBOARD_LIVE_REGION_VERSION = 'kumo.clipboard-live-region/v1';
const CONTRACT_VERSION = 'kumo.observable/v1';
const here = path.dirname(fileURLToPath(import.meta.url));
const REQUIRED_VECTORS = ['ssr', 'click-copy', 'keyboard'];

export function deriveClipboardLiveRegion(contract) {
  if (contract?.schemaVersion !== CONTRACT_VERSION || contract.component !== 'clipboard-text') throw new Error('clipboard/live-region capability requires canonical ClipboardText contract');
  const vectors = new Map(contract.vectors.map(vector => [vector.id, vector]));
  for (const id of REQUIRED_VECTORS) if (!vectors.has(id)) throw new Error(`clipboard/live-region vector missing: ${id}`);
  const click = vectors.get('click-copy');
  const keyboard = vectors.get('keyboard');
  const value = {
    schemaVersion: CLIPBOARD_LIVE_REGION_VERSION,
    component: contract.component,
    support: 'requirements-only',
    contractDigest: digest(contract),
    ssr: {supported: contract.ssrHydration.ssr === 'supported', hydration: contract.ssrHydration.hydration, browserAccessDuringRender: false, initialClipboardWrites: [], initialAnnouncements: []},
    state: {clipboardWrites: 'ordered-log', announcements: 'ordered-log', events: 'ordered-log', focus: 'button'},
    activation: [
      {trigger: click.actions[0], clipboardText: {source: 'textToCopy', fallback: 'text'}, onSuccess: {event: click.expected.events[0], announcement: click.expected.state.live[0]}},
      {trigger: keyboard.actions[0], clipboardText: {source: 'textToCopy', fallback: 'text'}, onSuccess: {event: keyboard.expected.events[0], focus: keyboard.expected.focus}}
    ],
    browserService: {name: 'clipboard', operation: 'writeText', invocation: 'trusted button activation', availability: 'browser-only'},
    callbacks: {success: 'copy', failure: null},
    liveRegion: {successMessage: click.expected.state.live[0], lifecycle: 'announcement-after-success'},
    requirements: {dom: [contract.semantics.root, 'button'], aria: contract.semantics.aria, focus: contract.keyboardFocus},
    unknowns: [
      {field: 'clipboardPermissionAndRejection', reason: contract.unknowns[0].reason},
      {field: 'failureCallbackAndAnnouncement', reason: 'Canonical vectors specify only successful copy events and do not establish failure callback or announcement behavior.'},
      {field: 'announcementTimingAndClearing', reason: 'Canonical vectors establish a Copied announcement after success but not insertion delay, retention, clearing, or repeated-copy behavior.'},
      {field: 'liveRegionAriaAndDom', reason: 'Canonical contract does not establish the live-region element, role, aria-live value, aria-atomic value, or DOM placement.'},
      {field: 'buttonAccessibleNameAndStructure', reason: 'Canonical contract establishes button activation and focus but not the button accessible name, type, descendants, or exact DOM placement.'}
    ],
    vectorIds: REQUIRED_VECTORS,
    missingOperations: [
      {kind: 'failure-transition', reason: 'Clipboard rejection behavior and failure callbacks are not established by canonical vectors.'},
      {kind: 'announcement-lifecycle', reason: 'Announcement timing, clearing, and repeated-copy behavior are not established by canonical vectors.'},
      {kind: 'live-region-semantics', reason: 'Live-region role, aria attributes, and DOM placement are not established by the canonical contract.'},
      {kind: 'button-semantics', reason: 'Button accessible name, type, descendants, and exact DOM placement are not established by the canonical contract.'}
    ]
  };
  return {...value, capabilityDigest: digest(value)};
}

export function validateClipboardLiveRegion(value) {
  if (value?.schemaVersion !== CLIPBOARD_LIVE_REGION_VERSION || value.component !== 'clipboard-text') throw new Error('invalid clipboard/live-region capability');
  if (value.support !== 'requirements-only' || !value.missingOperations?.length) throw new Error('clipboard/live-region must fail closed with blockers');
  if (value.ssr?.browserAccessDuringRender !== false || value.browserService?.operation !== 'writeText') throw new Error('invalid clipboard browser-service boundary');
  if (value.activation?.map(item => item.trigger?.type).join(',') !== 'click,key' || value.activation[1].trigger.key !== 'Enter') throw new Error('invalid clipboard activation transitions');
  if (value.callbacks?.success !== 'copy' || value.callbacks.failure !== null || value.liveRegion?.successMessage !== 'Copied') throw new Error('invalid clipboard callback or announcement contract');
  if (value.vectorIds?.join(',') !== REQUIRED_VECTORS.join(',') || !value.unknowns?.length) throw new Error('clipboard/live-region provenance and unknowns required');
  const {capabilityDigest, ...unsigned} = value;
  if (capabilityDigest !== digest(unsigned)) throw new Error('clipboard/live-region capability digest mismatch');
  return value;
}

export function loadClipboardLiveRegion(file = path.join(here, 'capabilities/clipboard-live-region.json')) {
  return validateClipboardLiveRegion(JSON.parse(fs.readFileSync(file, 'utf8')));
}
