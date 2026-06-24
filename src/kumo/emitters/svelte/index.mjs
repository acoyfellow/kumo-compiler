import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {ALGEBRA_VERSION, validateImplementation} from '../../library/algebra.mjs';
import {loadLibrary} from '../../library/index.mjs';
import {requireContentBindings, semanticExpression, semanticPredicate} from '../shared/content-adapter.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const projectRoot=path.resolve(here,'../../../..');
const visualContract=JSON.parse(fs.readFileSync(path.join(projectRoot,'generated/visual-contract.json'),'utf8'));
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
 const {nativeButton,fieldComposition,clipboardCopy,paginationControls,radioGroup,tabsNavigation,menubarNavigation,dialogLayer,popoverLayer,dropdownMenuLayer,inputGroupComposition,sensitiveInput,comboboxCollection,autocompleteCollection,commandPalette,toastLifecycle,dateRange,responsiveSidebar,collectionListbox}=capabilities;
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
 const dialog=dialogLayer.support==='supported'&&model.component===dialogLayer.component?dialogLayer:null;
 const popover=popoverLayer.support==='supported'&&model.component===popoverLayer.component?popoverLayer:null;
 const dropdown=dropdownMenuLayer.support==='supported'&&model.component===dropdownMenuLayer.component?dropdownMenuLayer:null;
 const inputGroup=inputGroupComposition.support==='supported'&&model.component===inputGroupComposition.component?inputGroupComposition:null;
 const sensitive=sensitiveInput.support==='supported'&&model.component===sensitiveInput.component?sensitiveInput:null;
 const combobox=comboboxCollection.support==='supported'&&model.component===comboboxCollection.component&&comboboxCollection.root?.tag==='input'&&['.TriggerInput','.Content','.List','.Item'].every(part=>comboboxCollection.api?.compound?.includes(part))?comboboxCollection:null;
 const autocomplete=autocompleteCollection.support==='supported'&&model.component===autocompleteCollection.component&&autocompleteCollection.root?.tag==='input'&&['.InputGroup','.Content','.List','.Item'].every(part=>autocompleteCollection.api?.compound?.includes(part))?autocompleteCollection:null;
 const palette=commandPalette.support==='supported'&&model.component===commandPalette.component?commandPalette:null;
 const toasty=toastLifecycle.observableImplementation?.support==='supported'&&model.component===toastLifecycle.component?toastLifecycle.observableImplementation:null;
 const datePicker=dateRange.observableImplementation?.datePicker?.support==='supported'&&model.component==='date-picker'?dateRange.observableImplementation.datePicker:null;
 const dateRangePicker=dateRange.observableImplementation?.dateRangePicker?.support==='supported'&&model.component==='date-range-picker'?dateRange.observableImplementation.dateRangePicker:null;
 const sidebar=responsiveSidebar.observableImplementation?.support==='supported'&&model.component===responsiveSidebar.component?responsiveSidebar.observableImplementation:null;
 const select=collectionListbox.observableImplementation?.select?.support==='supported'&&model.component==='select'?collectionListbox.observableImplementation.select:null;
 const tableOfContents=model.component==='table-of-contents';
 const visualSimple=['badge','label','link','text'].includes(model.component)?visualContract.components[model.component]:null;
 const propNames=new Set(model.props.items.map(p=>p.name));
 const slots=[...new Set([...model.composition.slots,...collectSlots(impl.componentRoot)])].sort();
 const snippetNames=new Set(['children',...slots]);
 const propLines=model.props.items.map(p=>`  ${identifier(p.name)}${p.required?'':'?'}: ${snippetNames.has(p.name)?'Snippet':typeOf(p.type)};`).join('\n');
 const slotTypes=slots.filter(x=>!propNames.has(x)).map(x=>`  ${identifier(x)}?: Snippet;`).join('\n');
 const callbackTypes=(model.emissions.callbacks??[]).map(x=>`  ${identifier(typeof x==='string'?x:x.name)}?: (value: unknown) => void;`).join('\n');
 const declarations=model.props.items.filter(p=>p.name!=='children').map(p=>`${safeName(p.name)} = ${toggle&&p.name===toggle.controlled.controlledProp?'undefined':defaultValue(p)}`).concat(slots.filter(x=>!propNames.has(x)&&x!=='children').map(x=>`${safeName(x)} = undefined`)).join(',\n    ');
 const nativeDeclarations=hasNativeButton?['type = '+q(nativeButton.type.default),'onclick = undefined']:sidebar?['onOpenChange = undefined','onWidthChange = undefined']:select?['value = undefined','defaultValue = undefined','open = undefined','defaultOpen = false','multiple = false','onValueChange = undefined','onOpenChange = undefined']:popover?['open = undefined','defaultOpen = false','onOpenChange = undefined']:dropdown?['onOpenChange = undefined','onSelect = undefined']:toasty?['onNotify = undefined','onAction = undefined']:dateRangePicker?['onStartChange = undefined','onEndChange = undefined']:datePicker?['selectedDate = undefined','defaultMonthDate = undefined','disabledBeforeDate = undefined','disabledAfterDate = undefined']:toggle?['defaultChecked = '+q(toggle.controlled.initial)]:nativeInput?['defaultValue = undefined','disabled = false','onInput = undefined','onFocus = undefined',...(fieldControl?.ownsControl?['label = undefined']:[])]:fieldControl&&!fieldControl.ownsControl?['label = undefined','controlId = "field-control"']:clipboard?['text = undefined','textToCopy = undefined','onCopy = undefined']:pagination?['fixtureMode = undefined']:dialog?['open = undefined','defaultOpen = false','onOpenChange = undefined','triggerText = "Open"','title = "Dialog"','description = undefined','closeText = "Close"']:popover?[]:sensitive?['label = undefined','defaultValue = undefined','onValueChange = undefined','onCopy = undefined']:(combobox||autocomplete)?['onOpenChange = undefined','onValueChange = undefined']:palette?['onOpenChange = undefined','onValueChange = undefined','onHighlightChange = undefined']:[];
 const allDeclarations=[declarations,...nativeDeclarations].filter(Boolean).join(',\n    ');
 const destructure=allDeclarations?`let {\n    ${allDeclarations},\n    children,\n    fixture = undefined,\n    __consumerContent = undefined,\n    styles = {},\n    ...rest\n  }: Props = $props();`:`let { children, fixture = undefined, __consumerContent = undefined, styles = {}, ...rest }: Props = $props();`;
 const destructureSafe=destructure;
 const propObject=model.props.items.filter(p=>p.name!=='children').map(p=>`${q(p.name)}: ${safeName(p.name)}`).join(', ');
 const stateObject=model.states.map(s=>`${q(s.name)}: ${safeName(`state_${s.name}`)}`).join(', ');
 const stateDecl=model.states.map(s=>`let ${safeName(`state_${s.name}`)} = $state(${q(s.initial)});`).join('\n  ');
 const ops=impl.operations.map(operation).join('\n  ');
 const variants=impl.semanticVariants??[];
 const semantic=(nativeInput||clipboard||pagination||radio||tabs||menubar||dialog||popover||dropdown||inputGroup||sensitive||combobox||autocomplete||palette||toasty||datePicker||dateRangePicker||sidebar||select||tableOfContents)?'':[...variants].sort((a,b)=>b.when.length-a.when.length).map((variant,index)=>`${index?'{:else if':'{#if'} ${variant.when.map(predicate).join(' && ')||'true'}}\n${node(variant.tree,{},1)}`).join('\n');
 const toggleRole=toggle?.native.aria.find(x=>x.startsWith('role='))?.slice(5);
 const indeterminateValue=toggle?.controlled.indeterminate?'currentIndeterminate':'false';
 const toggleClass=toggle?.native.styleVariants.length?` class={${toggle.native.styleVariants.map(variant=>`(${Object.entries(variant.when).map(([name,value])=>`${safeName(name)} === ${q(value)}`).join(' && ')||'true'}) ? ${q(variant.classes.join(' '))} : ''`).join(' + " " + ')}}`:'';
 const visualSimpleFallback=visualSimple?`<${visualSimple.root.tag} {...rest} class=${q(visualSimple.root.className)}>{#if children}{@render children()}{/if}</${visualSimple.root.tag}>`:null;
 const tocFallback=tableOfContents?`<nav aria-label={String(tocFixture?.props?.['aria-label'] ?? 'Table of contents')}>{#if tocTitle}<p>{tocTitle}</p>{/if}<ul>{#each tocItems as item (item.href)}{#if item.group}<a href={item.href} aria-current={item.active ? 'location' : undefined}>{item.label}</a>{:else}<li><a href={item.href} aria-current={item.active ? 'location' : undefined}>{item.label}</a></li>{/if}{/each}</ul></nav>`:null;
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
 const inputGroupFallback=inputGroup?`<div data-kumo-component="InputGroup"><label for={inputGroupId}>{inputGroupFixture.label}</label>{#if inputGroupFixture.description !== undefined}<p>{inputGroupFixture.description}</p>{/if}{#each inputGroupFixture.children as part, index (part.export ?? index)}{#if part.export === '.Addon'}<span data-kumo-part="Addon">{inputGroupText(part)}</span>{:else if part.export === '.Input'}<input id={inputGroupId} aria-label={part.props?.['aria-label'] as string | undefined} disabled={Boolean(part.props?.disabled)} value={inputGroupValue} oninput={handleInputGroupInput}>{:else if part.export === '.Button'}<button type="button" data-variant={part.props?.variant as string | undefined}>{inputGroupText(part)}</button>{:else if part.export === '.Suffix'}<span data-kumo-part="Suffix">{inputGroupText(part)}</span>{/if}{/each}</div>`:null;
 const sensitiveFallback=sensitive?`<div data-kumo-component="SensitiveInput"><div data-kumo-part="masked-container" onclick={revealSensitive}>{#if sensitiveRevealed}{sensitiveValue}{:else}Value hidden{/if}</div><input bind:this={sensitiveInputElement} type="password" value={sensitiveValue} aria-label={label as string | undefined} oninput={editSensitive} onkeydown={hideSensitiveOnEscape}><button type="button" onclick={revealSensitive}>Reveal</button><button type="button" onclick={copySensitive}>Copy</button><div aria-live="polite">{sensitiveStatus}</div></div>`:null;
 const comboboxFallback=combobox?`<div data-kumo-component="Combobox"><input bind:this={comboboxInput} role="combobox" aria-expanded={comboboxOpen} placeholder={comboboxFixture.placeholder} value={comboboxValue} onclick={openCombobox} onkeydown={handleComboboxKey}>{#if comboboxOpen}<ul role="listbox">{#each comboboxFixture.items as item, index (item.value)}<li role="option" data-value={item.value} aria-selected={highlightedIndex === index}>{item.label}</li>{/each}</ul>{/if}</div>`:null;
 const autocompleteFallback=autocomplete?`<input bind:this={autocompleteInput} role="combobox" aria-expanded={autocompleteOpen} placeholder={autocompleteFixture.placeholder} value={autocompleteValue} oninput={handleAutocompleteInput} onkeydown={handleAutocompleteKey}>{#if autocompleteOpen}<ul role="listbox">{#each autocompleteFixture.items as item, index (item.value)}<li role="option" data-value={item.value} aria-selected={autocompleteHighlightedIndex === index}>{item.label}</li>{/each}</ul>{/if}`:null;
 const datePickerFallback=datePicker?`<div {...rest} aria-label={rest["aria-label"] as string}><button type="button" onclick={() => moveDatePickerMonth(-1)}>Previous</button><button type="button" onclick={() => moveDatePickerMonth(1)}>Next</button><table role="grid"><tbody>{#each datePickerWeeks as week (week[0].iso)}<tr>{#each week as day (day.iso)}<td><button bind:this={datePickerButtons[day.iso]} type="button" data-day={day.iso} disabled={day.disabled} aria-selected={currentDatePickerValue === day.iso} onclick={() => selectDatePickerDay(day)}>{day.day}</button></td>{/each}</tr>{/each}</tbody></table></div>`:null;
 const dateRangePickerFallback=dateRangePicker?`<div bind:this={dateRangeRoot} tabindex="-1" class="kumo-date-range {size === 'sm' && variant === 'subtle' ? ${q(dateRangePicker.classes.smallSubtle.join(' '))} : ${q(dateRangePicker.classes.default.join(' '))}}"><div class="kumo-date-range__toolbar"><button type="button" data-navigation="previous" aria-label="Previous month" onclick={() => moveDateRangeMonth(-1)}>Previous</button><button type="button" data-navigation="next" aria-label="Next month" onclick={() => moveDateRangeMonth(1)}>Next</button></div><div class="kumo-date-range__months">{#each dateRangeMonths as month (month.key)}<section class="kumo-date-range__month"><h3>{month.label}</h3><div class="kumo-date-range__weekdays" aria-hidden="true">{#each ['Su','Mo','Tu','We','Th','Fr','Sa'] as weekday}<span>{weekday}</span>{/each}</div><div class="kumo-date-range__grid" role="grid">{#each month.days as day (day.iso)}<button type="button" data-day={day.iso} data-outside-month={!day.inMonth || undefined} aria-label={day.iso} aria-selected={day.iso === dateRangeStart || day.iso === dateRangeEnd || undefined} data-in-range={isDateRangeDayInRange(day.iso) || undefined} onclick={() => selectDateRangeDay(day.iso)}>{day.day}</button>{/each}</div></section>{/each}</div><div class="kumo-date-range__footer"><span aria-live="polite">{dateRangeStart ? (dateRangeEnd ? dateRangeStart + ' – ' + dateRangeEnd : 'Start: ' + dateRangeStart) : 'Choose a start date'}</span><button type="button" data-reset onclick={resetDateRange}>Reset dates</button></div></div>`:null;
 const selectFallback=select?`<div><button bind:this={selectTrigger} type="button" tabindex="0" role="combobox" aria-expanded={currentSelectOpen} aria-haspopup="listbox" aria-label={rest["aria-label"] as string | undefined} data-kumo-component="Select" data-kumo-part="trigger" onclick={toggleSelect} onkeydown={handleSelectKey}>{selectDisplay}</button>{#if currentSelectOpen}<div role="listbox" aria-multiselectable={multiple || undefined} onkeydown={handleSelectKey}>{#each selectOptions as option, index (index)}<button bind:this={selectOptionElements[index]} type="button" role="option" aria-selected={selectIsSelected(option.value)} aria-disabled={option.disabled || undefined} disabled={option.disabled} data-highlighted={highlightedSelectIndex === index || undefined} onclick={() => selectOption(option, index)}>{option.text}</button>{/each}</div>{/if}</div>`:null;
 const sidebarFallback=sidebar?`<div data-sidebar-wrapper data-state={sidebarState} data-side={sidebarSide}>{#if sidebarFixture.kind !== 'collapsible-closed'}<aside data-state={sidebarState} data-side={sidebarSide} data-collapsible="icon">{#if sidebarFixture.kind === 'expanded'}<header>{sidebarFixture.header}</header><main><span>{sidebarFixture.groupLabel}</span><ul>{#each sidebarFixture.menuItems as item (item)}<li><button type="button">{item}</button></li>{/each}</ul></main><footer><button type="button" aria-expanded={currentSidebarOpen} aria-label={currentSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}></button></footer>{:else if sidebarFixture.kind === 'resize'}<button bind:this={sidebarResizeHandle} type="button" aria-label=${q(sidebar.resize.label)} onkeydown={resizeSidebar}></button>{/if}</aside>{/if}</div>`:null;
 const toastyFallback=toasty?`<div data-kumo-component="Toasty">{#if children}{@render children()}{/if}<button type="button" data-notify aria-label="Notify" onclick={notifyToast}></button>{#if toastVisible}<div role="status" aria-live="polite"><strong>${toasty.notify.title}</strong><span>${toasty.notify.description}</span><button type="button" data-toast-action onclick={activateToast}>Action</button><button bind:this={toastClose} type="button" aria-label=${q(toasty.close.label)} onclick={closeToast}>Close</button></div>{/if}</div>`:null;
 const paletteFallback=palette?`{#if paletteFixture.kind === 'highlighted'}<span>{#each paletteSegments as segment, index (index)}{#if segment.mark}<mark>{segment.text}</mark>{:else}{segment.text}{/if}{/each}</span>{:else}<div data-kumo-component="CommandPalette">{#if paletteOpen}<input bind:this={paletteInput} placeholder={paletteFixture.placeholder} value={paletteValue} oninput={handlePaletteInput} onkeydown={handlePaletteKey}><ul role="listbox">{#each paletteFixture.items as item, index (item.value)}<li role="option" data-value={item.value} aria-selected={paletteHighlightedIndex === index}>{item.label}</li>{/each}</ul>{/if}</div>{/if}`:null;
 const dialogFallback=dialog?`<button bind:this={dialogTrigger} type="button" data-kumo-component="Dialog" data-kumo-part="trigger" aria-haspopup="dialog" onclickcapture={openDialog}>{dialogFixture.triggerText ?? triggerText}</button>{#if currentDialogOpen}<div use:portal role="dialog" tabindex="-1" bind:this={dialogContent}><h2>{dialogFixture.title ?? title}</h2>{#if (dialogFixture.description ?? description) !== undefined}<p>{dialogFixture.description ?? description}</p>{/if}<button type="button" data-kumo-part="close" onclickcapture={closeDialog}>{dialogFixture.closeText ?? closeText}</button></div>{/if}`:null;
 const dropdownFallback=dropdown?`<button bind:this={dropdownTrigger} type="button" tabindex="0" aria-haspopup="menu" aria-expanded={dropdownOpen} onclick={toggleDropdown} onkeydown={handleDropdownTriggerKey}>{dropdownFixture.trigger}</button>{#if dropdownOpen}<div role="menu">{#each dropdownFixture.items as item, index (item.label)}<button bind:this={dropdownItems[index]} type="button" role="menuitem" tabindex="-1" disabled={item.disabled} onclick={(event) => selectDropdownItem(event, item)} onkeydown={(event) => handleDropdownItemKey(event, index)}>{item.label}</button>{#if item.submenu && dropdownSubmenuOpen}<div role="menu">{#each item.submenu as nested (nested.label)}<button type="button" role="menuitem" tabindex="-1" disabled={nested.disabled}>{nested.label}</button>{/each}</div>{/if}{/each}</div>{/if}`:null;
 const popoverFallback=popover?`<button bind:this={popoverTrigger} type="button" tabindex="0" aria-haspopup="dialog" aria-expanded={currentPopoverOpen} data-kumo-component="Popover" data-kumo-part="trigger" onclick={togglePopover} onkeydown={dismissPopover}>{popoverFixture.triggerText}</button>{#if currentPopoverOpen}<div bind:this={popoverContent} role="dialog" data-side={resolvedPopoverSide} data-align={popoverFixture.align} data-position-method={popoverFixture.positionMethod} onkeydown={dismissPopover}>{#if popoverFixture.title !== undefined}<h2>{popoverFixture.title}</h2>{/if}{#if popoverFixture.description !== undefined}<p>{popoverFixture.description}</p>{/if}{#if popoverFixture.closeText !== undefined}<button type="button" onclick={closePopover}>{popoverFixture.closeText}</button>{/if}{#if popoverFixture.body !== undefined}{popoverFixture.body}{/if}</div>{/if}`:null;
 const fallback=visualSimpleFallback??(tableOfContents?tocFallback:hasNativeButton?`<button {...rest} class=${q(visualContract.components.button.root.className)} type={type} disabled={Boolean(disabled || loading)} {onclick}>{#if loading}<svg aria-hidden="true"></svg>{/if}{#if children}{@render children()}{/if}</button>`:toggleFallback??inputFallback??fieldFallback??clipboardFallback??paginationFallback??radioFallback??tabsFallback??menubarFallback??dialogFallback??popoverFallback??dropdownFallback??inputGroupFallback??sensitiveFallback??comboboxFallback??autocompleteFallback??paletteFallback??selectFallback??sidebarFallback??toastyFallback??datePickerFallback??dateRangePickerFallback??node(impl.componentRoot));
 return `<!-- @generated by src/kumo/emitters/svelte/index.mjs; do not edit -->\n<script lang="ts">\n  import type { Snippet } from 'svelte';\n   const browser = typeof document !== 'undefined';\n\n  export const modelDigest = ${q(model.modelDigest)};
  export const contentBindingDigest = ${q(model.contentBindings.capabilityDigest)};\n  export type Props = {\n${propLines}${propLines&&slotTypes?'\n':''}${slotTypes}${callbackTypes&&!datePicker?'\n'+callbackTypes:''}${propNames.has('children')?'':'\n  children?: Snippet;'}${hasNativeButton?'\n  type?: "button" | "submit" | "reset";\n  onclick?: (event: MouseEvent) => void;':toasty?'\n  onNotify?: () => void;\n  onAction?: () => void;':sidebar?'\n  onOpenChange?: (value: boolean) => void;\n  onWidthChange?: (value: number) => void;':select?'\n  value?: unknown;\n  defaultValue?: unknown;\n  open?: boolean;\n  defaultOpen?: boolean;\n  multiple?: boolean;\n  onValueChange?: (value: unknown) => void;\n  onOpenChange?: (value: boolean) => void;':dateRangePicker?'\n  onStartChange?: (value: string | null) => void;\n  onEndChange?: (value: string | null) => void;':datePicker?'\n  selectedDate: string | undefined;\n  defaultMonthDate: string | undefined;\n  disabledBeforeDate: string | undefined;\n  disabledAfterDate: string | undefined;\n  onChange?: (value: string) => void;':toggle?'\n  defaultChecked?: boolean;':nativeInput?'\n  defaultValue?: string;\n  disabled?: boolean;\n  onInput?: (value: string) => void;\n  onFocus?: (event: FocusEvent) => void;':''}${fieldControl?'\n  label?: unknown;':''}${fieldControl&&!fieldControl.ownsControl?'\n  controlId?: string;':''}${clipboard?'\n  text?: unknown;\n  textToCopy?: unknown;\n  onCopy?: () => void;':''}${pagination?'\n  fixtureMode?: "simple" | "dropdown";':''}${dialog?'\n  open?: boolean;\n  defaultOpen?: boolean;\n  onOpenChange?: (value: boolean) => void;\n  triggerText?: unknown;\n  title?: unknown;\n  description?: unknown;\n  closeText?: unknown;':popover?'\n  open?: boolean;\n  defaultOpen?: boolean;\n  onOpenChange?: (value: boolean) => void;':dropdown?'\n  onOpenChange?: (value: boolean) => void;\n  onSelect?: (value: string) => void;':sensitive?'\n  label?: unknown;\n  defaultValue?: string;\n  onValueChange?: (value: string) => void;\n  onCopy?: () => void;':(combobox||autocomplete)?'\n  onOpenChange?: (value: boolean) => void;\n  onValueChange?: (value: string) => void;':palette?'\n  onOpenChange?: (value: boolean) => void;\n  onValueChange?: (value: string) => void;\n  onHighlightChange?: (value: string) => void;':''}\n  styles?: Record<string, string>;\n  fixture?: unknown;\n  [key: string]: unknown;\n};\n\n  ${destructureSafe}\n  ${stateDecl}\n${select?`  type SelectFixtureNode = { export?: string; text?: string; props?: Record<string, unknown>; children?: SelectFixtureNode[] };
  type SelectOption = { value: unknown; disabled: boolean; text: string };
  function selectText(node: SelectFixtureNode | undefined): string { return node ? String(node.text ?? '') + (node.children ?? []).map(selectText).join('') : ''; }
  const selectOptions = $derived.by(() => { const root = fixture as SelectFixtureNode | undefined; const source = root?.export === 'root' ? root : root?.children?.find(node => node.export === 'root') ?? root; return (source?.children ?? []).filter(node => node.export === '.Option').map(node => ({ value: node.props?.value, disabled: Boolean(node.props?.disabled), text: selectText(node) })); });
  const controlledSelectValue = $derived(Object.prototype.hasOwnProperty.call(rest, 'value') || value !== undefined);
  const controlledSelectOpen = $derived(Object.prototype.hasOwnProperty.call(rest, 'open') || open !== undefined);
  let uncontrolledSelectValue = $state(defaultValue ?? (multiple ? [] : null));
  let uncontrolledSelectOpen = $state(Boolean(defaultOpen));
  const currentSelectValue = $derived(controlledSelectValue ? value : uncontrolledSelectValue);
  const currentSelectOpen = $derived(controlledSelectOpen ? Boolean(open) : uncontrolledSelectOpen);
  const selectDisplay = $derived.by(() => { const values = multiple ? (Array.isArray(currentSelectValue) ? currentSelectValue : []) : [currentSelectValue]; return selectOptions.filter(option => values.some(item => JSON.stringify(item) === JSON.stringify(option.value))).map(option => option.text).join(', ') || String(rest.placeholder ?? ''); });
  let highlightedSelectIndex = $state(-1);
  let selectTrigger: HTMLButtonElement | undefined = $state();
  let selectOptionElements: HTMLButtonElement[] = $state([]);
  function selectIsSelected(value: unknown): boolean { return multiple ? (Array.isArray(currentSelectValue) && currentSelectValue.some(item => JSON.stringify(item) === JSON.stringify(value))) : JSON.stringify(currentSelectValue) === JSON.stringify(value); }
  function setSelectOpen(next: boolean) { if (!controlledSelectOpen) uncontrolledSelectOpen = next; onOpenChange?.(next); }
  function focusSelectOption(index: number) { highlightedSelectIndex = index; queueMicrotask(() => { const element = selectOptionElements[index]; element?.focus(); element?.scrollIntoView({ block: 'nearest' }); if (element) element.dataset.highlightScrolled = 'true'; }); }
  function firstEnabled(): number { return selectOptions.findIndex(option => !option.disabled); }
  function lastEnabled(): number { for (let index = selectOptions.length - 1; index >= 0; index--) if (!selectOptions[index].disabled) return index; return -1; }
  function toggleSelect() { const next = !currentSelectOpen; setSelectOpen(next); if (next) focusSelectOption(firstEnabled()); }
  function selectOption(option: SelectOption, index: number) { if (option.disabled) return; if (multiple) { const values = Array.isArray(currentSelectValue) ? currentSelectValue : []; const exists = values.some(item => JSON.stringify(item) === JSON.stringify(option.value)); const next = exists ? values.filter(item => JSON.stringify(item) !== JSON.stringify(option.value)) : [...values, option.value]; if (!controlledSelectValue) uncontrolledSelectValue = next; onValueChange?.(next); focusSelectOption(index); return; } if (!controlledSelectValue) uncontrolledSelectValue = option.value; onValueChange?.(option.value); setSelectOpen(false); if (controlledSelectOpen) focusSelectOption(index); else queueMicrotask(() => selectTrigger?.focus()); }
  function handleSelectKey(event: KeyboardEvent) { if (event.key === 'Tab') { event.preventDefault(); if (currentSelectOpen) { setSelectOpen(false); queueMicrotask(() => selectTrigger?.focus()); } return; } if (event.key === 'Escape') { if (!currentSelectOpen) return; event.preventDefault(); setSelectOpen(false); queueMicrotask(() => selectTrigger?.focus()); return; } if (event.key === 'ArrowDown') { event.preventDefault(); if (!currentSelectOpen) { setSelectOpen(true); const selected = selectOptions.findIndex(option => selectIsSelected(option.value)); focusSelectOption(selected >= 0 && !selectOptions[selected].disabled ? selected : firstEnabled()); return; } for (let index = highlightedSelectIndex + 1; index < selectOptions.length; index++) if (!selectOptions[index].disabled) { focusSelectOption(index); return; } return; } if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); focusSelectOption(event.key === 'Home' ? firstEnabled() : lastEnabled()); return; } if (event.key.length === 1) { const key = event.key.toLocaleLowerCase(); const index = selectOptions.findIndex(option => !option.disabled && option.text.toLocaleLowerCase().startsWith(key)); if (index >= 0) { event.preventDefault(); focusSelectOption(index); } } }
