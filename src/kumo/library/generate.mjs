import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {ALGEBRA_VERSION} from './algebra.mjs';
import {canonicalJSON, digest} from './index.mjs';
import {deriveCompoundExports} from './compound-exports.mjs';
import {deriveSemanticRender} from './semantic-render.mjs';
import {compileSemanticVariants} from './semantic-implementation.mjs';
import {deriveContentBindings} from './content-bindings.mjs';
import {deriveNativeButton} from './native-button.mjs';
import {deriveBehaviorCapabilities} from './behavior-capabilities.mjs';
import {deriveControlledState} from './controlled-state.mjs';
import {deriveNativeControls} from './native-controls.mjs';
import {deriveNativeField} from './native-field.mjs';
import {deriveClipboardLiveRegion} from './clipboard-live-region.mjs';
import {deriveFocusNavigation, FOCUS_COMPONENTS} from './focus-navigation.mjs';
import {deriveCollectionListbox, COLLECTION_COMPONENTS} from './collection-listbox.mjs';
import {deriveLayerLifecycle} from './layer-lifecycle.mjs';
import {deriveDateRange} from './date-range.mjs';
import {deriveResponsiveSidebar} from './responsive-sidebar.mjs';
import {derivePaginationState} from './pagination-state.mjs';
import {deriveToastLifecycle} from './toast-lifecycle.mjs';
import {deriveFieldComposition, FIELD_COMPOSITION_COMPONENTS} from './field-composition.mjs';
import {deriveClipboardCopy, CLIPBOARD_COPY_COMPONENTS} from './clipboard-copy.mjs';
import {derivePaginationControls, PAGINATION_CONTROLS_COMPONENTS} from './pagination-controls.mjs';
import {deriveRadioGroup, RADIO_GROUP_COMPONENTS} from './radio-group.mjs';
import {deriveTabsNavigation, TABS_NAVIGATION_COMPONENTS} from './tabs-navigation.mjs';
import {deriveMenubarNavigation, MENUBAR_NAVIGATION_COMPONENTS} from './menubar-navigation.mjs';
import {deriveDialogLayer, DIALOG_LAYER_COMPONENTS} from './dialog-layer.mjs';
import {deriveInputGroupComposition, INPUT_GROUP_COMPOSITION_COMPONENTS} from './input-group-composition.mjs';
import {deriveSensitiveInput, SENSITIVE_INPUT_COMPONENTS} from './sensitive-input.mjs';
import {deriveComboboxCollection, COMBOBOX_COLLECTION_COMPONENTS} from './combobox-collection.mjs';
import {deriveAutocompleteCollection, AUTOCOMPLETE_COLLECTION_COMPONENTS} from './autocomplete-collection.mjs';
import {deriveCommandPalette, COMMAND_PALETTE_COMPONENTS} from './command-palette.mjs';
import {derivePopoverLayer, POPOVER_LAYER_COMPONENTS} from './popover-layer.mjs';
import {deriveDropdownMenuLayer, DROPDOWN_MENU_LAYER_COMPONENTS} from './dropdown-menu-layer.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const contracts = path.join(root, 'contracts/kumo.observable/v1/components');
const models = path.join(here, 'models');
const lit = value => ({kind: 'literal', value});
const prop = name => ({kind: 'prop', name});
const state = name => ({kind: 'state', name});
const style = name => ({kind: 'style-ref', name});
const children = {kind: 'children'};
const text = value => ({kind: 'text', value});
const element = (tag, childNodes = [children], attributes = {}) => ({kind: 'element', tag, attributes, styles: [style('root')], children: childNodes});
const slot = name => ({kind: 'slot', name});
const collection = source => ({kind: 'collection', source: prop(source), item: 'item', key: {kind: 'item', name: 'key'}, template: slot('item')});
const compound = (name, names) => ({kind: 'compound', name, parts: Object.fromEntries(names.map(part => [part, slot(part)]))});
const portal = (layer, parts) => ({kind: 'portal', target: lit('document-body'), layer, children: [compound(layer, parts)]});

