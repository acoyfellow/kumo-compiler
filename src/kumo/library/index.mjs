import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {validateImplementation} from './algebra.mjs';

export const LIBRARY_SCHEMA_VERSION = 'kumo.library/v1';
export const CAPABILITIES = Object.freeze([
  'static-element','polymorphic','compound-context','controlled-state','native-input',
  'field-wiring','clipboard/live-region','roving-focus','current-link','collection/listbox',
  'dismissable-layer','modal-focus','positioning','responsive-media','inert/disclosure',
  'date/range','toast','pagination'
]);
const here = path.dirname(fileURLToPath(import.meta.url));

export function canonicalJSON(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJSON).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${canonicalJSON(value[k])}`).join(',')}}`;
  return JSON.stringify(value);
}
export function digest(value) { return crypto.createHash('sha256').update(canonicalJSON(value)).digest('hex'); }

const FORBIDDEN_SOURCE = /<\/?[a-z][^>]*>|\b(?:React|ReactNode|ReactElement|JSX|createElement|useState|useEffect|from ["'][^"']*(?:react|vue|svelte|solid))\b|fixture|sample copy|demo/i;

export function validateModel(model) {
  if (model.schemaVersion !== LIBRARY_SCHEMA_VERSION) throw new Error(`unknown library schema: ${model.schemaVersion}`);
  const allowed = new Set(CAPABILITIES);
  for (const capability of model.capabilities) if (!allowed.has(capability)) throw new Error(`unknown capability: ${capability}`);
  if (!model.provenance?.contractPath || !model.provenance?.contractDigest) throw new Error('model must bind an external contract');
  if (!model.componentRoot?.frameworkNeutral || 'fixture' in model.componentRoot) throw new Error('componentRoot must be framework-neutral and fixture-free');
  if (typeof model.componentRoot.implementationReady !== 'boolean') throw new Error('componentRoot must declare implementationReady');
  if (model.componentRoot.implementationReady) {
    if (!model.implementation) throw new Error('ready model requires implementation');
    if (model.missingOperations) throw new Error('ready model cannot have missing operations');
    validateImplementation(model.implementation);
  } else {
    if (model.implementation) throw new Error('unready model cannot contain a fake implementation');
    if (!Array.isArray(model.missingOperations) || !model.missingOperations.length) throw new Error('unready model requires explicit missing operations');
    for (const missing of model.missingOperations) if (!missing?.kind || !missing?.reason) throw new Error('invalid missing operation');
  }
  const implementationSource = JSON.stringify({componentRoot: model.componentRoot, implementation: model.implementation});
  if (FORBIDDEN_SOURCE.test(implementationSource)) throw new Error('implementation contains HTML, framework, fixture, or demo material');
  const {modelDigest, ...unsigned} = model;
  if (digest(unsigned) !== modelDigest) throw new Error(`model digest mismatch: ${model.component}`);
  return model;
}

export function loadLibrary(base = here) {
  const manifest = JSON.parse(fs.readFileSync(path.join(base, 'manifest.json'), 'utf8'));
  if (manifest.count !== 41 || manifest.components.length !== 41) throw new Error('library inventory must contain exactly 41 models');
  if (!Number.isInteger(manifest.implementationReadyCount)) throw new Error('manifest must count implementation-ready models');
  const names = manifest.components.map(x => x.component);
  if (new Set(names).size !== names.length || names.join('\0') !== [...names].sort((a,b) => a.localeCompare(b)).join('\0')) throw new Error('manifest must be unique and sorted');
  const models = manifest.components.map(entry => {
    const model = validateModel(JSON.parse(fs.readFileSync(path.join(base, entry.file), 'utf8')));
    if (model.component !== entry.component || model.modelDigest !== entry.digest) throw new Error(`manifest mismatch: ${entry.component}`);
    return model;
  });
  if (models.filter(model => model.componentRoot.implementationReady).length !== manifest.implementationReadyCount) throw new Error('implementation-ready count mismatch');
  return {manifest, models};
}