` : ''}${sidebar?`  type SidebarFixtureNode = { export?: string; text?: string; props?: Record<string, unknown>; children?: SidebarFixtureNode[] };
  type SidebarFixture = { export?: string; props?: Record<string, unknown>; children?: SidebarFixtureNode[] };
  function sidebarText(node: SidebarFixtureNode | undefined): string { return node ? String(node.text ?? '') + (node.children ?? []).map(sidebarText).join('') : ''; }
  const sidebarFixture = $derived.by(() => { const provider = fixture as SidebarFixture | undefined; const root = provider?.children?.find(node => node.export === 'root'); const find = (part: string) => root?.children?.find(node => node.export === part); const content = find('.Content'); const group = content?.children?.find(node => node.export === '.Group'); const menu = group?.children?.find(node => node.export === '.Menu'); const items = (menu?.children ?? []).filter(node => node.export === '.MenuButton').map(sidebarText); if (find('.Collapsible')) return { kind: 'collapsible-closed' as const, header: '', groupLabel: '', menuItems: [] as string[] }; if (find('.ResizeHandle')) return { kind: 'resize' as const, header: '', groupLabel: '', menuItems: [] as string[] }; if (items.length) return { kind: 'expanded' as const, header: sidebarText(find('.Header')), groupLabel: sidebarText(group?.children?.find(node => node.export === '.GroupLabel')), menuItems: items }; return { kind: 'collapsed' as const, header: '', groupLabel: '', menuItems: [] as string[] }; });
  const sidebarDefaultOpen = Boolean((fixture as SidebarFixture | undefined)?.props?.defaultOpen ?? true);
  let uncontrolledSidebarOpen = $state(sidebarDefaultOpen);
  let sidebarWidth = $state(Number((fixture as SidebarFixture | undefined)?.props?.defaultWidth ?? 256));
  const currentSidebarOpen = $derived(uncontrolledSidebarOpen);
  const sidebarState = $derived(currentSidebarOpen ? ${q(sidebar.expanded.state)} : ${q(sidebar.collapsed.state)});
  const sidebarSide = ${q(sidebar.expanded.side)};
  let sidebarResizeHandle: HTMLButtonElement | undefined = $state();
  function resizeSidebar(event: KeyboardEvent) { if (event.key !== ${q(sidebar.resize.key)}) return; event.preventDefault(); uncontrolledSidebarOpen = ${q(sidebar.resize.open)}; sidebarWidth = ${sidebar.resize.width}; onOpenChange?.(${q(sidebar.resize.open)}); onWidthChange?.(${sidebar.resize.width}); sidebarResizeHandle?.focus(); }
  void sidebarWidth;