const foundation = {
  badge: element('span'), banner: element('section', [slot('icon'), text(prop('title')), slot('description'), slot('action'), children]),
  breadcrumbs: element('nav', [children], {'aria-label': lit('Breadcrumbs')}),
  'cloudflare-logo': element('svg', [], {role: lit('img'), 'aria-label': lit('Cloudflare')}), code: element('code', [text(prop('code'))]),
  empty: element('section', [slot('icon'), text(prop('title')), slot('description'), slot('contents')]), grid: element('div'), 'grid-item': element('div'),
  label: element('label'), 'layer-card': element('div'), link: element('a', [children], {href: prop('href')}), loader: element('span', [], {role: lit('status'), 'aria-label': prop('aria-label')}),
  meter: element('div', [text(prop('label')), element('meter', [], {}), {kind: 'condition', when: prop('showValue'), then: text({kind: 'coalesce', values: [prop('customValue'), prop('value')]})}]),
  surface: element('div'), table: element('table'), text: element('span')
};
const interactive = new Set(['autocomplete','combobox','command-palette','date-picker','date-range-picker','dialog','dropdown-menu','menu-bar','pagination','popover','select','sidebar','tabs','toasty']);
const collectionComponents = new Set(['autocomplete','combobox','command-palette','dropdown-menu','menu-bar','pagination','radio','select','sidebar','table-of-contents','tabs','toasty']);
const portalComponents = new Set(['autocomplete','combobox','command-palette','date-picker','date-range-picker','dialog','dropdown-menu','popover','select','toasty']);
const inputTags = {button:'button', checkbox:'input', input:'input', 'input-area':'textarea', radio:'input', switch:'button', 'sensitive-input':'input'};
function semanticDefinition(name, contract) {
  if (foundation[name]) return foundation[name];
  const roots = String(contract.semanticGraph?.root ?? name).split(/\s*(?:\+|,|\/|\band\b)\s*/i).filter(Boolean);
  const parts = [...new Set([...(contract.composition?.slots ?? []).map(value => typeof value === 'string' ? value : value.name), ...roots])];
  let root;
  if (portalComponents.has(name)) root = portal(name, parts.length ? parts : ['trigger', 'content']);
  else if (parts.length > 1 || contract.capabilities?.includes('compound-context')) root = compound(name, parts.length ? parts : ['root']);
  else root = element(inputTags[name] ?? (/^[a-z][a-z0-9-]*$/.test(roots[0] ?? '') ? roots[0] : 'div'), contract.composition?.children ? [children] : []);
  if (collectionComponents.has(name)) root = compound(name, {kind: 'compound'} && ['root', 'collection']);
  return root;
}

