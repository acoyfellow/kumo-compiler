import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {validateImplementation} from './algebra.mjs';
import {validateSemanticRender} from './semantic-render.mjs';
import {loadContentBindings} from './content-bindings.mjs';
import {loadNativeButton} from './native-button.mjs';
import {loadBehaviorCapabilities} from './behavior-capabilities.mjs';
import {loadControlledState} from './controlled-state.mjs';
import {loadNativeControls} from './native-controls.mjs';
import {loadNativeField} from './native-field.mjs';
import {loadClipboardLiveRegion} from './clipboard-live-region.mjs';
import {loadFocusNavigation} from './focus-navigation.mjs';
import {loadCollectionListbox} from './collection-listbox.mjs';
import {loadLayerLifecycle} from './layer-lifecycle.mjs';
import {loadDateRange} from './date-range.mjs';
import {loadResponsiveSidebar} from './responsive-sidebar.mjs';
import {loadPaginationState} from './pagination-state.mjs';
import {loadToastLifecycle} from './toast-lifecycle.mjs';
import {loadFieldComposition} from './field-composition.mjs';
import {loadClipboardCopy} from './clipboard-copy.mjs';
import {loadPaginationControls} from './pagination-controls.mjs';
import {loadRadioGroup} from './radio-group.mjs';
import {loadTabsNavigation} from './tabs-navigation.mjs';
import {loadMenubarNavigation} from './menubar-navigation.mjs';
import {loadDialogLayer} from './dialog-layer.mjs';
import {loadInputGroupComposition} from './input-group-composition.mjs';
import {loadSensitiveInput} from './sensitive-input.mjs';
import {loadComboboxCollection} from './combobox-collection.mjs';
import {loadAutocompleteCollection} from './autocomplete-collection.mjs';
import {loadCommandPalette} from './command-palette.mjs';
import {loadPopoverLayer} from './popover-layer.mjs';
import {loadDropdownMenuLayer} from './dropdown-menu-layer.mjs';

export const LIBRARY_SCHEMA_VERSION = 'kumo.library/v1';
export const CAPABILITIES = Object.freeze([
  'static-element','polymorphic','compound-context','controlled-state','native-input',
  'field-wiring','clipboard/live-region','roving-focus','current-link','collection/listbox',
  'dismissable-layer','modal-focus','positioning','responsive-media','inert/disclosure',
  'date/range','toast','pagination'
]);
const here = path.dirname(fileURLToPath(import.meta.url));
const CAPABILITY_OPERATIONS = Object.freeze({
  'static-element':['render'], polymorphic:['render'], 'compound-context':['render'], 'controlled-state':['state','emit'], 'native-input':['render','emit'],
  'field-wiring':['render','ref'], 'clipboard/live-region':['browser-service','emit'], 'roving-focus':['state','focus','ref'], 'current-link':['render'],
  'collection/listbox':['render','state','focus'], 'dismissable-layer':['portal','lifecycle'], 'modal-focus':['focus','ref','lifecycle'], positioning:['browser-service','lifecycle'],
  'responsive-media':['browser-service','lifecycle'], 'inert/disclosure':['state','render'], 'date/range':['state','emit'], toast:['portal','lifecycle','emit'], pagination:['state','emit']
});

function validateCompoundComposition(model) {
  const graph = model.composition?.compoundExports;
  if (!graph) return;
  if (graph.canonicalRoot !== model.public.symbol && !model.public.exports.includes(graph.canonicalRoot)) throw new Error(`${model.component}: compound root is not public`);
  if (!graph.paths?.length) throw new Error(`${model.component}: compound export paths required`);
  const paths = graph.paths.map(item => item.path);
  if (new Set(paths).size !== paths.length || paths.join('\0') !== [...paths].sort().join('\0')) throw new Error(`${model.component}: compound paths must be unique and sorted`);
  const visit = (tree, prefix = '') => {
    if (!tree || typeof tree !== 'object' || Array.isArray(tree)) throw new Error(`${model.component}: invalid compound export tree`);
    for (const [segment, child] of Object.entries(tree)) {
      if (!segment || segment.includes('.')) throw new Error(`${model.component}: invalid compound segment`);
      visit(child, prefix ? `${prefix}.${segment}` : segment);
    }
  };
  visit(graph.tree);
  for (const item of graph.paths) if (!Array.isArray(item.vectorIds) || !item.vectorIds.length) throw new Error(`${model.component}: compound path requires fixture provenance`);
}