`:''}${tableOfContents?`  type TocNode = { export?: string; text?: string; props?: Record<string, unknown>; children?: TocNode[] };
  const tocFixture = $derived(fixture as TocNode | undefined);
  const tocChildren = (node: TocNode | undefined): TocNode[] => node?.children ?? [];
  const tocText = (node: TocNode | undefined): string => node ? String(node.text ?? '') + tocChildren(node).map(tocText).join('') : '';
  const tocTitle = $derived(tocText(tocChildren(tocFixture).find(node => node.export === '.Title')));
  const tocList = $derived(tocChildren(tocFixture).find(node => node.export === '.List'));
  const tocItems = $derived(tocChildren(tocList).flatMap(node => node.export === '.Group' ? [node, ...tocChildren(node)] : [node]).filter(node => node.export === '.Item' || node.export === '.Group').map(node => ({href:String(node.props?.href ?? '#'),active:Boolean(node.props?.active),label:String(node.props?.label ?? tocText(node)),group:node.export === '.Group'})));
`:''}${dateRangePicker?`  type DateRangeDay = { iso: string; day: number; inMonth: boolean };
  type DateRangeMonth = { key: string; label: string; days: DateRangeDay[] };
  let dateRangeMonth = $state('2026-06-01');
  let dateRangeStart = $state<string | null>(null);
  let dateRangeEnd = $state<string | null>(null);
  let dateRangeRoot: HTMLElement | undefined = $state();
  const dateRangeMonthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  function buildDateRangeMonth(value: string): DateRangeMonth { const base = new Date(value + 'T00:00:00.000Z'); const year = base.getUTCFullYear(), month = base.getUTCMonth(); const first = new Date(Date.UTC(year, month, 1)), start = new Date(first); start.setUTCDate(1 - first.getUTCDay()); const days = Array.from({length:42}, (_, index) => { const date = new Date(start); date.setUTCDate(start.getUTCDate() + index); return {iso:date.toISOString().slice(0,10),day:date.getUTCDate(),inMonth:date.getUTCMonth() === month}; }); return {key:year + '-' + month,label:dateRangeMonthNames[month] + ' ' + year,days}; }
  const dateRangeMonths = $derived.by(() => [0,1].map(offset => { const date = new Date(dateRangeMonth + 'T00:00:00.000Z'); date.setUTCMonth(date.getUTCMonth() + offset); return buildDateRangeMonth(date.toISOString().slice(0,7) + '-01'); }));
  function moveDateRangeMonth(delta: number) { const date = new Date(dateRangeMonth + 'T00:00:00.000Z'); date.setUTCMonth(date.getUTCMonth() + delta); dateRangeMonth = date.toISOString().slice(0,7) + '-01'; }
  function isDateRangeDayInRange(iso: string) { return Boolean(dateRangeStart && dateRangeEnd && iso >= dateRangeStart && iso <= dateRangeEnd); }
  function selectDateRangeDay(iso: string) { if (dateRangeStart === null || dateRangeEnd !== null || iso < dateRangeStart) { dateRangeStart = iso; dateRangeEnd = null; onStartChange?.(iso); onStartDateChange?.(iso); return; } dateRangeEnd = iso; onEndChange?.(iso); onEndDateChange?.(iso); }
  function resetDateRange() { dateRangeStart = null; dateRangeEnd = null; onStartChange?.(null); onStartDateChange?.(null); onEndChange?.(null); onEndDateChange?.(null); dateRangeRoot?.focus(); }