const capabilityOperations = {
  'static-element': ['render'], polymorphic: ['render'], 'compound-context': ['render'], 'controlled-state': ['state','emit'], 'native-input': ['render','emit'],
  'field-wiring': ['render','ref'], 'clipboard/live-region': ['browser-service','emit'], 'roving-focus': ['state','focus','ref'], 'current-link': ['render'],
  'collection/listbox': ['render','state','focus'], 'dismissable-layer': ['portal','lifecycle'], 'modal-focus': ['focus','ref','lifecycle'], positioning: ['browser-service','lifecycle'],
  'responsive-media': ['browser-service','lifecycle'], 'inert/disclosure': ['state','render'], 'date/range': ['state','emit'], toast: ['portal','lifecycle','emit'], pagination: ['state','emit']
};
function operation(kind, index, model) {
  const callback = model.emissions.callbacks[index % Math.max(1, model.emissions.callbacks.length)];
  const modelBinding = model.emissions.models[index % Math.max(1, model.emissions.models.length)];
  const stateName = model.states[index % Math.max(1, model.states.length)]?.name;
  const base = {id: `${kind}-${index + 1}`, kind};
  if (kind === 'emit') return {...base, event: callback?.name ?? modelBinding?.event ?? 'change', callback: callback?.name ?? undefined, value: modelBinding?.prop ? prop(modelBinding.prop) : lit(null)};
  if (kind === 'state') return {...base, state: stateName ?? 'interaction', mode: model.states.length ? 'declared' : 'derived', initial: stateName ? state(stateName) : lit(null)};
  if (kind === 'focus' || kind === 'ref') return {...base, target: 'root'};
  if (kind === 'portal') return {...base, layer: model.component};
  if (kind === 'browser-service') return {...base, service: model.capabilities.includes('clipboard/live-region') ? 'clipboard' : 'environment'};
  if (kind === 'lifecycle') return {...base, phase: 'mounted'};
  return base;
}
function implementation(model, contract) {
  const required = [...new Set(model.capabilities.flatMap(capability => capabilityOperations[capability] ?? ['render']))];
  if (!required.includes('render')) required.unshift('render');
  const operations = required.map((kind, index) => operation(kind, index, model));
  operations.push({id: 'apply-root-styles', kind: 'style', styles: [style('root')]});
  return {algebraVersion: ALGEBRA_VERSION, componentRoot: semanticDefinition(model.component, contract), operations};
}
function proofGaps(model) {
  return [
    ...[...new Set(model.capabilities.flatMap(capability => capabilityOperations[capability] ?? ['render']))].sort().map(kind => ({kind, reason: `draft ${kind} semantics require canonical browser proof`})),
    {kind:'native-forwarding',reason:'native attributes, properties, and events have not been proven to forward without loss'},
    {kind:'style-resolution',reason:'style references have not been resolved to canonical dependency-backed styles'},
    {kind:'semantic-completeness',reason:'draft render tree has not been proven semantically complete'},
    {kind:'framework-output',reason:'generated Vue, Svelte, and Solid output has not been produced and immutably referenced'},
    {kind:'packed-browser-vectors',reason:'canonical packed browser vectors have not been executed and immutably identified'}
  ];
}

// Give the compiled Button emphasis semantic vectors (primary-*, destructive-*,
// danger-*) the same colored treatment the fallback branch emits: the four inline
// `--kumo-button-emphasis-*` CSS vars (so the emphasis background/ring utilities
// resolve to a color) plus the canonical gradient overlay span and relative label
// wrapper. Non-emphasis vectors (e.g. the secondary default-native span) are left
// untouched. Values come from the nativeButton capability's emphasis descriptor,
// so the semantic branch matches canonical React 2.6.0 exactly like the fallback.
function applyButtonEmphasis(model, emphasis) {
  const variants = model.draftImplementation?.semanticVariants;
  if (!Array.isArray(variants)) return;
  const styleString = obj => Object.entries(obj).map(([k, v]) => `${k}: ${v}`).join('; ');
  for (const variant of variants) {
    const name = variant.when.find(p => p.kind === 'prop-equals' && p.name === 'variant')?.value;
    const style = name && emphasis.variants[name];
    if (!style) continue;
    const tree = variant.tree;
    if (tree?.kind !== 'semantic-element') continue;
    tree.attributes = {...tree.attributes, style: lit(styleString(style))};
    const overlay = {kind: 'semantic-element', tag: lit('span'), attributes: {'aria-hidden': lit('true')}, classes: [lit(emphasis.overlayClass)], children: []};
    const wrapper = {kind: 'semantic-element', tag: lit('span'), attributes: {}, classes: [lit(emphasis.wrapperClass)], children: tree.children ?? []};
    tree.children = [overlay, wrapper];
  }
}

