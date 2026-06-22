import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {digest} from './index.mjs';

export const NATIVE_BUTTON_VERSION='kumo.native-button/v1';
const here=path.dirname(fileURLToPath(import.meta.url));

export function deriveNativeButton(contract){
  if(contract.component!=='button'||contract.schemaVersion!=='kumo.observable/v1')throw new Error('native button capability requires canonical Button contract');
  const required=['disabled-click','loading-click','enabled-click','submit-form'];
  const ids=contract.vectors.map(vector=>vector.id);
  for(const id of required)if(!ids.includes(id))throw new Error(`native button vector missing: ${id}`);
  const value={schemaVersion:NATIVE_BUTTON_VERSION,component:'button',root:'button',type:{prop:'type',default:'button'},content:{role:'consumer-content'},nativeAttributes:true,disabledWhen:[{prop:'disabled',equals:true},{prop:'loading',equals:true}],loadingIndicator:{when:{prop:'loading',equals:true},tag:'svg',attributes:{'aria-hidden':'true'},beforeContent:true},events:{click:{native:true,suppressedWhen:['disabled','loading']},submit:{nativeForm:true,when:{prop:'type',equals:'submit'}}},vectorIds:required};
  return {...value,capabilityDigest:digest(value)};
}
export function validateNativeButton(value){
  if(value?.schemaVersion!==NATIVE_BUTTON_VERSION||value.component!=='button'||value.root!=='button')throw new Error('invalid native button capability');
  if(value.type?.prop!=='type'||value.type.default!=='button'||value.content?.role!=='consumer-content'||value.nativeAttributes!==true)throw new Error('invalid native button rendering contract');
  if(value.disabledWhen?.map(item=>item.prop).join(',')!=='disabled,loading'||value.loadingIndicator?.tag!=='svg')throw new Error('invalid native button state contract');
  if(!value.events?.click?.native||!value.events?.submit?.nativeForm||value.vectorIds?.length!==4)throw new Error('invalid native button event contract');
  const {capabilityDigest,...unsigned}=value;if(capabilityDigest!==digest(unsigned))throw new Error('native button capability digest mismatch');return value;
}
export function loadNativeButton(file=path.join(here,'capabilities/native-button.json')){return validateNativeButton(JSON.parse(fs.readFileSync(file,'utf8')))}