`:''}${datePicker?`  type DatePickerDay = { iso: string; day: number; disabled: boolean };
  const initialDatePickerMonth = String(defaultMonthDate ?? selectedDate ?? '1970-01-01').slice(0, 7) + '-01';
  let datePickerMonth = $state(initialDatePickerMonth);
  let uncontrolledDatePickerValue = $state(selectedDate);
  const currentDatePickerValue = $derived(selectedDate !== undefined ? selectedDate : uncontrolledDatePickerValue);
  let datePickerButtons: Record<string, HTMLButtonElement> = $state({});
  const datePickerDays = $derived.by(() => {
    const month = new Date(datePickerMonth + 'T00:00:00.000Z');
    const start = new Date(month); start.setUTCDate(1 - start.getUTCDay());
    const end = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0));
    const count = Math.ceil((start.getUTCDay() + end.getUTCDate()) / 7) * 7;
    return Array.from({ length: count }, (_, index): DatePickerDay => { const date = new Date(start); date.setUTCDate(start.getUTCDate() + index); const iso = date.toISOString().slice(0, 10); return { iso, day: date.getUTCDate(), disabled: Boolean((disabledBeforeDate !== undefined && iso < disabledBeforeDate) || (disabledAfterDate !== undefined && iso > disabledAfterDate)) }; });
  });
  const datePickerWeeks = $derived(Array.from({ length: datePickerDays.length / 7 }, (_, index) => datePickerDays.slice(index * 7, index * 7 + 7)));
  function moveDatePickerMonth(delta: number) { const date = new Date(datePickerMonth + 'T00:00:00.000Z'); date.setUTCMonth(date.getUTCMonth() + delta); datePickerMonth = date.toISOString().slice(0, 7) + '-01'; }
  function selectDatePickerDay(day: DatePickerDay) { if (day.disabled) return; if (selectedDate === undefined) uncontrolledDatePickerValue = day.iso; onChange?.(day.iso); datePickerButtons[day.iso]?.focus(); }
