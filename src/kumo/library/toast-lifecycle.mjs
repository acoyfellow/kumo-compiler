import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {digest} from './index.mjs';

export const TOAST_LIFECYCLE_VERSION = 'kumo.toast-lifecycle/v1';
const CONTRACT_VERSION = 'kumo.observable/v1';
const REQUIRED_VECTORS = ['provider-ssr','notify-default','action-remains-visible','close-dismiss'];
const here = path.dirname(fileURLToPath(import.meta.url));
const unknown = reason => ({supported:false,reason});
const observed = (value,vectorIds) => ({supported:true,value,vectorIds});

export function deriveToastLifecycle(contract) {
  if (contract?.schemaVersion !== CONTRACT_VERSION || contract.component !== 'toasty') throw new Error('toast lifecycle requires canonical Toasty contract');
  const vectors = new Map(contract.vectors.map(vector => [vector.id,vector]));
  for (const id of REQUIRED_VECTORS) if (!vectors.has(id)) throw new Error(`toast lifecycle vector missing: ${id}`);
  const notify = vectors.get('notify-default'), action = vectors.get('action-remains-visible'), close = vectors.get('close-dismiss');
  const value = {
    schemaVersion: TOAST_LIFECYCLE_VERSION,
    component: 'toasty',
    support: 'requirements-only',
    observableImplementation: {
      support: 'supported',
      provider: {root:'div',preservesChildren:true},
      notify: {title:notify.expected.state.title,description:notify.expected.state.description,visible:notify.expected.state.visible,event:notify.expected.events[0]},
      action: {event:action.expected.events[1],dismisses:false,focus:action.expected.focus},
      close: {label:'Close',announcementPersistsDuringDismissal:true,visibleAfterWait:close.expected.state.visible,focusAfterRemoval:close.expected.focus},
      announcement: action.expected.state.announcement,
      vectorIds: REQUIRED_VECTORS
    },
    provenance: {
      contractPath: 'contracts/kumo.observable/v1/components/toasty.json',
      contractDigest: digest(contract),
      canonical: contract.canonical,
      vectorIds: REQUIRED_VECTORS
    },
    identity: {
      returnedId: unknown('Canonical vectors invoke notify through the fixture and never observe the manager return value.'),
      callerSuppliedId: unknown('Stable caller-supplied IDs and duplicate-ID behavior are vendor-manager details not exercised by canonical vectors.')
    },
    queue: {
      representation: 'ordered manager state',
      insertionOrder: unknown('Only one toast is created in each canonical vector; multi-toast queue order, limit, and eviction are unobserved.'),
      visibleLimit: unknown('Canonical vectors never create a second toast.')
    },
    operations: {
      create: observed({trigger:notify.actions[0],visible:notify.expected.state.visible,title:notify.expected.state.title,description:notify.expected.state.description,event:notify.expected.events[0]},['notify-default']),
      update: unknown('No canonical vector updates an existing toast.'),
      dismiss: observed({trigger:close.actions[2],phase:'exit-then-remove',visibleAfterWait:close.expected.state.visible,focusAfterRemoval:close.expected.focus},['close-dismiss']),
      action: observed({trigger:action.actions[2],remainsVisible:action.expected.state.visible,event:action.expected.events[1],focus:action.expected.focus},['action-remains-visible'])
    },
    timeout: {
      automaticDismiss: unknown('Canonical waits prove visibility at the action checkpoint and removal after explicit close, not a default timeout.'),
      durationMs: unknown('Exact timer duration is not asserted.'),
      pause: unknown('No hover, focus, page-visibility, or programmatic timer pause is exercised.'),
      resume: unknown('No paused timer is resumed by a canonical vector.')
    },
    portal: observed({containerDefault:contract.publicApi.defaults.container,initial:contract.initialState.viewport,ssrRoot:contract.semantics.root},['provider-ssr']),
    liveRegion: observed({priority:'polite',content:['title','description'],announcement:action.expected.state.announcement,actionDoesNotClear:true,closeCheckpointRetainsAnnouncement:close.actions[2].checkpoint.state.announcement},['action-remains-visible','close-dismiss']),
    cleanup: {
      explicitClose: observed('enters exit lifecycle then is removed',['close-dismiss']),
      announcementRemoval: unknown(contract.unknowns[0].reason),
      providerUnmount: unknown('Provider unmount cleanup is not exercised by canonical vectors.'),
      timerDisposal: unknown('Vendor timer allocation and disposal are not observed by canonical vectors.')
    },
    vendorUnknowns: [
      {field:'managerIdGenerationAndDedupe',reason:'The public manager is inherited from Base UI; ID generation, duplicate handling, and bump scheduling are not canonical-vector observations.'},
      {field:'timerScheduler',reason:'Timeout defaults, clock source, pause conditions, and resume arithmetic are inherited from the vendor and are not asserted.'},
      {field:'queuePolicy',reason:'Ordering under multiple additions, capacity, eviction, promise updates, and swipe dismissal are not exercised.'},
      {field:'liveRegionLifecycle',reason:contract.unknowns[0].reason}
    ],
    missingOperations: ['stable-id-contract','multi-toast-queue','update-transition','automatic-timeout','pause-resume','provider-unmount-cleanup']
  };
  return {...value,capabilityDigest:digest(value)};
}

