import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {digest} from './index.mjs';
import {buttonVariants} from '@cloudflare/kumo/components/button';

export const NATIVE_BUTTON_VERSION='kumo.native-button/v1';
const here=path.dirname(fileURLToPath(import.meta.url));

// Canonical Kumo variant prop values, in the order @cloudflare/kumo declares them.
// `danger` is an authored alias for `destructive` (same real Kumo danger classes).
const CANONICAL_VARIANTS=['primary','secondary','ghost','destructive','secondary-destructive','outline'];
const VARIANT_ALIASES={danger:'destructive'};
const DEFAULT_VARIANT='secondary';

// Derive the real per-variant class string straight from @cloudflare/kumo's
// canonical `buttonVariants` (the CVA-style variant->class map). Not faked,
// not inline styles, not invented: this is the same function React Kumo ships.
function deriveStyleVariants(contract){
  const styleVariants=CANONICAL_VARIANTS.map(variant=>({when:{variant},classes:buttonVariants({variant}).split(/\s+/).filter(Boolean)}));
  for(const [alias,target] of Object.entries(VARIANT_ALIASES))styleVariants.push({when:{variant:alias},classes:buttonVariants({variant:target}).split(/\s+/).filter(Boolean)});
  // Prove the emitted classes are the real Kumo tokens the contract asserts.
  const expected=new Map();
  for(const vector of contract.vectors){const v=vector.props?.variant;const inc=vector.expected?.root?.classes?.includes;if(v&&Array.isArray(inc))for(const cls of inc)if(cls.startsWith('bg-kumo-'))expected.set(v,cls);}
  for(const [variant,cls] of expected){const entry=styleVariants.find(item=>item.when.variant===variant);if(!entry||!entry.classes.includes(cls))throw new Error(`native button styleVariants drift: variant ${variant} must include real Kumo class ${cls}`);}
  return styleVariants;
}

export function deriveNativeButton(contract){
  if(contract.component!=='button'||contract.schemaVersion!=='kumo.observable/v1')throw new Error('native button capability requires canonical Button contract');
  const required=['disabled-click','loading-click','enabled-click','submit-form'];
  const ids=contract.vectors.map(vector=>vector.id);
  for(const id of required)if(!ids.includes(id))throw new Error(`native button vector missing: ${id}`);
  const styleVariants=deriveStyleVariants(contract);
  const value={schemaVersion:NATIVE_BUTTON_VERSION,component:'button',root:'button',type:{prop:'type',default:'button'},content:{role:'consumer-content'},nativeAttributes:true,disabledWhen:[{prop:'disabled',equals:true},{prop:'loading',equals:true}],loadingIndicator:{when:{prop:'loading',equals:true},tag:'svg',attributes:{'aria-hidden':'true'},beforeContent:true},styleVariants,styleVariantProp:'variant',defaultVariant:DEFAULT_VARIANT,events:{click:{native:true,suppressedWhen:['disabled','loading']},submit:{nativeForm:true,when:{prop:'type',equals:'submit'}}},vectorIds:required};
  return {...value,capabilityDigest:digest(value)};
}
export function validateNativeButton(value){
  if(value?.schemaVersion!==NATIVE_BUTTON_VERSION||value.component!=='button'||value.root!=='button')throw new Error('invalid native button capability');
  if(value.type?.prop!=='type'||value.type.default!=='button'||value.content?.role!=='consumer-content'||value.nativeAttributes!==true)throw new Error('invalid native button rendering contract');
  if(value.disabledWhen?.map(item=>item.prop).join(',')!=='disabled,loading'||value.loadingIndicator?.tag!=='svg')throw new Error('invalid native button state contract');
  if(!value.events?.click?.native||!value.events?.submit?.nativeForm||value.vectorIds?.length!==4)throw new Error('invalid native button event contract');
  if(!Array.isArray(value.styleVariants)||!value.styleVariants.length||value.styleVariantProp!=='variant'||!value.styleVariants.some(item=>item.when?.variant===value.defaultVariant&&Array.isArray(item.classes)&&item.classes.length))throw new Error('invalid native button style variant contract');
  const {capabilityDigest,...unsigned}=value;if(capabilityDigest!==digest(unsigned))throw new Error('native button capability digest mismatch');return value;
}
export function loadNativeButton(file=path.join(here,'capabilities/native-button.json')){return validateNativeButton(JSON.parse(fs.readFileSync(file,'utf8')))}
