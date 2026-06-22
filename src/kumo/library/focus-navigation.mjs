import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {digest} from './index.mjs';

export const FOCUS_NAVIGATION_VERSION = 'kumo.focus-navigation/v1';
export const FOCUS_COMPONENTS = Object.freeze(['radio','menu-bar','tabs','pagination','command-palette','table-of-contents']);
const here = path.dirname(fileURLToPath(import.meta.url));
const unsupported = reason => ({supported:false,reason});

export function deriveFocusNavigation(contracts) {
  const byName = new Map(contracts.map(contract => [contract.component, contract]));
  for (const name of FOCUS_COMPONENTS) if (!byName.has(name)) throw new Error(`${name} contract required`);
  const specs = FOCUS_COMPONENTS.map(component => {
    const contract=byName.get(component);
    const common={component,focusable:contract.keyboardFocus.focusable,keys:contract.keyboardFocus.keys,vectorIds:contract.vectors.map(x=>x.id)};
    if(component==='radio') return {...common,target:'root',focusTargetIds:unsupported('Canonical vectors identify radio targets by item index, not stable DOM ids.'),rovingTabindex:unsupported('Canonical vectors establish arrow selection and root focus only; tabindex values are not asserted.'),navigation:{arrows:['ArrowDown','ArrowUp','ArrowLeft','ArrowRight'],homeEnd:unsupported(contract.unknowns[0].reason),tab:unsupported('Tab behavior is not present in canonical vectors.'),escape:unsupported('Escape behavior is not present in canonical vectors.')},activeKey:'value',disabledExclusion:{item:true,group:true,suppresses:['selection','event','focus']},labelFocus:unsupported('Legend/label activation is not asserted.'),restoration:unsupported('No open/close lifecycle exists in the canonical contract.')};
    if(component==='menu-bar') return {...common,target:'button',focusTargetIds:unsupported('Canonical options may have ids for active matching, but no focus target DOM id is asserted.'),rovingTabindex:unsupported('Every option button is natively tabbable; canonical MenuBar does not use roving tabindex.'),navigation:{arrows:['ArrowLeft','ArrowRight'],homeEnd:unsupported('Home and End are not declared.'),tab:'native-tab-order',escape:unsupported('Escape is not declared.')},activeKey:'isActive:index|option-id',disabledExclusion:unsupported('Disabled descendant behavior is explicitly unobserved.'),labelFocus:'native-button aria-label=tooltip',restoration:unsupported('MenuBar has no dismissal lifecycle.')};
    if(component==='tabs') return {...common,target:'[role=tab]',focusTargetIds:unsupported('Generated ids are implementation-managed and intentionally not frozen.'),rovingTabindex:{selected:0,unselected:-1},navigation:{arrows:['ArrowLeft','ArrowRight'],homeEnd:['Home','End'],tab:unsupported('Tab traversal is not asserted.'),escape:unsupported('Escape is not declared.')},activeKey:'value',disabledExclusion:unsupported('The canonical Tabs item API does not establish disabled items.'),labelFocus:'trigger label content',restoration:unsupported('Canonical Tabs has no panel or dismissal lifecycle.')};
    if(component==='pagination') return {...common,target:'native-control',focusTargetIds:unsupported('Controls are addressed by accessible labels, not stable ids.'),rovingTabindex:unsupported('Pagination uses native tab order.'),navigation:{arrows:['ArrowUp','ArrowDown'],homeEnd:unsupported('Home and End are not declared.'),tab:'native-tab-order',escape:unsupported('Escape is not declared.')},activeKey:'page',disabledExclusion:{boundaryControls:true,suppresses:['transition','event','focus']},labelFocus:'native controls use configurable aria-labels',restoration:unsupported('Pagination has no dismissal lifecycle.')};
    if(component==='command-palette') return {...common,target:'input',focusTargetIds:unsupported('Generated dialog/combobox ids are implementation details.'),rovingTabindex:unsupported('Canonical behavior keeps DOM focus on the input while highlight moves.'),navigation:{arrows:['ArrowDown','ArrowUp'],homeEnd:unsupported('Home and End are not declared.'),tab:unsupported('Tab behavior is delegated to the modal dialog and not asserted by vectors.'),escape:'close-dialog'},activeKey:'highlighted-item',disabledExclusion:'items expose disabled state',labelFocus:unsupported('No label activation vector is present.'),restoration:unsupported('The contract states Base UI traps/restores focus, but canonical vectors only assert none after close and do not establish a restoration target.')};
    return {...common,target:'native-anchor',focusTargetIds:'href-fragment',rovingTabindex:unsupported('TableOfContents uses native anchor navigation only.'),navigation:{arrows:unsupported('No component-managed keys.'),homeEnd:unsupported('No component-managed keys.'),tab:'native-anchor-order',escape:unsupported('No component-managed keys.')},activeKey:'consumer-supplied active',disabledExclusion:unsupported('No disabled API is established.'),labelFocus:'native anchor text',restoration:unsupported('No component-managed lifecycle.')};
  });
  const value={schemaVersion:FOCUS_NAVIGATION_VERSION,specs};
  return {...value,capabilityDigest:digest(value)};
}

export function validateFocusNavigation(value) {
  if(value?.schemaVersion!==FOCUS_NAVIGATION_VERSION || !Array.isArray(value.specs) || value.specs.length!==FOCUS_COMPONENTS.length) throw new Error('invalid focus navigation capability');
  if(value.specs.map(x=>x.component).join(',')!==FOCUS_COMPONENTS.join(',')) throw new Error('invalid focus navigation component order');
  for(const spec of value.specs) {
    if(spec.focusable!==true || !spec.target || !spec.activeKey || !spec.navigation || !spec.vectorIds?.length) throw new Error('incomplete focus navigation provenance');
    for(const field of ['focusTargetIds','rovingTabindex','disabledExclusion','labelFocus','restoration']) if(spec[field]?.supported===false && !spec[field].reason) throw new Error('unsupported focus navigation reason required');
  }
  const {capabilityDigest,...unsigned}=value;
  if(capabilityDigest!==digest(unsigned)) throw new Error('focus navigation capability digest mismatch');
  return value;
}
export function loadFocusNavigation(file=path.join(here,'capabilities/focus-navigation.json')) { return validateFocusNavigation(JSON.parse(fs.readFileSync(file,'utf8'))); }
