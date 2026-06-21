import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {digest} from './index.mjs';

export const CONTENT_BINDINGS_VERSION = 'kumo.content-bindings/v1';
export const CONTENT_ROLES = Object.freeze(['consumer-content','compound-slot','fixture-children']);
export const BINDING_MODES = Object.freeze(['content','slot','collection']);
const here=path.dirname(fileURLToPath(import.meta.url));
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

export function deriveContentBindings() {
  const unsigned={schemaVersion:CONTENT_BINDINGS_VERSION,bindings:[
    {role:'consumer-content',mode:'content',expression:{kind:'consumer-children',contentRole:'consumer-content'}},
    {role:'compound-slot',mode:'slot',expression:{kind:'slot-content'}},
    {role:'fixture-children',mode:'collection',expression:{kind:'fixture'}},
  ]};
  return {...unsigned,capabilityDigest:digest(unsigned)};
}
export function validateContentBindings(capability) {
  if(capability?.schemaVersion!==CONTENT_BINDINGS_VERSION) throw new Error('unknown content binding schema');
  if(!Array.isArray(capability.bindings)) throw new Error('content bindings required');
  const roles=new Set();
  for(const binding of capability.bindings){
    if(!object(binding)||!CONTENT_ROLES.includes(binding.role)||!BINDING_MODES.includes(binding.mode)||!object(binding.expression)) throw new Error('unknown content role or binding mode');
    if(roles.has(binding.role)) throw new Error(`ambiguous content allocation: ${binding.role}`);
    roles.add(binding.role);
  }
  if(roles.size!==CONTENT_ROLES.length) throw new Error('content binding capability is incomplete');
  const {capabilityDigest,...unsigned}=capability;
  if(capabilityDigest!==digest(unsigned)) throw new Error('content binding digest mismatch');
  return capability;
}
export function resolveContentBinding(capability,role,{predicateSource}={}) {
  validateContentBindings(capability);
  const matches=capability.bindings.filter(binding=>binding.role===role);
  if(matches.length!==1) throw new Error(matches.length?'ambiguous content allocation':`unknown content role: ${role}`);
  const binding=structuredClone(matches[0]);
  if(role==='consumer-content') {
    if(!object(predicateSource)||!['prop-equals','fixture-equals'].includes(predicateSource.kind)) throw new Error('consumer content requires explicit predicate source');
    binding.expression.predicateSource=structuredClone(predicateSource);
  }
  return binding;
}
export function loadContentBindings(file=path.join(here,'capabilities/content-bindings.json')){return validateContentBindings(JSON.parse(fs.readFileSync(file,'utf8')))}
export function expressionMatchesPredicate(expression,predicate){return expression?.predicateSource&&same(expression.predicateSource,predicate)}