`:''}${toasty?`  let toastVisible = $state(false);
  let toastClose: HTMLButtonElement | undefined = $state();
  function notifyToast() { toastVisible = true; onNotify?.(); }
  function activateToast(event: MouseEvent) { onAction?.(); (event.currentTarget as HTMLButtonElement).focus(); }
  function closeToast() { const close = toastClose; setTimeout(() => { toastVisible = false; if (document.activeElement === close) close?.blur(); }, 300); }
`:''}${toggle?`  const controlledToggle = ${safeName(toggle.controlled.controlledProp)} !== undefined;\n  let uncontrolledChecked = $state(Boolean(defaultChecked));\n  const currentChecked = $derived(controlledToggle ? Boolean(${safeName(toggle.controlled.controlledProp)}) : uncontrolledChecked);\n  ${toggle.controlled.indeterminate?`let currentIndeterminate = $state(Boolean(${safeName(toggle.controlled.indeterminate.prop)}));\n  `:''}function activateToggle() {\n    if (disabled) return;\n    const next = ${toggle.controlled.indeterminate?`currentIndeterminate ? ${q(Boolean(toggle.controlled.indeterminate.activationResult))} : `:''}!currentChecked;\n    ${toggle.controlled.indeterminate?'currentIndeterminate = false;\n    ':''}if (!controlledToggle) uncontrolledChecked = next;\n    onCheckedChange?.(next);\n  }\n  function activateToggleOnSpace(event: KeyboardEvent) { if (event.code === 'Space' || event.key === ' ') { event.preventDefault(); activateToggle(); } }`:''}\n${fieldControl?.ownsControl?`  const controlId = ${q(ownedControlId)};\n`:''}${nativeInput?`  function handleNativeInput(event: Event) { onInput?.((event.currentTarget as HTMLInputElement | HTMLTextAreaElement).value); }\n  function handleNativeFocus(event: FocusEvent) { onFocus?.(event); }\n`:''}${clipboard?`  let copyStatus = $state('');\n  async function copyText() { await navigator.clipboard.writeText(String(textToCopy ?? text ?? '')); onCopy?.(); copyStatus = ${q(clipboard.behavior.announcesSuccess)}; }\n`:''}${tabs?`  type TabItem = { label: unknown; value: unknown };
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
`:''}${dialog?`  type DialogFixtureNode = { export?: string; text?: string; children?: DialogFixtureNode[] };
  type DialogFixture = { children?: DialogFixtureNode[] };
  const dialogFixture = $derived.by(() => { const root = fixture as DialogFixture | undefined; const nodes = root?.children ?? []; const find = (part: string) => nodes.flatMap(node => node.children ?? []).find(node => node.export === part); const text = (node: DialogFixtureNode | undefined): string | undefined => node?.children?.map(child => child.text ?? text(child) ?? '').join(''); return { triggerText: text(nodes.find(node => node.export === '.Trigger')), title: text(find('.Title')), description: text(find('.Description')), closeText: text(find('.Close')) }; });
  const controlledDialog = $derived(open !== undefined);
  let uncontrolledDialogOpen = $state(Boolean(defaultOpen));
  const currentDialogOpen = $derived(controlledDialog ? Boolean(open) : uncontrolledDialogOpen);
  let dialogTrigger: HTMLButtonElement | undefined = $state();
  let dialogContent: HTMLElement | undefined = $state();
  function portal(node: HTMLElement) { document.body.appendChild(node); return { destroy() { node.remove(); } }; }
  function setDialogOpen(next: boolean) { if (!controlledDialog) uncontrolledDialogOpen = next; onOpenChange?.(next); }
  function openDialog() { setDialogOpen(true); }
  function closeDialog() { setDialogOpen(false); queueMicrotask(() => dialogTrigger?.focus()); }
  $effect(() => { if (currentDialogOpen && dialogContent) queueMicrotask(() => dialogContent?.focus()); });
