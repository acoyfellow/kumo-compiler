import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {digest} from './index.mjs';

export const RESPONSIVE_SIDEBAR_VERSION = 'kumo.responsive-sidebar/v1';
const CONTRACT_VERSION = 'kumo.observable/v1';
const here = path.dirname(fileURLToPath(import.meta.url));
const required = (value, evidence) => ({supported:true,value,evidence});
const unknown = reason => ({supported:false,reason});

export function deriveResponsiveSidebar(contract) {
  if (contract?.schemaVersion !== CONTRACT_VERSION || contract.component !== 'sidebar') throw new Error('sidebar observable contract required');
  const value = {
    schemaVersion: RESPONSIVE_SIDEBAR_VERSION,
    component: 'sidebar',
    contractDigest: digest(contract),
    vectorIds: contract.vectors.map(({id}) => id),
    viewport: {
      breakpoint: required(contract.publicApi.defaults.mobileBreakpoint, 'canonical Provider mobileBreakpoint default'),
      desktop: required({condition:'width >= mobileBreakpoint',root:'aside',openState:'open'}, 'canonical responsive root and initial state'),
      mobile: required({condition:'width < mobileBreakpoint',root:'portaled backdrop plus nav',openState:'openMobile'}, 'canonical responsive semantics and transitions'),
      transition: required('matchMedia change switches the rendered desktop/mobile branch without transferring disclosure state', 'canonical runtime separates open and openMobile')
    },
    disclosure: {
      desktopInitial: required(contract.publicApi.defaults.defaultOpen, 'canonical defaultOpen'),
      mobileInitial: required(false, 'canonical initialState.openMobile'),
      toggle: required('Trigger/Rail toggles open on desktop and openMobile on mobile', 'canonical trigger transition'),
      controlledOwnership: required({prop:'open',defaultProp:'defaultOpen',event:'onOpenChange',rule:'controlled prop remains authoritative; requests call onOpenChange',mobile:'openMobile remains internal and independent'}, 'canonical Provider API and separate runtime states')
    },
    visibility: {
      mobileClosed: required({mounted:true,'aria-hidden':true,inert:'imperative ref effect'}, 'canonical mobile semantics'),
      collapsibleClosed: required({mounted:true,role:'region','aria-hidden':true,inert:'imperative ref effect'}, 'canonical Collapsible semantics'),
      inactiveSlidingView: required({mounted:true,'aria-hidden':true,pointerEvents:'none',inert:'imperative ref effect'}, 'canonical SlidingView semantics'),
      inertSerialization: unknown('inert is applied imperatively; SSR and hydration timing require browser observation')
    },
    focus: {
      mobileOpen: required('focus first focusable descendant, otherwise nav', 'canonical mobile semantics'),
      escape: required('close mobile sheet and restore prior focus', 'canonical mobile semantics'),
      focusLeaves: required('close an open mobile sheet', 'canonical mobile semantics'),
      exactOrdering: unknown('portal focus, focusout, and restoration ordering require canonical browser execution')
    },
    browserServices: {
      matchMedia: required({query:'(max-width: mobileBreakpoint - 1px)',initialClientRead:'synchronous',subscription:'change listener'}, 'canonical runtime responsive service boundary'),
      resize: required({scope:'sidebar width drag only',source:'window pointermove/pointerup',viewportMode:'not derived from resize events directly'}, 'canonical resize and matchMedia boundaries'),
      portal: required('mobile branch requires a document portal target', 'canonical mobile root semantics'),
      focus: required('document activeElement and focus/focusout services', 'canonical focus semantics')
    },
    ssr: {
      initialViewport: required('desktop (isMobile=false when window is absent)', 'canonical initial state'),
      hydration: unknown('narrow clients synchronously select mobile while SSR emits desktop; identical hydration is not established')
    },
    blockers: contract.unknowns.map(({field,status,reason}) => ({field,status,reason}))
  };
  return {...value,capabilityDigest:digest(value)};
}

function claim(value, name) {
  if (!value || typeof value.supported !== 'boolean') throw new Error(`${name}: explicit support required`);
  if (value.supported && (value.value === undefined || !value.evidence)) throw new Error(`${name}: supported claim requires value and evidence`);
  if (!value.supported && !value.reason) throw new Error(`${name}: unknown claim requires reason`);
}

export function validateResponsiveSidebar(value) {
  if (value?.schemaVersion !== RESPONSIVE_SIDEBAR_VERSION || value.component !== 'sidebar' || !/^[a-f0-9]{64}$/.test(value.contractDigest ?? '') || !value.vectorIds?.length) throw new Error('invalid responsive sidebar capability');
  for (const section of ['viewport','disclosure','visibility','focus','browserServices','ssr']) for (const [name,item] of Object.entries(value[section] ?? {})) claim(item, `${section}.${name}`);
  if (!Array.isArray(value.blockers) || !value.blockers.length || !value.blockers.every(x => x.field && x.status && x.reason)) throw new Error('responsive sidebar blockers required');
  const {capabilityDigest,...unsigned} = value;
  if (capabilityDigest !== digest(unsigned)) throw new Error('responsive sidebar capability digest mismatch');
  return value;
}

export function loadResponsiveSidebar(file=path.join(here,'capabilities/responsive-sidebar.json')) {
  return validateResponsiveSidebar(JSON.parse(fs.readFileSync(file,'utf8')));
}
