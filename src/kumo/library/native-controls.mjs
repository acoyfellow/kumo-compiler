import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {digest} from './index.mjs';

export const NATIVE_CONTROLS_VERSION = 'kumo.native-controls/v1';
const here = path.dirname(fileURLToPath(import.meta.url));
const unsupported = reason => ({supported:false,reason});

export function deriveNativeControls(contracts) {
  const specs = contracts.map(contract => {
    if (contract.schemaVersion !== 'kumo.observable/v1' || !['checkbox','switch','radio','input','input-area','sensitive-input'].includes(contract.component)) throw new Error('native controls require canonical control contracts');
    const name=contract.component, field=['input','input-area','sensitive-input'].includes(name), toggle=['checkbox','switch'].includes(name);
    return {component:name,contractDigest:digest(contract),root:contract.semantics.root,initialState:contract.initialState,transitions:contract.transitions,events:toggle?['checked-change']:name==='radio'?['value-change']:['native-input'],focus:contract.keyboardFocus,aria:contract.semantics.aria,disabled:field?{native:true,suppresses:['edit','focus']}:{prop:'disabled',suppresses:['transition','event','focus']},fieldWiring:field?{labelActivates:'input',required:true,description:'describedby',error:'describedby',nativeAttributes:true}:unsupported('canonical contract does not establish Field composition'),operations:{autofill:unsupported(contract.unknowns[0].reason),ime:unsupported(contract.unknowns[0].reason),selection:unsupported(contract.unknowns[0].reason),rtl:unsupported(contract.unknowns[0].reason)},vectorIds:contract.vectors.map(x=>x.id)};
  }).sort((a,b)=>a.component.localeCompare(b.component));
  const value={schemaVersion:NATIVE_CONTROLS_VERSION,specs}; return {...value,capabilityDigest:digest(value)};
}
export function validateNativeControls(value) {
  if(value?.schemaVersion!==NATIVE_CONTROLS_VERSION||!Array.isArray(value.specs)||value.specs.length!==6)throw new Error('invalid native controls capability');
  for(const spec of value.specs){if(!spec.component||!spec.contractDigest?.match(/^[a-f0-9]{64}$/)||!spec.root||!spec.transitions?.length||!spec.events?.length||!spec.vectorIds?.length)throw new Error('invalid native control specification'); for(const operation of Object.values(spec.operations??{}))if(operation.supported!==false||!operation.reason)throw new Error('unsupported operations must fail closed');}
  const {capabilityDigest,...unsigned}=value;if(capabilityDigest!==digest(unsigned))throw new Error('native controls capability digest mismatch');return value;
}
export function loadNativeControls(file=path.join(here,'capabilities/native-controls.json')){return validateNativeControls(JSON.parse(fs.readFileSync(file,'utf8')))}