`:''}${popover?`  type PopoverFixtureNode = { export?: string; text?: string; props?: Record<string, unknown>; children?: PopoverFixtureNode[] };
  type PopoverFixture = { children?: PopoverFixtureNode[] };
  function popoverText(node: PopoverFixtureNode | undefined): string | undefined { if (!node) return undefined; return String(node.text ?? '') + (node.children ?? []).map(child => popoverText(child) ?? '').join(''); }
  const popoverFixture = $derived.by(() => { const root = fixture as PopoverFixture | undefined; const nodes = root?.children ?? []; const trigger = nodes.find(node => node.export === '.Trigger'); const content = nodes.find(node => node.export === '.Content'); const find = (part: string) => content?.children?.find(node => node.export === part); const body = (content?.children ?? []).filter(node => !node.export).map(node => popoverText(node) ?? '').join('') || undefined; return { triggerText: popoverText(trigger) ?? 'Open', title: popoverText(find('.Title')), description: popoverText(find('.Description')), closeText: popoverText(find('.Close')), body, side: String(content?.props?.side ?? 'bottom'), sideOffset: Number(content?.props?.sideOffset ?? 8), align: String(content?.props?.align ?? 'center'), positionMethod: String(content?.props?.positionMethod ?? 'absolute') }; });
  const controlledPopover = $derived(open !== undefined);
  let uncontrolledPopoverOpen = $state(Boolean(defaultOpen));
  const currentPopoverOpen = $derived(controlledPopover ? Boolean(open) : uncontrolledPopoverOpen);
  let popoverTrigger: HTMLButtonElement | undefined = $state();
  let popoverContent: HTMLElement | undefined = $state();
  let resolvedPopoverSide = $state('bottom');
  function setPopoverOpen(next: boolean) { if (!controlledPopover) uncontrolledPopoverOpen = next; onOpenChange?.(next); }
  function resolvePopoverSide() { const requested = popoverFixture.side; if (requested !== 'top' || !popoverTrigger) { resolvedPopoverSide = requested; return; } const rect = popoverTrigger.getBoundingClientRect(); const offset = Number(popoverFixture.sideOffset ?? 8); resolvedPopoverSide = rect.top < offset + 48 ? 'bottom' : 'top'; }
  function togglePopover() { const next = !currentPopoverOpen; if (next) resolvePopoverSide(); setPopoverOpen(next); popoverTrigger?.focus(); }
  function closePopover() { setPopoverOpen(false); queueMicrotask(() => popoverTrigger?.focus()); }
  function dismissPopover(event: KeyboardEvent) { if (event.key !== 'Escape') return; event.preventDefault(); closePopover(); }
  void popoverContent;