fs.mkdirSync(models, {recursive:true});
const compoundExports = deriveCompoundExports();
const semanticRender = deriveSemanticRender(contracts);
const contentBindings = deriveContentBindings();
const buttonContract = JSON.parse(fs.readFileSync(path.join(contracts,'button.json'),'utf8'));
const nativeButton = deriveNativeButton(buttonContract);
const semanticByComponent = new Map(semanticRender.components.map(entry => [entry.component, entry]));
const compoundByComponent = new Map(compoundExports.roots.map(entry => [entry.component, entry]));
const contractFiles = fs.readdirSync(contracts).filter(file => file.endsWith('.json')).sort((a,b) => a.slice(0,-5).localeCompare(b.slice(0,-5)));
const canonicalContracts = contractFiles.map(file => JSON.parse(fs.readFileSync(path.join(contracts,file),'utf8')));
const behaviorCapabilities = deriveBehaviorCapabilities(canonicalContracts);
const clipboardLiveRegion = deriveClipboardLiveRegion(canonicalContracts.find(contract => contract.component === 'clipboard-text'));
const focusNavigation = deriveFocusNavigation(canonicalContracts.filter(contract => FOCUS_COMPONENTS.includes(contract.component)));
const collectionListbox = deriveCollectionListbox(canonicalContracts.filter(contract => COLLECTION_COMPONENTS.includes(contract.component)));
const layerLifecycle = deriveLayerLifecycle(canonicalContracts.filter(contract => ['dialog','dropdown-menu','popover'].includes(contract.component)));
const dateRange = deriveDateRange(canonicalContracts.filter(contract => ['date-picker','date-range-picker'].includes(contract.component)));
const responsiveSidebar = deriveResponsiveSidebar(canonicalContracts.find(contract => contract.component === 'sidebar'));
const paginationState = derivePaginationState(canonicalContracts.find(contract => contract.component === 'pagination'));
const toastLifecycle = deriveToastLifecycle(canonicalContracts.find(contract => contract.component === 'toasty'));
const fieldComposition = deriveFieldComposition(canonicalContracts.filter(contract => FIELD_COMPOSITION_COMPONENTS.includes(contract.component)));
const clipboardCopy = deriveClipboardCopy(canonicalContracts.filter(contract => CLIPBOARD_COPY_COMPONENTS.includes(contract.component)));
const paginationControls = derivePaginationControls(canonicalContracts.filter(contract => PAGINATION_CONTROLS_COMPONENTS.includes(contract.component)));
const radioGroup = deriveRadioGroup(canonicalContracts.filter(contract => RADIO_GROUP_COMPONENTS.includes(contract.component)));
const tabsNavigation = deriveTabsNavigation(canonicalContracts.filter(contract => TABS_NAVIGATION_COMPONENTS.includes(contract.component)));
const menubarNavigation = deriveMenubarNavigation(canonicalContracts.filter(contract => MENUBAR_NAVIGATION_COMPONENTS.includes(contract.component)));
const dialogLayer = deriveDialogLayer(canonicalContracts.filter(contract => DIALOG_LAYER_COMPONENTS.includes(contract.component)));
const inputGroupComposition = deriveInputGroupComposition(canonicalContracts.filter(contract => INPUT_GROUP_COMPOSITION_COMPONENTS.includes(contract.component)));
const sensitiveInput = deriveSensitiveInput(canonicalContracts.filter(contract => SENSITIVE_INPUT_COMPONENTS.includes(contract.component)));
const comboboxCollection = deriveComboboxCollection(canonicalContracts.filter(contract => COMBOBOX_COLLECTION_COMPONENTS.includes(contract.component)));
const autocompleteCollection = deriveAutocompleteCollection(canonicalContracts.filter(contract => AUTOCOMPLETE_COLLECTION_COMPONENTS.includes(contract.component)));
const commandPalette = deriveCommandPalette(canonicalContracts.filter(contract => COMMAND_PALETTE_COMPONENTS.includes(contract.component)));
const popoverLayer = derivePopoverLayer(canonicalContracts.filter(contract => POPOVER_LAYER_COMPONENTS.includes(contract.component)));
const dropdownMenuLayer = deriveDropdownMenuLayer(canonicalContracts.filter(contract => DROPDOWN_MENU_LAYER_COMPONENTS.includes(contract.component)));
const nativeControlContracts = canonicalContracts.filter(contract => ['checkbox','switch','radio','input','input-area','sensitive-input'].includes(contract.component));
const controlledState = deriveControlledState(nativeControlContracts.filter(contract => ['checkbox','switch','radio'].includes(contract.component)));
const nativeControls = deriveNativeControls(nativeControlContracts);
const nativeField = deriveNativeField(canonicalContracts.filter(contract => ['field','input','input-area','sensitive-input'].includes(contract.component)));
const entries = [];
for (const file of contractFiles) {
  const name = file.slice(0,-5); const contractPath = `contracts/kumo.observable/v1/components/${file}`;
  const contract = JSON.parse(fs.readFileSync(path.join(root, contractPath), 'utf8'));
  const previous = JSON.parse(fs.readFileSync(path.join(models, file), 'utf8'));
   // Bind the library IR's canonical provenance to the contract's canonical
   // block so an upstream bump (e.g. 2.5.2 -> 2.6.0) flows through instead of
   // being frozen from the previously generated model. `canonical` mirrors the
   // contract's package/version and the byte hashes the contract already
   // verified against the regenerated provenance.
   const {package:canonicalPackage,version:canonicalVersion,typesSha256,runtimeSha256}=contract.canonical;
   const model = {...previous, provenance:{...previous.provenance, contractPath, canonical:{package:canonicalPackage,version:canonicalVersion,typesSha256,runtimeSha256}, contractDigest:digest(contract)}};
  delete model.modelDigest; delete model.readinessProof;
  const compoundExport = compoundByComponent.get(name);
  if (compoundExport) model.composition = {...model.composition, compoundExports:{canonicalRoot:compoundExport.canonicalRoot, tree:compoundExport.tree, paths:compoundExport.paths}};
  else if (model.composition) delete model.composition.compoundExports;
  const semantic = semanticByComponent.get(name);
  if (semantic) model.semanticRender = {schemaVersion:semanticRender.schemaVersion, capabilityDigest:semanticRender.capabilityDigest, vectorIds:semantic.vectors.map(vector => vector.id)};
  else delete model.semanticRender;
  model.contentBindings = {schemaVersion:contentBindings.schemaVersion, capabilityDigest:contentBindings.capabilityDigest};
  if(name==='button')model.interactions={...(model.interactions??{}),nativeButton:{schemaVersion:nativeButton.schemaVersion,capabilityDigest:nativeButton.capabilityDigest,styleVariants:nativeButton.styleVariants,styleVariantProp:nativeButton.styleVariantProp,defaultVariant:nativeButton.defaultVariant,emphasis:nativeButton.emphasis}};
  else if(model.interactions)delete model.interactions.nativeButton;
  model.componentRoot = {frameworkNeutral:true, implementationReady:false, candidateDefinition:true, draft:true};
  model.draftImplementation = JSON.parse(JSON.stringify(implementation(model, contract)));
  const compiledSemantic = compileSemanticVariants(semantic ?? {vectors:[]});
  if (compiledSemantic.semanticVariants.length) model.draftImplementation.semanticVariants = compiledSemantic.semanticVariants;
  if (name === 'button') applyButtonEmphasis(model, nativeButton.emphasis);
  model.unresolvedSemanticOperations = compiledSemantic.unresolvedSemanticOperations;
  model.missingOperations = proofGaps(model);
  model.modelDigest = digest(model);
  fs.writeFileSync(path.join(models,file), `${JSON.stringify(model,null,2)}\n`);
  entries.push({component:name,file:`models/${file}`,digest:model.modelDigest});
}
const manifest = {schemaVersion:'kumo.library-manifest/v1',count:entries.length,candidateDefinitionCount:41,implementationReadyCount:0,components:entries};
fs.writeFileSync(path.join(here,'manifest.json'), `${JSON.stringify(manifest,null,2)}\n`);
fs.mkdirSync(path.join(here, 'capabilities'), {recursive:true});
fs.writeFileSync(path.join(here, 'capabilities/compound-exports.json'), `${JSON.stringify(compoundExports,null,2)}\n`);
fs.writeFileSync(path.join(here, 'capabilities/semantic-render.json'), `${JSON.stringify(semanticRender,null,2)}\n`);
fs.writeFileSync(path.join(here, 'capabilities/content-bindings.json'), `${JSON.stringify(contentBindings,null,2)}\n`);
fs.writeFileSync(path.join(here, 'capabilities/native-button.json'), `${JSON.stringify(nativeButton,null,2)}\n`);
fs.writeFileSync(path.join(here, 'capabilities/behavior-capabilities.json'), `${JSON.stringify(behaviorCapabilities,null,2)}\n`);
fs.writeFileSync(path.join(here, 'capabilities/clipboard-live-region.json'), `${JSON.stringify(clipboardLiveRegion,null,2)}\n`);
fs.writeFileSync(path.join(here, 'capabilities/focus-navigation.json'), `${JSON.stringify(focusNavigation,null,2)}\n`);
fs.writeFileSync(path.join(here, 'capabilities/collection-listbox.json'), `${JSON.stringify(collectionListbox,null,2)}\n`);
fs.writeFileSync(path.join(here, 'capabilities/layer-lifecycle.json'), `${JSON.stringify(layerLifecycle,null,2)}\n`);
fs.writeFileSync(path.join(here, 'capabilities/date-range.json'), `${JSON.stringify(dateRange,null,2)}\n`);
fs.writeFileSync(path.join(here, 'capabilities/responsive-sidebar.json'), `${JSON.stringify(responsiveSidebar,null,2)}\n`);
fs.writeFileSync(path.join(here, 'capabilities/pagination-state.json'), `${JSON.stringify(paginationState,null,2)}\n`);
fs.writeFileSync(path.join(here, 'capabilities/toast-lifecycle.json'), `${JSON.stringify(toastLifecycle,null,2)}\n`);
fs.writeFileSync(path.join(here, 'capabilities/field-composition.json'), `${JSON.stringify(fieldComposition,null,2)}\n`);
fs.writeFileSync(path.join(here, 'capabilities/clipboard-copy.json'), `${JSON.stringify(clipboardCopy,null,2)}\n`);
fs.writeFileSync(path.join(here, 'capabilities/pagination-controls.json'), `${JSON.stringify(paginationControls,null,2)}\n`);
fs.writeFileSync(path.join(here, 'capabilities/radio-group.json'), `${JSON.stringify(radioGroup,null,2)}\n`);
fs.writeFileSync(path.join(here, 'capabilities/tabs-navigation.json'), `${JSON.stringify(tabsNavigation,null,2)}\n`);
fs.writeFileSync(path.join(here, 'capabilities/menubar-navigation.json'), `${JSON.stringify(menubarNavigation,null,2)}\n`);
fs.writeFileSync(path.join(here, 'capabilities/dialog-layer.json'), `${JSON.stringify(dialogLayer,null,2)}\n`);
fs.writeFileSync(path.join(here, 'capabilities/input-group-composition.json'), `${JSON.stringify(inputGroupComposition,null,2)}\n`);
fs.writeFileSync(path.join(here, 'capabilities/sensitive-input.json'), `${JSON.stringify(sensitiveInput,null,2)}\n`);
fs.writeFileSync(path.join(here, 'capabilities/combobox-collection.json'), `${JSON.stringify(comboboxCollection,null,2)}\n`);
fs.writeFileSync(path.join(here, 'capabilities/autocomplete-collection.json'), `${JSON.stringify(autocompleteCollection,null,2)}\n`);
fs.writeFileSync(path.join(here, 'capabilities/command-palette.json'), `${JSON.stringify(commandPalette,null,2)}\n`);
fs.writeFileSync(path.join(here, 'capabilities/popover-layer.json'), `${JSON.stringify(popoverLayer,null,2)}\n`);
fs.writeFileSync(path.join(here, 'capabilities/dropdown-menu-layer.json'), `${JSON.stringify(dropdownMenuLayer,null,2)}\n`);
fs.writeFileSync(path.join(here, 'capabilities/controlled-state.json'), `${JSON.stringify(controlledState,null,2)}\n`);
fs.writeFileSync(path.join(here, 'capabilities/native-controls.json'), `${JSON.stringify(nativeControls,null,2)}\n`);
fs.writeFileSync(path.join(here, 'capabilities/native-field.json'), `${JSON.stringify(nativeField,null,2)}\n`);
process.stdout.write(`${canonicalJSON({candidateDefinitionCount:41,count:entries.length,implementationReadyCount:0})}\n`);