function validateReferences(model) {
  const props = new Set(model.props.items.map(item => item.name));
  const states = new Set(model.states.map(item => item.name));
  const visit = value => {
    if (Array.isArray(value)) return value.forEach(visit);
    if (!value || typeof value !== 'object') return;
    if (value.kind === 'prop' && typeof value.name === 'string' && !props.has(value.name)) throw new Error(`${model.component}: referenced prop ${value.name} is absent`);
    if (value.kind === 'state' && typeof value.name === 'string' && !states.has(value.name)) throw new Error(`${model.component}: referenced state ${value.name} is absent`);
    Object.values(value).forEach(visit);
  };
  visit(model.draftImplementation);
}

export function canonicalJSON(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJSON).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).filter(k => value[k] !== undefined).sort().map(k => `${JSON.stringify(k)}:${canonicalJSON(value[k])}`).join(',')}}`;
  return JSON.stringify(value);
}
export function digest(value) { return crypto.createHash('sha256').update(canonicalJSON(value)).digest('hex'); }

const FORBIDDEN_SOURCE = /<\/?[a-z][^>]*>|\b(?:React|ReactNode|ReactElement|JSX|createElement|useState|useEffect|from ["'][^"']*(?:react|vue|svelte|solid))\b|sample copy|demo/i;
const FRAMEWORKS = Object.freeze(['vue', 'svelte', 'solid']);
const IMMUTABLE_PROOF = /^[a-z0-9][a-z0-9._/-]*@sha256:[a-f0-9]{64}$/;
const VECTOR_ID = /^[a-z0-9][a-z0-9._/-]*#[a-f0-9]{64}$/;

function validateReadinessProof(proof) {
  if (!proof || !Object.isFrozen(proof)) throw new Error('ready model requires immutable proof references');
  if (!proof.frameworkOutputs || !Object.isFrozen(proof.frameworkOutputs)) throw new Error('ready model requires immutable framework output proof');
  for (const framework of FRAMEWORKS) if (!IMMUTABLE_PROOF.test(proof.frameworkOutputs[framework] ?? '')) throw new Error(`ready model requires immutable ${framework} output proof`);
  if (Object.keys(proof.frameworkOutputs).sort().join(',') !== FRAMEWORKS.slice().sort().join(',')) throw new Error('ready model framework proof must cover exactly vue, svelte, and solid');
  if (!Array.isArray(proof.canonicalVectorIds) || !Object.isFrozen(proof.canonicalVectorIds) || !proof.canonicalVectorIds.length || proof.canonicalVectorIds.some(id => !VECTOR_ID.test(id))) throw new Error('ready model requires immutable canonical vector IDs');
}

export function validateModel(model) {
  if (model.schemaVersion !== LIBRARY_SCHEMA_VERSION) throw new Error(`unknown library schema: ${model.schemaVersion}`);
  const allowed = new Set(CAPABILITIES);
  for (const capability of model.capabilities) if (!allowed.has(capability)) throw new Error(`unknown capability: ${capability}`);
  if (!model.provenance?.contractPath || !model.provenance?.contractDigest) throw new Error('model must bind an external contract');
  if (!model.componentRoot?.frameworkNeutral || 'fixture' in model.componentRoot) throw new Error('componentRoot must be framework-neutral and fixture-free');
  validateCompoundComposition(model);
  if (typeof model.componentRoot.implementationReady !== 'boolean') throw new Error('componentRoot must declare implementationReady');
  if (model.componentRoot.implementationReady) {
    if (model.componentRoot.candidateDefinition) throw new Error('draft candidate cannot satisfy readiness');
    if (!model.implementation) throw new Error('ready model requires implementation');
    if (model.missingOperations) throw new Error('ready model cannot have missing operations');
    validateReadinessProof(model.readinessProof);
    validateImplementation(model.implementation);
  } else {
    if (model.readinessProof) throw new Error('unready model cannot claim readiness proof');
    if (model.implementation) throw new Error('unready model cannot contain a fake implementation');
    if (model.componentRoot.candidateDefinition) {
      if (!model.componentRoot.draft || !model.draftImplementation) throw new Error('candidate definition requires draft algebra');
      validateImplementation(model.draftImplementation);
      const operationKinds = new Set(model.draftImplementation.operations.map(operation => operation.kind));
      for (const capability of model.capabilities) for (const kind of CAPABILITY_OPERATIONS[capability] ?? []) if (!operationKinds.has(kind)) throw new Error(`${model.component}: capability ${capability} requires ${kind} operation`);
      validateReferences(model);
    } else if (model.draftImplementation) throw new Error('draft algebra requires candidate definition');
    if (!Array.isArray(model.missingOperations) || !model.missingOperations.length) throw new Error('unready model requires explicit missing operations');
    for (const missing of model.missingOperations) if (!missing?.kind || !missing?.reason) throw new Error('invalid missing operation');
  }
  const implementationSource = JSON.stringify({componentRoot: model.componentRoot, implementation: model.implementation, draftImplementation: model.draftImplementation});
  if (FORBIDDEN_SOURCE.test(implementationSource)) throw new Error('implementation contains HTML, framework, fixture, or demo material');
  const {modelDigest, ...unsigned} = model;
  if (digest(unsigned) !== modelDigest) throw new Error(`model digest mismatch: ${model.component}`);
  return model;
}

export function loadLibrary(base = here) {
  const contentBindings = loadContentBindings(path.join(base, 'capabilities/content-bindings.json'));
  const nativeButton = loadNativeButton(path.join(base,'capabilities/native-button.json'));
  const behaviorCapabilities = loadBehaviorCapabilities(path.join(base,'capabilities/behavior-capabilities.json'));
  const controlledState = loadControlledState(path.join(base,'capabilities/controlled-state.json'));
  const nativeControls = loadNativeControls(path.join(base,'capabilities/native-controls.json'));
  const nativeField = loadNativeField(path.join(base,'capabilities/native-field.json'));
  const clipboardLiveRegion = loadClipboardLiveRegion(path.join(base,'capabilities/clipboard-live-region.json'));
  const focusNavigation = loadFocusNavigation(path.join(base,'capabilities/focus-navigation.json'));
  const collectionListbox = loadCollectionListbox(path.join(base,'capabilities/collection-listbox.json'));
  const layerLifecycle = loadLayerLifecycle(path.join(base,'capabilities/layer-lifecycle.json'));
  const dateRange = loadDateRange(path.join(base,'capabilities/date-range.json'));
  const responsiveSidebar = loadResponsiveSidebar(path.join(base,'capabilities/responsive-sidebar.json'));
  const paginationState = loadPaginationState(path.join(base,'capabilities/pagination-state.json'));
  const toastLifecycle = loadToastLifecycle(path.join(base,'capabilities/toast-lifecycle.json'));
  const fieldComposition = loadFieldComposition(path.join(base,'capabilities/field-composition.json'));
  const clipboardCopy = loadClipboardCopy(path.join(base,'capabilities/clipboard-copy.json'));
  const paginationControls = loadPaginationControls(path.join(base,'capabilities/pagination-controls.json'));
  const radioGroup = loadRadioGroup(path.join(base,'capabilities/radio-group.json'));
  const tabsNavigation = loadTabsNavigation(path.join(base,'capabilities/tabs-navigation.json'));
  const menubarNavigation = loadMenubarNavigation(path.join(base,'capabilities/menubar-navigation.json'));
  const dialogLayer = loadDialogLayer(path.join(base,'capabilities/dialog-layer.json'));
  const inputGroupComposition = loadInputGroupComposition(path.join(base,'capabilities/input-group-composition.json'));
  const sensitiveInput = loadSensitiveInput(path.join(base,'capabilities/sensitive-input.json'));
  const comboboxCollection = loadComboboxCollection(path.join(base,'capabilities/combobox-collection.json'));
  const autocompleteCollection = loadAutocompleteCollection(path.join(base,'capabilities/autocomplete-collection.json'));
  const commandPalette = loadCommandPalette(path.join(base,'capabilities/command-palette.json'));
  const popoverLayer = loadPopoverLayer(path.join(base,'capabilities/popover-layer.json'));
  const dropdownMenuLayer = loadDropdownMenuLayer(path.join(base,'capabilities/dropdown-menu-layer.json'));
  const semanticRender = validateSemanticRender(JSON.parse(fs.readFileSync(path.join(base, 'capabilities/semantic-render.json'), 'utf8')));
  const manifest = JSON.parse(fs.readFileSync(path.join(base, 'manifest.json'), 'utf8'));
  if (manifest.count !== manifest.components.length || manifest.components.length < 41) throw new Error('library inventory must contain at least the 41 baseline models with a consistent count');
  if (!Number.isInteger(manifest.implementationReadyCount)) throw new Error('manifest must count implementation-ready models');
  if (!Number.isInteger(manifest.candidateDefinitionCount)) throw new Error('manifest must count candidate definitions');
  const names = manifest.components.map(x => x.component);
  if (new Set(names).size !== names.length || names.join('\0') !== [...names].sort((a,b) => a.localeCompare(b)).join('\0')) throw new Error('manifest must be unique and sorted');
  const models = manifest.components.map(entry => {
    const model = validateModel(JSON.parse(fs.readFileSync(path.join(base, entry.file), 'utf8')));
    if (model.component !== entry.component || model.modelDigest !== entry.digest) throw new Error(`manifest mismatch: ${entry.component}`);
    return model;
  });
  if (models.filter(model => model.componentRoot.implementationReady).length !== manifest.implementationReadyCount) throw new Error('implementation-ready count mismatch');
  if (models.filter(model => model.componentRoot.candidateDefinition).length !== manifest.candidateDefinitionCount) throw new Error('candidate-definition count mismatch');
  const semanticComponents = new Map(semanticRender.components.map(component => [component.component, component]));
  for (const model of models) {
    if (model.contentBindings?.schemaVersion !== contentBindings.schemaVersion || model.contentBindings?.capabilityDigest !== contentBindings.capabilityDigest) throw new Error(`${model.component}: content binding mismatch`);
  }
  const button=models.find(model=>model.component==='button');
  if(button?.interactions?.nativeButton?.schemaVersion!==nativeButton.schemaVersion||button?.interactions?.nativeButton?.capabilityDigest!==nativeButton.capabilityDigest)throw new Error('button native interaction binding mismatch');
  for(const model of models)if(model.component!=='button'&&model.interactions?.nativeButton)throw new Error(`${model.component}: unexpected native button interaction`);
  for (const model of models) if (model.semanticRender) {
    const semantic = semanticComponents.get(model.component);
    if (!semantic || model.semanticRender.capabilityDigest !== semanticRender.capabilityDigest || model.semanticRender.vectorIds.join('\0') !== semantic.vectors.map(vector => vector.id).join('\0')) throw new Error(`${model.component}: semantic render binding mismatch`);
  }
  return {manifest, models, semanticRender, contentBindings, nativeButton, behaviorCapabilities, controlledState, nativeControls, nativeField, clipboardLiveRegion, focusNavigation, collectionListbox, layerLifecycle, dateRange, responsiveSidebar, paginationState, toastLifecycle, fieldComposition, clipboardCopy, paginationControls, radioGroup, tabsNavigation, menubarNavigation, dialogLayer, inputGroupComposition, sensitiveInput, comboboxCollection, autocompleteCollection, commandPalette, popoverLayer, dropdownMenuLayer};
}