`:''}${dropdown?`  type DropdownFixtureNode = { export?: string; text?: string; props?: Record<string, unknown>; children?: DropdownFixtureNode[] };
  type DropdownItem = { label: string; disabled: boolean; submenu?: DropdownItem[] };
  function dropdownText(node: DropdownFixtureNode | undefined): string { return node ? String(node.text ?? '') + (node.children ?? []).map(dropdownText).join('') : ''; }
  function dropdownItem(node: DropdownFixtureNode): DropdownItem { const sub = node.children?.find(child => child.export === '.SubContent'); return { label: dropdownText(node.children?.find(child => child.export === '.SubTrigger') ?? node), disabled: Boolean(node.props?.disabled), submenu: sub?.children?.filter(child => child.export === '.Item').map(dropdownItem) }; }
  const dropdownFixture = $derived.by(() => { const root = fixture as DropdownFixtureNode | undefined; const trigger = root?.children?.find(node => node.export === '.Trigger'); const content = root?.children?.find(node => node.export === '.Content'); return { trigger: dropdownText(trigger) || ${q(dropdown.trigger.text)}, items: (content?.children ?? []).filter(node => node.export === '.Item' || node.export === '.Sub').map(dropdownItem) }; });
  let dropdownOpen = $state(false);
  let dropdownSubmenuOpen = $state(false);
  let dropdownTrigger: HTMLButtonElement | undefined = $state();
  let dropdownItems: HTMLButtonElement[] = $state([]);
  function setDropdownOpen(next: boolean) { dropdownOpen = next; onOpenChange?.(next); }
  function focusDropdownItem(index: number) { queueMicrotask(() => dropdownItems[index]?.focus()); }
  function openDropdown() { setDropdownOpen(true); const first = dropdownFixture.items.findIndex(item => !item.disabled); focusDropdownItem(first); }
  function toggleDropdown() { if (dropdownOpen) setDropdownOpen(false); else openDropdown(); }
  function handleDropdownTriggerKey(event: KeyboardEvent) { if (event.key !== ${q(dropdown.keyboard.openKey)}) return; event.preventDefault(); openDropdown(); }
  function selectDropdownItem(event: MouseEvent, item: DropdownItem) { if (item.disabled || item.submenu) return; onSelect?.(item.label); setDropdownOpen(false); onOpenChange?.(false); dropdownSubmenuOpen = false; (event.currentTarget as HTMLButtonElement).blur(); }
  function handleDropdownItemKey(event: KeyboardEvent, index: number) { const item = dropdownFixture.items[index]; if (event.key.length === 1) { const match = dropdownFixture.items.findIndex(candidate => !candidate.disabled && candidate.label.toLocaleLowerCase().startsWith(event.key.toLocaleLowerCase())); if (match >= 0) { event.preventDefault(); focusDropdownItem(match); } return; } if (event.key === ${q(dropdown.keyboard.submenuKey)} && item) { event.preventDefault(); if (item.submenu) dropdownSubmenuOpen = true; return; } if (event.key === ${q(dropdown.keyboard.dismissKey)}) { event.preventDefault(); dropdownSubmenuOpen = false; dropdownOpen = false; onOpenChange?.(false); queueMicrotask(() => dropdownTrigger?.focus()); } }
`:''}${sensitive?`  let sensitiveValue = $state(String(defaultValue ?? ''));
  let sensitiveRevealed = $state(false);
  let sensitiveStatus = $state('');
  let sensitiveInputElement: HTMLInputElement | undefined = $state();
  function revealSensitive() { sensitiveRevealed = true; queueMicrotask(() => sensitiveInputElement?.focus()); }
  function editSensitive(event: Event) { sensitiveValue = (event.currentTarget as HTMLInputElement).value; onValueChange?.(sensitiveValue); }
  function hideSensitiveOnEscape(event: KeyboardEvent) { if (event.key === 'Escape') sensitiveRevealed = false; }
  async function copySensitive() { await navigator.clipboard.writeText(sensitiveValue); sensitiveStatus = 'Copied to clipboard'; onCopy?.(); }
`:''}${combobox?`  type ComboboxFixtureNode = { export?: string; text?: string; props?: Record<string, unknown>; children?: ComboboxFixtureNode[] };
  type ComboboxFixture = { children?: ComboboxFixtureNode[] };
  function comboboxText(node: ComboboxFixtureNode | undefined): string { return node ? String(node.text ?? '') + (node.children ?? []).map(comboboxText).join('') : ''; }
  const comboboxFixture = $derived.by(() => { const root = fixture as ComboboxFixture | undefined; const trigger = root?.children?.find(node => node.export === '.TriggerInput'); const content = root?.children?.find(node => node.export === '.Content'); const list = content?.children?.find(node => node.export === '.List'); return { placeholder: trigger?.props?.placeholder as string | undefined, items: (list?.children ?? []).filter(node => node.export === '.Item').map(node => ({ value: String(node.props?.value ?? ''), label: comboboxText(node) })) }; });
  let comboboxOpen = $state(false);
  let highlightedIndex = $state(-1);
  let comboboxValue = $state('');
  let comboboxInput: HTMLInputElement | undefined = $state();
  function setComboboxOpen(next: boolean) { comboboxOpen = next; onOpenChange?.(next); }
  function openCombobox() { if (!comboboxOpen) setComboboxOpen(true); }
  function handleComboboxKey(event: KeyboardEvent) { if (event.key === 'ArrowDown') { event.preventDefault(); if (!comboboxOpen) setComboboxOpen(true); highlightedIndex = Math.min(highlightedIndex + 1, comboboxFixture.items.length - 1); return; } if (event.key === 'Enter' && highlightedIndex >= 0) { event.preventDefault(); const item = comboboxFixture.items[highlightedIndex]; if (!item) return; comboboxValue = item.value; onValueChange?.(item.value); setComboboxOpen(false); comboboxInput?.focus(); } }
