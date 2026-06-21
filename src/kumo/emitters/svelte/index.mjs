import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {ALGEBRA_VERSION, validateImplementation} from '../../library/algebra.mjs';
import {loadLibrary} from '../../library/index.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const projectRoot=path.resolve(here,'../../../..');
const q=value=>JSON.stringify(value);
const identifier=value=>/^[$A-Z_a-z][$\w]*$/.test(value)?value:q(value);
const safeName=value=>value.replace(/[^A-Za-z0-9_$]/g,'_').replace(/^[^A-Za-z_$]/,'_$&');
const typeOf=type=>/boolean/.test(type)?'boolean':/number|Date/.test(type)?'number':'unknown';
const defaultValue=item=>item.default===null||item.default===undefined?'undefined':q(item.default);

function expression(value,scope={}) {
 switch(value.kind){
  case'literal':return q(value.value);
  case'prop':return `props[${q(value.name)}]`;
  case'state':return `state[${q(value.name)}]`;
  case'item':return `${scope[value.name]??safeName(value.name)}`;
  case'coalesce':return `(${value.values.map(x=>expression(x,scope)).join(' ?? ')})`;
  case'equals':return `(${expression(value.left,scope)} === ${expression(value.right,scope)})`;
  case'not':return `!(${expression(value.value,scope)})`;
  case'concat':return `[${value.values.map(x=>expression(x,scope)).join(', ')}].join(${q(value.separator??'')})`;
  case'style-ref':return `styles[${q(value.name)}]`;
  default:throw new Error(`unsupported expression kind: ${value.kind}`);
 }
}
function attributes(node,scope){
 const output=[];
 for(const [name,value] of Object.entries(node.attributes??{})) output.push(`${name}={${expression(value,scope)}}`);
 for(const [name,value] of Object.entries(node.properties??{})) output.push(`${name}={${expression(value,scope)}}`);
 for(const [name,value] of Object.entries(node.events??{})) output.push(`${name}={${expression(value,scope)}}`);
 if(node.ref) output.push(`bind:this={refs[${q(node.ref)}]}`);
 if(node.styles?.length) output.push(`class={cx(${node.styles.map(x=>expression(x,scope)).join(', ')})}`);
 return output.length?' '+output.join(' '):'';
}
const voidTags=new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
function node(value,scope={},depth=0){
 const pad='  '.repeat(depth);
 switch(value.kind){
  case'element':{const open=`<${value.tag}${attributes(value,scope)}>`;if(voidTags.has(value.tag))return `${pad}${open}`;const body=(value.children??[]).map(x=>node(x,scope,depth+1)).join('\n');return `${pad}${open}${body?`\n${body}\n${pad}`:''}</${value.tag}>`;}
  case'text':return `${pad}{${expression(value.value,scope)}}`;
  case'children':return `${pad}{#if children}{@render children()}{/if}`;
  case'slot':{const name=safeName(value.name);const fallback=value.fallback?`{:else}\n${node(value.fallback,scope,depth+1)}\n${pad}`:'';return `${pad}{#if ${name}}{@render ${name}()}${fallback}{/if}`;}
  case'condition':return `${pad}{#if ${expression(value.when,scope)}}\n${node(value.then,scope,depth+1)}${value.else?`\n${pad}{:else}\n${node(value.else,scope,depth+1)}`:''}\n${pad}{/if}`;
  case'collection':{const item=safeName(value.item);return `${pad}{#each (${expression(value.source,scope)} ?? []) as ${item} (${expression(value.key,{...scope,[value.item]:item})})}\n${node(value.template,{...scope,[value.item]:item},depth+1)}\n${pad}{/each}`;}
  case'compound':return Object.entries(value.parts).map(([name,part])=>`${pad}<section data-kumo-part=${q(name)}>\n${node(part,scope,depth+1)}\n${pad}</section>`).join('\n');
  case'portal':return `${pad}{#if browser}\n${pad}  <div data-kumo-portal-target={${expression(value.target,scope)}} data-kumo-layer=${q(value.layer)}>\n${value.children.map(x=>node(x,scope,depth+2)).join('\n')}\n${pad}  </div>\n${pad}{/if}`;
  default:throw new Error(`unsupported node kind: ${value.kind}`);
 }
}
function operation(op){
 switch(op.kind){
  case'render':return `void ${q(op.id)};`;
  case'emit':return `emitters.push({ id: ${q(op.id)}, event: ${q(op.event)}, callback: ${q(op.callback??null)}, value: () => ${expression(op.value)} });`;
  case'state':return `state[${q(op.state)}] = ${expression(op.initial)};`;
  case'ref':return `refs[${q(op.target)}] ??= undefined;`;
  case'focus':return `focusTargets.add(${q(op.target)});`;
  case'lifecycle':return `lifecycles.push({ id: ${q(op.id)}, phase: ${q(op.phase)} });`;
  case'browser-service':return `services.add(${q(op.service)});`;
  case'portal':return `layers.add(${q(op.layer)});`;
  case'style':return `styleOperations.push([${(op.styles??[]).map(expression).join(', ')}]);`;
  default:throw new Error(`unsupported operation kind: ${op.kind}`);
 }
}
function component(model){
 const impl=validateImplementation(model.draftImplementation);if(impl.algebraVersion!==ALGEBRA_VERSION)throw new Error('unsupported algebra');
 const propNames=new Set(model.props.items.map(p=>p.name));
 const slots=[...new Set([...model.composition.slots,...collectSlots(impl.componentRoot)])].sort();
 const snippetNames=new Set(['children',...slots]);
 const propLines=model.props.items.map(p=>`  ${identifier(p.name)}${p.required?'':'?'}: ${snippetNames.has(p.name)?'Snippet':typeOf(p.type)};`).join('\n');
 const slotTypes=slots.filter(x=>!propNames.has(x)).map(x=>`  ${identifier(x)}?: Snippet;`).join('\n');
 const callbackTypes=(model.emissions.callbacks??[]).map(x=>`  ${identifier(typeof x==='string'?x:x.name)}?: (value: unknown) => void;`).join('\n');
 const declarations=model.props.items.filter(p=>p.name!=='children').map(p=>`${safeName(p.name)} = ${defaultValue(p)}`).concat(slots.filter(x=>!propNames.has(x)&&x!=='children').map(x=>`${safeName(x)} = undefined`)).join(',\n    ');
 const destructure=declarations?`let {\n    ${declarations},\n    children,\n    styles = {},\n    ...rest\n  }: Props = $props();`:`let { children, styles = {}, ...rest }: Props = $props();`;
 const propObject=model.props.items.map(p=>`${q(p.name)}: ${safeName(p.name)}`).join(', ');
 const stateObject=model.states.map(s=>`${q(s.name)}: ${safeName(`state_${s.name}`)}`).join(', ');
 const stateDecl=model.states.map(s=>`let ${safeName(`state_${s.name}`)} = $state(${q(s.initial)});`).join('\n  ');
 const ops=impl.operations.map(operation).join('\n  ');
 return `<script lang="ts">\n  import type { Snippet } from 'svelte';\n   const browser = typeof document !== 'undefined';\n\n  export const modelDigest = ${q(model.modelDigest)};\n  export type Props = {\n${propLines}${propLines&&slotTypes?'\n':''}${slotTypes}${callbackTypes?'\n'+callbackTypes:''}${propNames.has('children')?'':'\n  children?: Snippet;'}\n  styles?: Record<string, string>;\n  [key: string]: unknown;\n};\n\n  ${destructure}\n  ${stateDecl}\n  const props: Record<string, unknown> = { ${propObject} };\n  const state: Record<string, unknown> = { ${stateObject} };\n  const refs: Record<string, HTMLElement | undefined> = {};\n  const emitters: Array<{id:string,event:string,callback:string|null,value:()=>unknown}> = [];\n  const focusTargets = new Set<string>();\n  const lifecycles: Array<{id:string,phase:string}> = [];\n  const services = new Set<string>();\n  const layers = new Set<string>();\n  const styleOperations: unknown[][] = [];\n  const cx = (...values: unknown[]) => values.filter(Boolean).join(' ');\n  ${ops}\n</script>\n\n${node(impl.componentRoot)}\n`;
}
function collectSlots(root,out=[]){if(Array.isArray(root))root.forEach(x=>collectSlots(x,out));else if(root&&typeof root==='object'){if(root.kind==='slot')out.push(root.name);Object.values(root).forEach(x=>collectSlots(x,out));}return out;}
export function emitSvelteLibrary({output=path.join(projectRoot,'generated/libraries/svelte')}={}){
 const {models}=loadLibrary(path.join(projectRoot,'src/kumo/library'));fs.rmSync(output,{recursive:true,force:true});fs.mkdirSync(path.join(output,'components'),{recursive:true});
 const files=[];for(const model of models){const file=`components/${model.component}.svelte`,source=component(model);fs.writeFileSync(path.join(output,file),source);files.push({component:model.component,file:`./${file}`,subpath:model.public.subpath,modelDigest:model.modelDigest,sha256:crypto.createHash('sha256').update(source).digest('hex'),exports:model.public.exports});}
 const index=models.map(m=>`export { default as ${m.public.symbol} } from './components/${m.component}.svelte';`).join('\n')+'\n';fs.writeFileSync(path.join(output,'index.js'),index);
 const declarations=models.map(m=>`export { default as ${m.public.symbol} } from './components/${m.component}.svelte';`).join('\n')+'\n';fs.writeFileSync(path.join(output,'index.d.ts'),declarations);
 const exports=Object.fromEntries([['.',{types:'./index.d.ts',svelte:'./index.js',default:'./index.js'}],...models.map(m=>[m.public.subpath.replace('./components/','./'),{types:`./components/${m.component}.svelte.d.ts`,svelte:`./components/${m.component}.svelte`,default:`./components/${m.component}.svelte`}])]);
 for(const m of models)fs.writeFileSync(path.join(output,`components/${m.component}.svelte.d.ts`),`import type { Component } from 'svelte';\nimport type { Props } from './${m.component}.svelte';\ndeclare const component: Component<Props>;\nexport default component;\nexport const modelDigest: ${q(m.modelDigest)};\n`);
 const manifest={schemaVersion:'kumo.svelte-library/v1',algebraVersion:ALGEBRA_VERSION,count:files.length,components:files,exports};fs.writeFileSync(path.join(output,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');return manifest;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(JSON.stringify(emitSvelteLibrary()));
