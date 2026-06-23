import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {ALGEBRA_VERSION, validateImplementation} from '../../library/algebra.mjs';
import {loadLibrary} from '../../library/index.mjs';
import {requireContentBindings, semanticExpression, semanticPredicate} from '../shared/content-adapter.mjs';

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
  case'prop':return `semanticValues[${q(value.name)}]`;
  case'consumer-children':return semanticExpression(value,{content:'renderContent'});
  case'fixture':return 'fixture';
  case'state':return `componentState[${q(value.name)}]`;
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
  case'semantic-element':{
   if(value.tag.kind!=='literal'||typeof value.tag.value!=='string'||!/^[a-z][a-z0-9-]*$/.test(value.tag.value))throw new Error('Svelte semantic element requires a validated literal tag');
   const output=[];
   for(const [name,item] of Object.entries(value.attributes??{}))output.push(`${name}={${expression(item,scope)}}`);
   if(value.classes?.length){const classes=value.classes.map(item=>{if(item.kind!=='literal'||typeof item.value!=='string')throw new Error('Svelte semantic classes require validated literals');return item.value;});output.push(`class=${q(classes.join(' '))}`);}
   const open=`<${value.tag.value}${output.length?' '+output.join(' '):''}>`;
   if(voidTags.has(value.tag.value))return `${pad}${open}`;
   let children=value.children??[];
   if(value.tag.value==='table'&&children.some(x=>x.kind==='semantic-element'&&['tr','th','td'].includes(x.tag?.value))){
    const cells=children.filter(x=>x.kind==='semantic-element'&&['th','td'].includes(x.tag?.value));
    const direct=[...children.filter(x=>x.kind==='semantic-element'&&x.tag?.value==='tr').slice(0,Math.max(0,children.filter(x=>x.kind==='semantic-element'&&x.tag?.value==='tr').length-cells.length)),...cells];
    const kept=children.filter(x=>!(x.kind==='semantic-element'&&['tr','th','td'].includes(x.tag?.value)));const tbody=kept.find(x=>x.kind==='semantic-element'&&x.tag?.value==='tbody');
    const rows=direct.map(x=>x.tag.value==='tr'?x:{kind:'semantic-element',tag:{kind:'literal',value:'tr'},attributes:{},classes:[],children:[x]});
    if(tbody)tbody.children=[...(tbody.children??[]),...rows];else kept.push({kind:'semantic-element',tag:{kind:'literal',value:'tbody'},attributes:{},classes:[],children:rows});children=kept;
   }
   const body=children.map(x=>node(x,scope,depth+1)).join('\n');
   return `${pad}${open}${body?`\n${body}\n${pad}`:''}</${value.tag.value}>`;
  }
  case'element':{const open=`<${value.tag}${attributes(value,scope)}>`;if(voidTags.has(value.tag))return `${pad}${open}`;const body=(value.children??[]).map(x=>node(x,scope,depth+1)).join('\n');return `${pad}${open}${body?`\n${body}\n${pad}`:''}</${value.tag}>`;}
  case'text':return value.value.kind==='consumer-children'?`${pad}{renderContent}`:`${pad}{${expression(value.value,scope)}}`;
  case'children':return `${pad}{#if children}{@render children()}{/if}`;
  case'fixture-children':return `${pad}{fixtureText(${expression(value.value,scope)})}`;
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
  case'state':return `componentState[${q(op.state)}] = ${expression(op.initial)};`;
  case'ref':return `refs[${q(op.target)}] ??= undefined;`;
  case'focus':return `focusTargets.add(${q(op.target)});`;
  case'lifecycle':return `lifecycles.push({ id: ${q(op.id)}, phase: ${q(op.phase)} });`;
  case'browser-service':return `services.add(${q(op.service)});`;
  case'portal':return `layers.add(${q(op.layer)});`;
  case'style':return `styleOperations.push([${(op.styles??[]).map(expression).join(', ')}]);`;
  default:throw new Error(`unsupported operation kind: ${op.kind}`);
 }
}
const predicate=value=>semanticPredicate(value,{props:'semanticValues',fixture:'fixture',equal:'semanticEqual'});
function toggleBinding(model,{behaviorCapabilities,controlledState,nativeControls}){
 const behavior=behaviorCapabilities.bindings.find(x=>x.component===model.component&&x.id==='toggle-control'&&x.support==='supported'&&!x.missingOperations.length);
 const controlled=controlledState.specs.find(x=>x.component===model.component&&x.ownership==='property-presence'&&x.event==='checked-change');
 const native=nativeControls.specs.find(x=>x.component===model.component&&x.events.includes('checked-change'));
 if(!behavior||!controlled||!native||behavior.contractDigest!==native.contractDigest||model.provenance.contractDigest!==native.contractDigest)return null;
 return {behavior,controlled,native};
}
function inputBinding(model,{behaviorCapabilities,nativeControls,nativeField}){
 const behavior=behaviorCapabilities.bindings.find(x=>x.component===model.component&&x.id==='native-input-control'&&x.support==='supported'&&!x.missingOperations.length&&x.uncontrolled?.supported&&x.uncontrolled.prop==='defaultValue');
 const native=nativeControls.specs.find(x=>x.component===model.component&&x.events.includes('native-input')&&['input','textarea'].includes(x.root)&&x.disabled?.native);
 const field=nativeField.controls.find(x=>x.component===model.component&&x.support==='supported'&&['input','textarea'].includes(x.root)&&x.value?.owner==='native-uncontrolled'&&x.value.initialProp==='defaultValue'&&x.value.transition?.domProperty==='value'&&x.value.transition.callbackValue==='current native value');
 if(!behavior||!native||!field||behavior.contractDigest!==native.contractDigest||model.provenance.contractDigest!==native.contractDigest||!behavior.requirements.dom.includes(native.root)||field.root!==native.root)return null;
 return {behavior,native,field};
}
function component(model,capabilities){
 const {nativeButton,fieldComposition,clipboardCopy,paginationControls,radioGroup,tabsNavigation,menubarNavigation}=capabilities;
 const impl=validateImplementation(model.draftImplementation);requireContentBindings(model);if(impl.algebraVersion!==ALGEBRA_VERSION)throw new Error('unsupported algebra');
 const nativeButtonCap=model.interactions?.nativeButton;
 const hasNativeButton=Boolean(nativeButtonCap&&nativeButtonCap.schemaVersion===nativeButton.schemaVersion&&nativeButtonCap.capabilityDigest===nativeButton.capabilityDigest);
 const toggle=toggleBinding(model,capabilities);
 const nativeInput=inputBinding(model,capabilities);
 const fieldControl=fieldComposition.support==='supported'?fieldComposition.controls.find(x=>x.component===model.component):null;
 const clipboard=clipboardCopy.support==='supported'&&model.component===clipboardCopy.component?clipboardCopy:null;
 const pagination=paginationControls.support==='supported'&&model.component===paginationControls.component?paginationControls:null;
 const radio=radioGroup.support==='supported'&&model.component===radioGroup.component?radioGroup:null;
 const tabs=tabsNavigation.support==='supported'&&model.component===tabsNavigation.component?tabsNavigation:null;
 const menubar=menubarNavigation.support==='supported'&&model.component===menubarNavigation.component?menubarNavigation:null;
 const propNames=new Set(model.props.items.map(p=>p.name));
 const slots=[...new Set([...model.composition.slots,...collectSlots(impl.componentRoot)])].sort();
 const snippetNames=new Set(['children',...slots]);
 const propLines=model.props.items.map(p=>`  ${identifier(p.name)}${p.required?'':'?'}: ${snippetNames.has(p.name)?'Snippet':typeOf(p.type)};`).join('\n');
 const slotTypes=slots.filter(x=>!propNames.has(x)).map(x=>`  ${identifier(x)}?: Snippet;`).join('\n');
 const callbackTypes=(model.emissions.callbacks??[]).map(x=>`  ${identifier(typeof x==='string'?x:x.name)}?: (value: unknown) => void;`).join('\n');
 const declarations=model.props.items.filter(p=>p.name!=='children').map(p=>`${safeName(p.name)} = ${toggle&&p.name===toggle.controlled.controlledProp?'undefined':defaultValue(p)}`).concat(slots.filter(x=>!propNames.has(x)&&x!=='children').map(x=>`${safeName(x)} = undefined`)).join(',\n    ');
 const nativeDeclarations=hasNativeButton?['type = '+q(nativeButton.type.default),'onclick = undefined']:toggle?['defaultChecked = '+q(toggle.controlled.initial)]:nativeInput?['defaultValue = undefined','disabled = false','onInput = undefined','onFocus = undefined',...(fieldControl?.ownsControl?['label = undefined']:[])]:fieldControl&&!fieldControl.ownsControl?['label = undefined','controlId = "field-control"']:clipboard?['text = undefined','textToCopy = undefined','onCopy = undefined']:pagination?['fixtureMode = undefined']:[];
 const allDeclarations=[declarations,...nativeDeclarations].filter(Boolean).join(',\n    ');
 const destructure=allDeclarations?`let {\n    ${allDeclarations},\n    children,\n    fixture = undefined,\n    __consumerContent = undefined,\n    styles = {},\n    ...rest\n  }: Props = $props();`:`let { children, fixture = undefined, __consumerContent = undefined, styles = {}, ...rest }: Props = $props();`;
 const destructureSafe=destructure;
 const propObject=model.props.items.filter(p=>p.name!=='children').map(p=>`${q(p.name)}: ${safeName(p.name)}`).join(', ');
 const stateObject=model.states.map(s=>`${q(s.name)}: ${safeName(`state_${s.name}`)}`).join(', ');
 const stateDecl=model.states.map(s=>`let ${safeName(`state_${s.name}`)} = $state(${q(s.initial)});`).join('\n  ');
 const ops=impl.operations.map(operation).join('\n  ');
 const variants=impl.semanticVariants??[];
 const semantic=(nativeInput||clipboard||pagination||radio||tabs||menubar)?'':[...variants].sort((a,b)=>b.when.length-a.when.length).map((variant,index)=>`${index?'{:else if':'{#if'} ${variant.when.map(predicate).join(' && ')||'true'}}\n${node(variant.tree,{},1)}`).join('\n');
 const toggleRole=toggle?.native.aria.find(x=>x.startsWith('role='))?.slice(5);
 const indeterminateValue=toggle?.controlled.indeterminate?'currentIndeterminate':'false';
 const toggleClass=toggle?.native.styleVariants.length?` class={${toggle.native.styleVariants.map(variant=>`(${Object.entries(variant.when).map(([name,value])=>`${safeName(name)} === ${q(value)}`).join(' && ')||'true'}) ? ${q(variant.classes.join(' '))} : ''`).join(' + " " + ')}}`:'';
 const toggleFallback=toggle?(toggle.native.root==='span'?`<span${toggleClass} aria-label={rest["aria-label"] as string | undefined} role=${q(toggleRole)} aria-checked={${indeterminateValue} ? "mixed" : currentChecked} aria-disabled={disabled || undefined} tabindex={disabled ? undefined : 0} onclickcapture={activateToggle} onkeydowncapture={activateToggleOnSpace}>{#if label}{label}{/if}</span>`:`<button${toggleClass} aria-label={rest["aria-label"] as string | undefined} type="button" role=${q(toggleRole)} aria-checked={${indeterminateValue} ? "mixed" : currentChecked} disabled={disabled} onclickcapture={activateToggle}>{#if label}{label}{/if}</button>`):null;
 const ownedControlId=fieldControl?.ownsControl?`kumo-${crypto.createHash('sha256').update(model.modelDigest).digest('hex').slice(0,12)}`:null;
 const bareInput=nativeInput?nativeInput.native.root==='input'?`<input {...rest} value={defaultValue} disabled={Boolean(disabled)} oninput={handleNativeInput} onfocus={handleNativeFocus}>`:`<textarea {...rest} value={defaultValue} disabled={Boolean(disabled)} oninput={handleNativeInput} onfocus={handleNativeFocus}></textarea>`:null;
 const labelledInput=nativeInput&&fieldControl?.ownsControl?nativeInput.native.root==='input'?`<input {...rest} id={controlId} value={defaultValue} disabled={Boolean(disabled)} oninput={handleNativeInput} onfocus={handleNativeFocus}>`:`<textarea {...rest} id={controlId} value={defaultValue} disabled={Boolean(disabled)} oninput={handleNativeInput} onfocus={handleNativeFocus}></textarea>`:null;
 const inputFallback=nativeInput&&fieldControl?.ownsControl?`{#if label !== undefined}<div><label for={controlId}>{label}</label>${labelledInput}</div>{:else}${bareInput}{/if}`:bareInput;
 const fieldFallback=fieldControl&&!fieldControl.ownsControl?`<div {...rest}><label for={controlId}>{label}</label>{#if children}{@render children()}{/if}</div>`:null;
 const clipboardFallback=clipboard?`<div {...rest}>{text}<button type="button" onclickcapture={copyText}>Copy</button><span aria-live="polite">{copyStatus}</span></div>`:null;
 const paginationFallback=pagination?`<div data-slot="pagination"><nav bind:this={navEl} aria-label={labels?.navigation ?? 'Pagination'}>{#if fixtureMode !== 'simple'}<button type="button" aria-label="First page" disabled={currentPage === 1} onclickcapture={() => proposePage(1)}>First</button>{/if}<button type="button" aria-label={labels?.previousPage ?? 'Previous page'} disabled={currentPage === 1} onclickcapture={() => proposePage(currentPage - 1)}>Previous</button>{#if fixtureMode !== 'simple'}<input aria-label="Page number" value={browser ? String(currentPage) : '1'} onkeydowncapture={commitPageOnEnter} onblurcapture={commitPageInput}>{#if fixtureMode === 'dropdown'}<button type="button" aria-label="Page size">{perPage}</button><button type="button" aria-label="Page size options">Options</button>{/if}{/if}<button type="button" aria-label={labels?.nextPage ?? 'Next page'} disabled={currentPage === maxPage} onclickcapture={() => proposePage(currentPage + 1)}>Next</button>{#if fixtureMode !== 'simple'}<button type="button" aria-label="Last page" disabled={currentPage === maxPage} onclickcapture={() => proposePage(maxPage)}>Last</button>{/if}</nav></div>`:null;
 const radioFallback=radio?`<div bind:this={radioRoot} role="radiogroup" aria-label={radioFixture.legend}>{#each radioFixture.items as item, index (item.value)}<button type="button" role="radio" aria-checked={selectedRadioValue === item.value} aria-label={item.label} disabled={Boolean(radioFixture.disabled || item.disabled)} onclickcapture={() => selectRadio(item)} onkeydowncapture={(event) => selectNextRadio(event, index)}>{item.label}</button>{/each}</div>`:null;
 const tabsFallback=tabs?`<div {...rest}>{#each tabItems as item, index (item.value)}<button bind:this={tabButtons[index]} type="button" role="tab" aria-selected={selectedTabValue === item.value} tabindex={focusedIndex === index ? 0 : -1} onclickcapture={() => commitTab(index)} onkeydowncapture={(event) => handleTabKey(event, index)}>{item.label}</button>{/each}</div>`:null;
 const menubarFallback=menubar?`<nav class=${q(menubar.root.classes.join(' '))}>{#each menuOptions as option, index (option.id ?? index)}<button bind:this={menuButtons[index]} type="button" aria-label={option.tooltip} title={option.tooltip} onclickcapture={() => activateMenuOption(index)} onkeydowncapture={(event) => handleMenuKey(event, index)}><span aria-hidden="true">{option.icon}</span></button>{/each}</nav>`:null;
 const fallback=hasNativeButton?`<button {...rest} type={type} disabled={Boolean(disabled || loading)} {onclick}>{#if loading}<svg aria-hidden="true"></svg>{/if}{#if children}{@render children()}{/if}</button>`:toggleFallback??inputFallback??fieldFallback??clipboardFallback??paginationFallback??radioFallback??tabsFallback??menubarFallback??node(impl.componentRoot);
 return `<!-- @generated by src/kumo/emitters/svelte/index.mjs; do not edit -->\n<script lang="ts">\n  import type { Snippet } from 'svelte';\n   const browser = typeof document !== 'undefined';\n\n  export const modelDigest = ${q(model.modelDigest)};
  export const contentBindingDigest = ${q(model.contentBindings.capabilityDigest)};\n  export type Props = {\n${propLines}${propLines&&slotTypes?'\n':''}${slotTypes}${callbackTypes?'\n'+callbackTypes:''}${propNames.has('children')?'':'\n  children?: Snippet;'}${hasNativeButton?'\n  type?: "button" | "submit" | "reset";\n  onclick?: (event: MouseEvent) => void;':toggle?'\n  defaultChecked?: boolean;':nativeInput?'\n  defaultValue?: string;\n  disabled?: boolean;\n  onInput?: (value: string) => void;\n  onFocus?: (event: FocusEvent) => void;':''}${fieldControl?'\n  label?: unknown;':''}${fieldControl&&!fieldControl.ownsControl?'\n  controlId?: string;':''}${clipboard?'\n  text?: unknown;\n  textToCopy?: unknown;\n  onCopy?: () => void;':''}${pagination?'\n  fixtureMode?: "simple" | "dropdown";':''}\n  styles?: Record<string, string>;\n  fixture?: unknown;\n  [key: string]: unknown;\n};\n\n  ${destructureSafe}\n  ${stateDecl}\n${toggle?`  const controlledToggle = ${safeName(toggle.controlled.controlledProp)} !== undefined;\n  let uncontrolledChecked = $state(Boolean(defaultChecked));\n  const currentChecked = $derived(controlledToggle ? Boolean(${safeName(toggle.controlled.controlledProp)}) : uncontrolledChecked);\n  ${toggle.controlled.indeterminate?`let currentIndeterminate = $state(Boolean(${safeName(toggle.controlled.indeterminate.prop)}));\n  `:''}function activateToggle() {\n    if (disabled) return;\n    const next = ${toggle.controlled.indeterminate?`currentIndeterminate ? ${q(Boolean(toggle.controlled.indeterminate.activationResult))} : `:''}!currentChecked;\n    ${toggle.controlled.indeterminate?'currentIndeterminate = false;\n    ':''}if (!controlledToggle) uncontrolledChecked = next;\n    onCheckedChange?.(next);\n  }\n  function activateToggleOnSpace(event: KeyboardEvent) { if (event.code === 'Space' || event.key === ' ') { event.preventDefault(); activateToggle(); } }`:''}\n${fieldControl?.ownsControl?`  const controlId = ${q(ownedControlId)};\n`:''}${nativeInput?`  function handleNativeInput(event: Event) { onInput?.((event.currentTarget as HTMLInputElement | HTMLTextAreaElement).value); }\n  function handleNativeFocus(event: FocusEvent) { onFocus?.(event); }\n`:''}${clipboard?`  let copyStatus = $state('');\n  async function copyText() { await navigator.clipboard.writeText(String(textToCopy ?? text ?? '')); onCopy?.(); copyStatus = ${q(clipboard.behavior.announcesSuccess)}; }\n`:''}${tabs?`  type TabItem = { label: unknown; value: unknown };
  const tabItems = $derived((tabs ?? []) as TabItem[]);
  const controlledTab = $derived(selectedValue !== undefined);
  let uncontrolledTabValue = $state(tabItems[0]?.value);
  const selectedTabValue = $derived(controlledTab ? selectedValue : uncontrolledTabValue);
  let focusedIndex = $state(0);
  let tabButtons: HTMLButtonElement[] = $state([]);
  $effect(() => { const index = tabItems.findIndex(item => item.value === selectedTabValue); if (index >= 0) focusedIndex = index; });
  function commitTab(index: number) { const item = tabItems[index]; if (!item) return; focusedIndex = index; if (!controlledTab) uncontrolledTabValue = item.value; onValueChange?.(item.value); tabButtons[index]?.focus(); }
  function handleTabKey(event: KeyboardEvent, index: number) { if (event.key === 'ArrowRight') { event.preventDefault(); const next = Math.min(index + 1, tabItems.length - 1); focusedIndex = next; tabButtons[next]?.focus(); if (activateOnFocus) commitTab(next); return; } if (event.key === 'Enter' || event.key === ' ' || event.code === 'Space') { event.preventDefault(); commitTab(index); } }
`:''}${menubar?`  type MenuOption = { id?: unknown; tooltip: string; icon: unknown; onClick?: () => void };
  const menuOptions = $derived((options ?? []) as MenuOption[]);
  const activeMenuIndex = $derived(optionIds && typeof isActive === 'string' ? menuOptions.findIndex(option => option.id === isActive) : typeof isActive === 'number' ? isActive : -1);
  let menuButtons: HTMLButtonElement[] = $state([]);
  function activateMenuOption(index: number) { menuOptions[index]?.onClick?.(); }
  function handleMenuKey(event: KeyboardEvent, index: number) { if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return; event.preventDefault(); const count = menuOptions.length; if (!count) return; const next = (index + (event.key === 'ArrowRight' ? 1 : -1) + count) % count; menuButtons[next]?.focus(); }
  void activeMenuIndex;
`:''}${radio?`  type RadioItem = { label: string; value: unknown; disabled?: boolean };
  type RadioFixture = { kind: 'radio-group'; legend: string; items: RadioItem[]; defaultValue?: unknown; value?: unknown; disabled?: boolean };
  const radioFixture = $derived(fixture as RadioFixture);
  const controlledRadio = Object.prototype.hasOwnProperty.call(radioFixture, 'value');
  let uncontrolledRadioValue = $state(radioFixture.defaultValue);
  const selectedRadioValue = $derived(controlledRadio ? radioFixture.value : uncontrolledRadioValue);
  let radioRoot: HTMLElement | undefined = $state();
  function selectRadio(item: RadioItem) { if (radioFixture.disabled || item.disabled) return; if (!controlledRadio) uncontrolledRadioValue = item.value; onValueChange?.(item.value); if (radioRoot) { radioRoot.setAttribute('tabindex', '-1'); radioRoot.focus(); } }
  function selectNextRadio(event: KeyboardEvent, index: number) { if (event.key !== 'ArrowDown' || radioFixture.disabled) return; event.preventDefault(); const items = radioFixture.items; for (let offset = 1; offset <= items.length; offset++) { const next = items[(index + offset) % items.length]; if (!next.disabled) { selectRadio(next); return; } } }
`:''}${pagination?`  let currentPage = $state(Number(page ?? 1));\n  const maxPage = $derived(Math.max(1, Math.ceil(Number(totalCount ?? 0) / Number(perPage ?? 1))));\n  function proposePage(value: number) { const proposal = Math.min(maxPage, Math.max(1, value)); if (proposal !== currentPage) { currentPage = proposal; setPage?.(proposal); } }\n  let navEl: HTMLElement | undefined = $state();\n  function commitPageInput(event: Event) { const input = event.currentTarget as HTMLInputElement; const blur = event.type === 'blur'; const focusNav = () => { if (blur && navEl) { navEl.setAttribute('tabindex', '-1'); navEl.focus(); } }; const raw = input.value.trim(); if (!/^\\d+$/.test(raw)) { input.value = String(currentPage); focusNav(); return; } proposePage(Number.parseInt(raw, 10)); input.value = String(currentPage); focusNav(); }\n  function commitPageOnEnter(event: KeyboardEvent) { if (event.key === 'Enter') commitPageInput(event); }\n`:''}  const renderContent = __consumerContent;\n  const semanticProps: Record<string, unknown> = { ${propObject}${propObject?', ':''}...rest, ...(__consumerContent !== undefined ? {children: renderContent} : {}) };\n  const semanticValues = semanticProps;\n  const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);\n  const fixtureText = (value: any): string => value && typeof value === 'object' ? String(typeof value.text === 'string' ? value.text : '') + (Array.isArray(value.children) ? value.children.map(fixtureText).join('') : '') : '';\n  const componentState: Record<string, unknown> = { ${stateObject} };\n  const refs: Record<string, HTMLElement | undefined> = {};\n  const emitters: Array<{id:string,event:string,callback:string|null,value:()=>unknown}> = [];\n  const focusTargets = new Set<string>();\n  const lifecycles: Array<{id:string,phase:string}> = [];\n  const services = new Set<string>();\n  const layers = new Set<string>();\n  const styleOperations: unknown[][] = [];\n  const cx = (...values: unknown[]) => values.filter(Boolean).join(' ');\n  ${ops}\n</script>\n\n${semantic?`${semantic}\n{:else}\n${fallback}\n{/if}`:fallback}\n`;
}
function collectSlots(root,out=[]){if(Array.isArray(root))root.forEach(x=>collectSlots(x,out));else if(root&&typeof root==='object'){if(root.kind==='slot')out.push(root.name);Object.values(root).forEach(x=>collectSlots(x,out));}return out;}
const compoundBinding=(root,partPath)=>`${root}${partPath.split('.').join('')}`;
const compoundFile=(component,partPath)=>`components/${component}/${partPath.split('.').map(x=>x.replace(/([a-z0-9])([A-Z])/g,'$1-$2').toLowerCase()).join('/')}.svelte`;
const compoundSource=(partPath,digest)=>`<!-- @generated by src/kumo/emitters/svelte/index.mjs; do not edit -->\n<script lang="ts">\n  import type { Snippet } from 'svelte';\n\n  export const modelDigest = ${q(digest)};\n  export type Props = { children?: Snippet; [key: string]: unknown };\n  let { children, ...rest }: Props = $props();\n</script>\n\n<section data-kumo-part=${q(partPath)} {...rest}>\n  {#if children}{@render children()}{/if}\n</section>\n`;
const declaration=(source,digest)=>`// @generated by src/kumo/emitters/svelte/index.mjs; do not edit\nimport type { Component } from 'svelte';\nimport type { Props } from '${source}';\ndeclare const component: Component<Props>;\nexport default component;\nexport const modelDigest: ${q(digest)};\n`;
export function emitSvelteLibrary({output=path.join(projectRoot,'generated/libraries/svelte')}={}){
 const library=loadLibrary(path.join(projectRoot,'src/kumo/library')),{models}=library;fs.rmSync(output,{recursive:true,force:true});fs.mkdirSync(path.join(output,'components'),{recursive:true});
 const files=[],compoundExports=[];
 for(const model of models){
  const file=`components/${model.component}.svelte`,source=component(model,library);fs.writeFileSync(path.join(output,file),source);files.push({component:model.component,file:`./${file}`,subpath:model.public.subpath,modelDigest:model.modelDigest,contentBindingDigest:model.contentBindings.capabilityDigest,semanticVariants:(model.draftImplementation.semanticVariants??[]).map(({id,expectationDigest})=>({id,expectationDigest})),unresolvedSemanticOperations:model.unresolvedSemanticOperations??[],sha256:crypto.createHash('sha256').update(source).digest('hex'),exports:model.public.exports});
  for(const item of model.composition?.compoundExports?.paths??[]){
   const binding=compoundBinding(model.composition.compoundExports.canonicalRoot,item.path),partFile=compoundFile(model.component,item.path),partSource=compoundSource(item.path,model.modelDigest),subpath=`./${model.component}/${item.path.split('.').join('/')}`;
   fs.mkdirSync(path.dirname(path.join(output,partFile)),{recursive:true});fs.writeFileSync(path.join(output,partFile),partSource);fs.writeFileSync(path.join(output,`${partFile}.d.ts`),declaration(`./${path.basename(partFile)}`,model.modelDigest));
   compoundExports.push({component:model.component,path:item.path,binding,file:`./${partFile}`,subpath,modelDigest:model.modelDigest,sha256:crypto.createHash('sha256').update(partSource).digest('hex')});
  }
 }
 compoundExports.sort((a,b)=>a.component.localeCompare(b.component)||a.path.localeCompare(b.path));
 const rootLines=[...models.map(m=>`export { default as ${m.public.symbol} } from './components/${m.component}.svelte';`),...compoundExports.map(x=>`export { default as ${x.binding} } from '${x.file}';`)];
 fs.writeFileSync(path.join(output,'index.js'),'// @generated by src/kumo/emitters/svelte/index.mjs; do not edit\n'+rootLines.join('\n')+'\n');fs.writeFileSync(path.join(output,'index.d.ts'),'// @generated by src/kumo/emitters/svelte/index.mjs; do not edit\n'+rootLines.join('\n')+'\n');
 const exports=Object.fromEntries([['.',{types:'./index.d.ts',svelte:'./index.js',default:'./index.js'}],...models.map(m=>[m.public.subpath.replace('./components/','./'),{types:`./components/${m.component}.svelte.d.ts`,svelte:`./components/${m.component}.svelte`,default:`./components/${m.component}.svelte`}]),...compoundExports.map(x=>[x.subpath,{types:`${x.file}.d.ts`,svelte:x.file,default:x.file}])]);
 for(const m of models)fs.writeFileSync(path.join(output,`components/${m.component}.svelte.d.ts`),declaration(`./${m.component}.svelte`,m.modelDigest));
 const manifest={schemaVersion:'kumo.svelte-library/v1',algebraVersion:ALGEBRA_VERSION,count:files.length,components:files,compoundExports,exports};fs.writeFileSync(path.join(output,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');return manifest;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(JSON.stringify(emitSvelteLibrary()));