`:''}${autocomplete?`  type AutocompleteFixtureNode = { export?: string; text?: string; props?: Record<string, unknown>; children?: AutocompleteFixtureNode[] };
  type AutocompleteFixture = { export?: string; children?: AutocompleteFixtureNode[] };
  function autocompleteText(node: AutocompleteFixtureNode | undefined): string { return node ? String(node.text ?? '') + (node.children ?? []).map(autocompleteText).join('') : ''; }
  const autocompleteFixture = $derived.by(() => { const root = fixture as AutocompleteFixture | undefined; const inputGroup = root?.children?.find(node => node.export === '.InputGroup'); const content = root?.children?.find(node => node.export === '.Content'); const list = content?.children?.find(node => node.export === '.List'); return { placeholder: inputGroup?.props?.placeholder as string | undefined, items: (list?.children ?? []).filter(node => node.export === '.Item').map(node => ({ value: String(node.props?.value ?? ''), label: autocompleteText(node) })) }; });
  let autocompleteOpen = $state(false);
  let autocompleteHighlightedIndex = $state(-1);
  let autocompleteValue = $state('');
  let autocompleteInput: HTMLInputElement | undefined = $state();
  function setAutocompleteOpen(next: boolean) { if (autocompleteOpen === next) return; autocompleteOpen = next; onOpenChange?.(next); }
  function handleAutocompleteInput(event: Event) { autocompleteValue = (event.currentTarget as HTMLInputElement).value; onValueChange?.(autocompleteValue); if (autocompleteValue.length > 0) setAutocompleteOpen(true); }
  function handleAutocompleteKey(event: KeyboardEvent) { if (event.key === 'ArrowDown') { event.preventDefault(); if (!autocompleteOpen) setAutocompleteOpen(true); autocompleteHighlightedIndex = Math.min(autocompleteHighlightedIndex + 1, autocompleteFixture.items.length - 1); return; } if (event.key === 'Enter' && autocompleteHighlightedIndex >= 0) { event.preventDefault(); const item = autocompleteFixture.items[autocompleteHighlightedIndex]; if (!item) return; autocompleteValue = item.value; onValueChange?.(item.value); setAutocompleteOpen(false); autocompleteInput?.focus(); } }
`:''}${palette?`  type PaletteFixtureNode = { export?: string; text?: string; props?: Record<string, unknown>; children?: PaletteFixtureNode[] };
  type PaletteFixture = { export?: string; props?: Record<string, unknown>; children?: PaletteFixtureNode[] };
  function paletteText(node: PaletteFixtureNode | undefined): string { return node ? String(node.text ?? '') + (node.children ?? []).map(paletteText).join('') : ''; }
  const paletteFixture = $derived.by(() => { const root = fixture as PaletteFixture | undefined; if (root?.export === '.HighlightedText') return { kind: 'highlighted' as const, text: String(root.props?.text ?? ''), highlights: (root.props?.highlights as Array<[number,number]> | undefined) ?? [], placeholder: undefined, items: [] }; const input = root?.children?.find(node => node.export === '.Input'); const list = root?.children?.find(node => node.export === '.List'); return { kind: 'root' as const, text: '', highlights: [] as Array<[number,number]>, placeholder: input?.props?.placeholder as string | undefined, items: (list?.children ?? []).filter(node => node.export === '.Item').map(node => ({value:String(node.props?.value ?? ''), label:paletteText(node)})), open: Boolean(root?.props?.open) }; });
  const paletteSegments = $derived.by(() => { const segments: Array<{text:string;mark:boolean}> = []; let cursor = 0; for (const [start,end] of [...paletteFixture.highlights].sort((a,b)=>a[0]-b[0])) { if (start > cursor) segments.push({text:paletteFixture.text.slice(cursor,start),mark:false}); if (end >= start) segments.push({text:paletteFixture.text.slice(start,end+1),mark:true}); cursor = Math.max(cursor,end+1); } if (cursor < paletteFixture.text.length) segments.push({text:paletteFixture.text.slice(cursor),mark:false}); return segments; });
  let paletteOpen = $state(Boolean((fixture as PaletteFixture | undefined)?.props?.open));
  let paletteValue = $state('');
  let paletteHighlightedIndex = $state(0);
  let paletteInput: HTMLInputElement | undefined = $state();
  let paletteInitialNotified = false;
  $effect(() => { const first = paletteFixture.items[0]; if (browser && paletteFixture.kind === 'root' && paletteOpen && !paletteInitialNotified && first) { paletteInitialNotified = true; onHighlightChange?.(first.value); } });
  function handlePaletteInput(event: Event) { paletteValue = (event.currentTarget as HTMLInputElement).value; onValueChange?.(paletteValue); }
  function handlePaletteKey(event: KeyboardEvent) { if (event.key === 'ArrowDown') { event.preventDefault(); paletteHighlightedIndex = Math.min(paletteHighlightedIndex + 1, paletteFixture.items.length - 1); const item = paletteFixture.items[paletteHighlightedIndex]; if (item) onHighlightChange?.(item.value); return; } if (event.key === 'Escape') { event.preventDefault(); paletteOpen = false; onOpenChange?.(false); queueMicrotask(() => paletteInput?.blur()); } }
`:''}${inputGroup?`  type InputGroupFixtureNode = { export?: string; text?: string; props?: Record<string, unknown>; children?: InputGroupFixtureNode[] };
  type InputGroupFixture = { props?: { label?: unknown; description?: unknown; required?: boolean }; children?: InputGroupFixtureNode[] };
  const inputGroupFixture = $derived.by(() => { const root = fixture as InputGroupFixture | undefined; return { label: root?.props?.label, description: root?.props?.description, required: root?.props?.required, children: root?.children ?? [] }; });
  const inputGroupId = ${q(`kumo-${crypto.createHash('sha256').update(model.modelDigest).digest('hex').slice(0,12)}`)};
  let inputGroupValue = $state('');
  function inputGroupText(node: InputGroupFixtureNode | undefined): string { return node ? String(node.text ?? '') + (node.children ?? []).map(inputGroupText).join('') : ''; }
  function handleInputGroupInput(event: Event) { inputGroupValue = (event.currentTarget as HTMLInputElement).value; }
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
