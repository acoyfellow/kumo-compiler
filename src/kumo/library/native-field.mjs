import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {digest} from './index.mjs';

export const NATIVE_FIELD_VERSION = 'kumo.native-field/v1';
const here = path.dirname(fileURLToPath(import.meta.url));
const CONTRACT_VERSION = 'kumo.observable/v1';
const COMPONENTS = ['field','input','input-area','sensitive-input'];
const blocker = (field, reason) => ({field,status:'unknown',reason});

function provenance(contract) {
  return {component:contract.component,contractPath:`contracts/kumo.observable/v1/components/${contract.component}.json`,contractDigest:digest(contract),vectorIds:contract.vectors.map(vector=>vector.id)};
}

export function deriveNativeField(contracts) {
  const byName = new Map(contracts.map(contract=>[contract.component,contract]));
  for (const name of COMPONENTS) if (byName.get(name)?.schemaVersion !== CONTRACT_VERSION) throw new Error(`${name} canonical contract required`);
  const field=byName.get('field'), input=byName.get('input'), area=byName.get('input-area'), sensitive=byName.get('sensitive-input');
  const valueUnknown = blocker('controlledValueOwnership','Canonical contracts observe native edits and callbacks but do not establish a controlled value prop, prop-to-DOM synchronization, or conflict policy.');
  const vendorUnknown = input.unknowns[0];
  const value = {
    schemaVersion:NATIVE_FIELD_VERSION,
    controls:[
      {component:'input',root:'input',support:'supported',value:{owner:'native-uncontrolled',initialProp:'defaultValue',transition:{trigger:'trusted native typing',domProperty:'value',callbackValue:'current native value'}},disabled:{nativeAttribute:true,observedDefaultValue:'x'},vectors:input.vectors.map(v=>v.id)},
      {component:'input-area',root:'textarea',support:'supported',value:{owner:'native-uncontrolled',initialProp:'defaultValue',transition:{trigger:'trusted native typing',domProperty:'value',callbackValue:'current native value'}},disabled:{observed:false,reason:'No canonical input-area disabled vector.'},vectors:area.vectors.map(v=>v.id)},
      {component:'sensitive-input',root:'div',nativeControl:'input',support:'requirements-only',value:{owner:'native-uncontrolled',initialProp:'defaultValue',transition:{trigger:'trusted native typing',domProperty:'value',callbackValue:'current native value'}},sensitive:{initialVisibility:'masked',escapeVisibility:'masked',copy:{trigger:'trusted copy-button activation',value:'current native value',callback:'copy',announcement:'Value hiddenCopied to clipboard'},boundaries:['clipboard write success is observed','rejection and permission behavior are unknown','reveal control semantics and intermediate type are unknown']},vectors:sensitive.vectors.map(v=>v.id)}
    ],
    wiring:{support:'requirements-only',container:'div',label:{activates:'native control',mechanism:'id/for association required'},required:{prop:true},describedBy:{description:'control aria-describedby target',error:'control aria-describedby target'},vectors:[...field.vectors,...input.vectors.filter(v=>v.id==='field-label'),...area.vectors.filter(v=>v.id==='field-error')].map(v=>`${v.id}`)},
    blockers:[valueUnknown,blocker('fieldGeneratedIds','Canonical vectors establish label focus and an explicit field-control id fixture, but do not expose generated id values, precedence, uniqueness, or exact for/aria-describedby serialization.'),blocker('requiredSerialization','Required composition is observed, but exact native required and aria-required serialization is not captured.'),blocker('descriptionErrorCombination','Description and error are observed separately; ordering, simultaneous IDs, and error precedence are not established.'),blocker('sensitiveRevealSemantics','Reveal activation is observed only as part of a sequence ending masked; reveal button naming, intermediate input type, and focus behavior are not established.'),blocker('sensitiveClipboardFailure','Clipboard permission, rejection, failure callbacks, and announcement lifecycle are not established.'),{...vendorUnknown}],
    provenance:COMPONENTS.map(name=>provenance(byName.get(name)))
  };
  return {...value,capabilityDigest:digest(value)};
}

export function validateNativeField(value) {
  if (value?.schemaVersion!==NATIVE_FIELD_VERSION || !Array.isArray(value.controls) || value.controls.map(x=>x.component).join(',')!=='input,input-area,sensitive-input') throw new Error('invalid native-field capability');
  for (const control of value.controls) if (!control.vectors?.length || !['supported','requirements-only'].includes(control.support)) throw new Error(`${control.component}: vector-backed support required`);
  if (value.wiring?.support!=='requirements-only' || !value.wiring.vectors?.length) throw new Error('field wiring must retain vector-backed blockers');
  if (!value.blockers?.length || value.blockers.some(x=>!x.field||!x.status||!x.reason)) throw new Error('native-field explicit blockers required');
  const {capabilityDigest,...unsigned}=value;
  if (capabilityDigest!==digest(unsigned)) throw new Error('native-field capability digest mismatch');
  return value;
}

export function loadNativeField(file=path.join(here,'capabilities/native-field.json')) { return validateNativeField(JSON.parse(fs.readFileSync(file,'utf8'))); }