function validateClaim(claim,name) {
  if (!claim || typeof claim.supported !== 'boolean') throw new Error(`${name}: explicit support required`);
  if (claim.supported) {
    if (claim.value === undefined || !Array.isArray(claim.vectorIds) || !claim.vectorIds.length) throw new Error(`${name}: observed claim requires vector provenance`);
  } else if (!claim.reason) throw new Error(`${name}: unknown claim requires reason`);
}

export function validateToastLifecycle(value) {
  if (value?.schemaVersion !== TOAST_LIFECYCLE_VERSION || value.component !== 'toasty' || value.support !== 'requirements-only') throw new Error('invalid toast lifecycle capability');
  const implementation=value.observableImplementation;
  if (implementation?.support!=='supported'||implementation.provider?.root!=='div'||implementation.provider.preservesChildren!==true) throw new Error('toast lifecycle observable implementation required');
  if (implementation.notify?.event!=='notify'||implementation.action?.event!=='action'||implementation.action.dismisses!==false) throw new Error('toast lifecycle observable notify/action invalid');
  if (implementation.close?.label!=='Close'||implementation.close.visibleAfterWait!==false||implementation.close.focusAfterRemoval!=='none') throw new Error('toast lifecycle observable close invalid');
  if (implementation.vectorIds?.join(',')!==REQUIRED_VECTORS.join(',')) throw new Error('toast lifecycle observable vectors invalid');
  const provenance = value.provenance;
  if (provenance?.contractPath !== 'contracts/kumo.observable/v1/components/toasty.json' || !/^[a-f0-9]{64}$/.test(provenance.contractDigest ?? '') || provenance.vectorIds?.join(',') !== REQUIRED_VECTORS.join(',')) throw new Error('toast lifecycle provenance required');
  validateClaim(value.identity?.returnedId,'identity.returnedId'); validateClaim(value.identity?.callerSuppliedId,'identity.callerSuppliedId');
  validateClaim(value.queue?.insertionOrder,'queue.insertionOrder'); validateClaim(value.queue?.visibleLimit,'queue.visibleLimit');
  for (const [name,claim] of Object.entries(value.operations ?? {})) validateClaim(claim,`operations.${name}`);
  for (const [name,claim] of Object.entries(value.timeout ?? {})) validateClaim(claim,`timeout.${name}`);
  validateClaim(value.portal,'portal'); validateClaim(value.liveRegion,'liveRegion');
  for (const [name,claim] of Object.entries(value.cleanup ?? {})) validateClaim(claim,`cleanup.${name}`);
  if (!value.vendorUnknowns?.length || !value.vendorUnknowns.every(item => item.field && item.reason) || !value.missingOperations?.length) throw new Error('toast lifecycle must preserve explicit vendor unknowns');
  const {capabilityDigest,...unsigned}=value;
  if (capabilityDigest !== digest(unsigned)) throw new Error('toast lifecycle capability digest mismatch');
  return value;
}

export function loadToastLifecycle(file=path.join(here,'capabilities/toast-lifecycle.json')) {
  return validateToastLifecycle(JSON.parse(fs.readFileSync(file,'utf8')));
}
