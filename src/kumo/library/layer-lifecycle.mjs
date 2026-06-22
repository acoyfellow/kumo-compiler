import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {digest} from './index.mjs';

export const LAYER_LIFECYCLE_VERSION = 'kumo.layer-lifecycle/v1';
const here = path.dirname(fileURLToPath(import.meta.url));
const CONTRACT_VERSION = 'kumo.observable/v1';
const COMPONENTS = ['dialog','dropdown-menu','popover'];
const SUPPORT = new Set(['requirements-only','unsupported']);

const unsupported = reason => ({supported:false, reason});
const required = (value, evidence) => ({supported:true, value, evidence});

function base(contract) {
  return {
    component: contract.component,
    support: 'requirements-only',
    contractDigest: digest(contract),
    vectorIds: contract.vectors.map(vector => vector.id),
    state: {
      open: contract.initialState.open,
      controlled: required(true, 'canonical initial state and vectors establish controlled/uncontrolled open ownership'),
      changeRequest: required('controlled values remain authoritative while dismissal requests an open change', 'canonical controlled/open transitions')
    },
    ownership: {
      trigger: required('compound trigger owns activation and restoration target', 'canonical fixture and transitions'),
      content: required('compound content is owned by the root layer', 'canonical fixture and transitions')
    },
    portal: required(contract.publicApi.defaults.portalContainer, 'canonical portalContainer default'),
    dismissal: {
      outsidePointer: unsupported('exact outside pointer phase, cancellation, and ordering require canonical browser execution'),
      escape: required('requests close and restores trigger focus', 'canonical transitions'),
      nesting: unsupported('nested-layer arbitration requires canonical browser execution')
    },
    modality: {
      mode: unsupported('canonical contract does not establish a complete modal/nonmodal policy'),
      inert: unsupported('outside-content inertness is not established for this layer'),
      scrollLock: unsupported('scroll locking is not established by canonical evidence')
    },
    focus: {
      initial: unsupported('exact initial-focus target and timing require canonical browser execution'),
      contain: unsupported('Tab containment policy requires canonical browser execution'),
      restore: required('trigger', 'canonical dismissal transition')
    },
    positioning: unsupported('positioning algorithm and collision behavior require canonical browser execution'),
    browserServices: [],
    blockers: contract.unknowns.map(({field,status,reason}) => ({field,status,reason}))
  };
}

export function deriveLayerLifecycle(contracts) {
  for (const contract of contracts) if (contract.schemaVersion !== CONTRACT_VERSION) throw new Error(`unsupported layer contract: ${contract.component}`);
  const byName = new Map(contracts.map(contract => [contract.component, contract]));
  const layers = COMPONENTS.map(name => {
    const contract = byName.get(name);
    if (!contract) throw new Error(`${name} contract required`);
    const layer = base(contract);
    if (name === 'dialog') {
      layer.ownership.content = required('Dialog child owns modal content; Root owns state, Trigger, Title, Description, and Close', 'canonical compound fixture');
      layer.dismissal.outsidePointer = required({dialog:'dismiss',alertdialog:'retain'}, 'canonical defaults and outside-press transition');
      layer.dismissal.escape = unsupported('standard dialog dismissal is established, but alertdialog Escape policy is explicitly unknown');
      layer.modality.mode = required('modal', 'canonical modal portal transition and inert semantic');
      layer.modality.inert = required(true, 'canonical semantic states outside content is inert');
      layer.focus.initial = required('move into content', 'canonical trigger transition');
      layer.focus.contain = required('modal Tab/Shift+Tab scope', 'canonical modal semantics and key set');
      layer.positioning = required('fixed centered viewport content', 'canonical fixed positioning classes');
      layer.browserServices = ['document portal container','focus management','outside-content inerting'];
    } else if (name === 'popover') {
      layer.modality.mode = required('nonmodal', 'canonical modal=false default');
      layer.positioning = required({side:'bottom',align:'center',sideOffset:8,alignOffset:0,positionMethod:'absolute',anchor:'trigger unless explicit anchor'}, 'canonical defaults and initial anchor');
      layer.browserServices = ['document portal container','focus management','outside interaction','anchor measurement','viewport collision detection'];
    } else {
      layer.ownership.content = required('Root owns Trigger and Content; Sub owns SubTrigger and SubContent', 'canonical compound submenu fixture');
      layer.dismissal.nesting = required('submenu Escape closes nested submenu and root menu', 'canonical keyboard submenu vector expected state');
      layer.focus.initial = required('establish highlighted/focused item', 'canonical trigger transition');
      layer.positioning = unsupported('sideOffset=8 is established, but placement, collision, RTL, and submenu geometry require browser execution');
      layer.browserServices = ['document portal container','focus management','outside interaction','anchor measurement','pointer intent'];
    }
    return layer;
  });
  const value = {schemaVersion:LAYER_LIFECYCLE_VERSION,layers};
  return {...value,capabilityDigest:digest(value)};
}

function validateClaim(claim, pathName) {
  if (!claim || typeof claim.supported !== 'boolean') throw new Error(`${pathName}: explicit support required`);
  if (claim.supported) {
    if (claim.value === undefined || !claim.evidence) throw new Error(`${pathName}: supported claim requires value and evidence`);
  } else if (!claim.reason) throw new Error(`${pathName}: unknown claim requires blocker reason`);
}

export function validateLayerLifecycle(value) {
  if (value?.schemaVersion !== LAYER_LIFECYCLE_VERSION || !Array.isArray(value.layers) || value.layers.length !== COMPONENTS.length) throw new Error('invalid layer lifecycle capability');
  if (value.layers.map(x => x.component).join(',') !== COMPONENTS.join(',')) throw new Error('layer lifecycle components must be deterministic');
  for (const layer of value.layers) {
    if (!SUPPORT.has(layer.support) || !/^[a-f0-9]{64}$/.test(layer.contractDigest ?? '') || !layer.vectorIds?.length) throw new Error(`${layer.component}: provenance required`);
    validateClaim(layer.state.controlled, `${layer.component}.state.controlled`); validateClaim(layer.state.changeRequest, `${layer.component}.state.changeRequest`);
    validateClaim(layer.ownership.trigger, `${layer.component}.ownership.trigger`); validateClaim(layer.ownership.content, `${layer.component}.ownership.content`);
    validateClaim(layer.portal, `${layer.component}.portal`);
    for (const [key,claim] of Object.entries(layer.dismissal)) validateClaim(claim, `${layer.component}.dismissal.${key}`);
    for (const [key,claim] of Object.entries(layer.modality)) validateClaim(claim, `${layer.component}.modality.${key}`);
    for (const [key,claim] of Object.entries(layer.focus)) validateClaim(claim, `${layer.component}.focus.${key}`);
    validateClaim(layer.positioning, `${layer.component}.positioning`);
    if (!Array.isArray(layer.browserServices) || !Array.isArray(layer.blockers) || !layer.blockers.every(x => x.field && x.status && x.reason)) throw new Error(`${layer.component}: explicit services and blockers required`);
  }
  const {capabilityDigest,...unsigned} = value;
  if (capabilityDigest !== digest(unsigned)) throw new Error('layer lifecycle capability digest mismatch');
  return value;
}

export function loadLayerLifecycle(file=path.join(here,'capabilities/layer-lifecycle.json')) {
  return validateLayerLifecycle(JSON.parse(fs.readFileSync(file,'utf8')));
}
