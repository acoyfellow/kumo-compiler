import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {loadLibrary, canonicalJSON} from '../../library/index.mjs';
import {requireContentBindings, semanticPredicate} from '../shared/content-adapter.mjs';

const identifier = value => /^[A-Za-z_$][\w$]*$/.test(value);
const member = (base, name) => identifier(name) ? `${base}.${name}` : `${base}[${JSON.stringify(name)}]`;
const pascal = value => value.split(/[^A-Za-z0-9]+/).filter(Boolean).map(x => x[0].toUpperCase() + x.slice(1)).join('');
const compoundPartSymbol = (root, pathValue) => `${root}${pathValue.split('.').map(pascal).join('')}`;
const compoundParts = model => (model.composition?.compoundExports?.paths ?? []).map(item => ({...item, symbol:compoundPartSymbol(model.public.symbol, item.path)}));
const fixtureText = value => value && typeof value === 'object' ? `${typeof value.text === 'string' ? value.text : ''}${(value.children ?? []).map(fixtureText).join('')}` : '';
const expr = (value, context = {}) => {
  switch (value.kind) {
    case 'literal': return JSON.stringify(value.value);
    case 'prop': return `(${member('props', value.name)} as any)`;
    case 'consumer-children': {
      if (value.contentRole !== 'consumer-content' || !value.predicateSource) throw new Error('Solid consumer content requires an explicit content role and predicate source');
      return 'props.children';
    }
    case 'fixture': return 'fixture';
    case 'state': return `${member('state', value.name)}()`;
    case 'item': return `(${member(context.item ?? 'item', value.name)} as any)`;
    case 'style-ref': return member('styles', value.name);
    case 'coalesce': return `(${value.values.map(x => expr(x, context)).join(' ?? ')})`;
    case 'equals': return `(${expr(value.left, context)} === ${expr(value.right, context)})`;
    case 'not': return `!(${expr(value.value, context)})`;
    case 'concat': return `[${value.values.map(x => expr(x, context)).join(', ')}].join(${JSON.stringify(value.separator ?? '')})`;
    default: throw new Error(`unsupported Solid expression: ${value.kind}`);
  }
};
function node(value, context = {}) {
  switch (value.kind) {
    case 'text': return `{${expr(value.value, context)}}`;
    case 'children': return '{props.children}';
    case 'fixture-children': return `{fixtureText(${expr(value.value, context)})}`;
    case 'slot': return `{(${member('props', value.name)} as JSX.Element) ?? ${value.fallback ? `(${node(value.fallback, context)})` : 'undefined'}}`;
    case 'condition': return `{${expr(value.when, context)} ? (${node(value.then, context).replace(/^\{([\s\S]*)\}$/, '$1')}) : ${value.else ? `(${node(value.else, context).replace(/^\{([\s\S]*)\}$/, '$1')})` : 'undefined'}}`;
    case 'collection': return `<For each={${expr(value.source, context)}}>{(${value.item}) => ${node(value.template, {...context, item:value.item})}}</For>`;
    case 'portal': return `<Portal mount={resolvePortalTarget(${expr(value.target, context)})} children={< >${value.children.map(x => node(x, context)).join('')}</ >} />`.replaceAll('< >', '<>').replaceAll('</ >', '</>');
    case 'compound': return `<div data-kumo-compound={${JSON.stringify(value.name)}}>${Object.entries(value.parts).map(([name, part]) => `<div data-kumo-part={${JSON.stringify(name)}}>${node(part, context)}</div>`).join('')}</div>`;
    case 'semantic-element': {
      if (value.tag.kind !== 'literal' || typeof value.tag.value !== 'string' || !/^[a-z][a-z0-9-]*$/.test(value.tag.value)) throw new Error('Solid semantic element requires a validated literal tag');
      const attributes = Object.entries(value.attributes).map(([name, val]) => `${name === 'className' ? 'class' : name}={${expr(val, context)}}`);
      if (value.classes.length) attributes.push(`class=${JSON.stringify(value.classes.map(x => {
        if (x.kind !== 'literal' || typeof x.value !== 'string') throw new Error('Solid semantic classes require validated literals');
        return x.value;
      }).join(' '))}`);
      return `<${value.tag.value}${attributes.length ? ' ' + attributes.join(' ') : ''}>${value.children.map(x => node(x, context)).join('')}</${value.tag.value}>`;
    }
    case 'element': {
      const attributes = [];
      for (const [name, val] of Object.entries(value.attributes ?? {})) attributes.push(`${name === 'className' ? 'class' : name}={${expr(val, context)}}`);
      for (const [name, val] of Object.entries(value.properties ?? {})) attributes.push(`${name}={${expr(val, context)}}`);
      for (const [name, val] of Object.entries(value.events ?? {})) attributes.push(`${name}={${expr(val, context)}}`);
      if (value.ref) attributes.push(`ref={refs.${value.ref}}`);
      if (value.styles?.length) attributes.push(`class={mergeStyles(${value.styles.map(x => expr(x, context)).join(', ')})}`);
      const tag = value.tag === 'field' || value.tag.includes('-') ? 'div' : value.tag;
      if (tag !== value.tag) attributes.push(`data-kumo-element={${JSON.stringify(value.tag)}}`);
      return `<${tag}${attributes.length ? ' ' + attributes.join(' ') : ''}>${(value.children ?? []).map(x => node(x, context)).join('')}</${tag}>`;
    }
    default: throw new Error(`unsupported Solid node: ${value.kind}`);
  }
}
const predicate = value => semanticPredicate(value, {fixture:'normalizedFixture'});
const safeType = type => type.replace(/ReactNode|Icon/g, 'JSX.Element').replace(/ReactElement/g, 'JSX.Element').replace(/ButtonHTMLAttributes/g, '__BUTTON_ATTRIBUTES__').replace(/HTMLAttributes/g, 'JSX.HTMLAttributes<HTMLDivElement>').replace(/__BUTTON_ATTRIBUTES__/g, 'JSX.ButtonHTMLAttributes<HTMLButtonElement>');
function declaration(model, toggle, nativeInput, clipboardCopy, paginationControls, menubarNavigation, dialogLayer, inputGroupComposition, sensitiveInput, comboboxCollection, autocompleteCollection, commandPalette, toastLifecycle, datePicker, dateRangePicker, popoverLayer, dropdownMenuLayer, selectCollection) {
  const nativeButton=Boolean(model.interactions?.nativeButton);
  const nativeInputElement=nativeInput?.requirements.dom?.[0];
  const modelProps = selectCollection ? [
    {name:'value', type:'select-value', required:false}, {name:'defaultValue', type:'select-value', required:false}, {name:'open', type:'dialog-open', required:false}, {name:'defaultOpen', type:'dialog-open', required:false}, {name:'multiple', type:'boolean', required:false}, {name:'disabled', type:'boolean', required:false}, {name:'placeholder', type:'string', required:false}, {name:'aria-label', type:'string', required:false}, {name:'onValueChange', type:'select-change', required:false}, {name:'onOpenChange', type:'dialog-change', required:false}, {name:'onItemHighlighted', type:'select-highlight', required:false}, {name:'onSelect', type:'select-change', required:false},
  ] : dateRangePicker ? [
    {name:'size', type:'range-size', required:false}, {name:'variant', type:'range-variant', required:false},
    {name:'onStartChange', type:'nullable-date-change', required:false}, {name:'onEndChange', type:'nullable-date-change', required:false},
  ] : datePicker ? [
    {name:'selectedDate', type:'date-string', required:false}, {name:'defaultMonthDate', type:'date-string', required:false},
    {name:'disabledBeforeDate', type:'date-string', required:false}, {name:'disabledAfterDate', type:'date-string', required:false},
    {name:'aria-label', type:'string', required:false}, {name:'onChange', type:'date-change', required:false},
  ] : toastLifecycle ? [
    ...model.props.items, {name:'onNotify', type:'callback', required:false}, {name:'onAction', type:'callback', required:false},
  ] : commandPalette ? [
    {name:'open', type:'dialog-open', required:false}, {name:'defaultOpen', type:'dialog-open', required:false}, {name:'items', type:'combobox-items', required:false},
    {name:'value', type:'string', required:false}, {name:'defaultValue', type:'string', required:false}, {name:'text', type:'string', required:false}, {name:'highlights', type:'highlight-ranges', required:false},
    {name:'onOpenChange', type:'dialog-change', required:false}, {name:'onValueChange', type:'sensitive-value-change', required:false}, {name:'onHighlightChange', type:'sensitive-value-change', required:false},
  ] : (comboboxCollection || autocompleteCollection) ? [
    {name:'items', type:'combobox-items', required:false}, {name:'value', type:'string', required:false}, {name:'defaultValue', type:'string', required:false},
    {name:'open', type:'dialog-open', required:false}, {name:'defaultOpen', type:'dialog-open', required:false}, {name:'onOpenChange', type:'dialog-change', required:false}, {name:'onValueChange', type:'sensitive-value-change', required:false},
  ] : sensitiveInput ? [
    {name:'label', type:'string', required:false}, {name:'defaultValue', type:'string', required:false},
    {name:'onValueChange', type:'sensitive-value-change', required:false}, {name:'onCopy', type:'callback', required:false},
  ] : dropdownMenuLayer ? [
    {name:'open', type:'dialog-open', required:false}, {name:'defaultOpen', type:'dialog-open', required:false}, {name:'onOpenChange', type:'dialog-change', required:false}, {name:'onSelect', type:'sensitive-value-change', required:false},
  ] : (dialogLayer || popoverLayer) ? [
    {name:'open', type:'dialog-open', required:false}, {name:'defaultOpen', type:'dialog-open', required:false}, {name:'onOpenChange', type:'dialog-change', required:false},
  ] : menubarNavigation ? [
    {name:'options', type:'menubar-options', required:true}, {name:'isActive', type:'menubar-active', required:false},
  ] : paginationControls ? [
    {name:'page', type:'number', required:true}, {name:'perPage', type:'number', required:true}, {name:'totalCount', type:'number', required:true},
    {name:'fixtureMode', type:'pagination-mode', required:false}, {name:'labels', type:'pagination-labels', required:false}, {name:'setPage', type:'pagination-callback', required:false},
  ] : clipboardCopy ? [
    ...model.props.items,
    {name:clipboardCopy.copySource.fallback, type:'string', required:false},
    {name:clipboardCopy.copySource.prop, type:'string', required:false},
    {name:'onCopy', type:'callback', required:false},
  ] : model.props.items;
  const props = modelProps.map(item => `  ${JSON.stringify(item.name)}${item.required ? '' : '?'}: ${item.type === 'number' ? 'number' : item.type === 'combobox-items' ? 'Array<string | {value: string; label?: string}>' : item.type === 'highlight-ranges' ? 'Array<[number, number]>' : item.type === 'dialog-open' ? 'boolean' : item.type === 'dialog-change' ? '(open: boolean) => void' : item.type === 'menubar-options' ? 'Array<{ id: string; tooltip: string; icon: JSX.Element; onClick?: () => void }>' : item.type === 'menubar-active' ? 'number | string' : item.type === 'pagination-mode' ? '"simple" | "dropdown"' : item.type === 'pagination-labels' ? '{ navigation?: string; previousPage?: string; nextPage?: string }' : item.type === 'pagination-callback' ? '(page: number) => void' : item.type === 'sensitive-value-change' ? '(value: string) => void' : item.type === 'select-value' ? 'unknown | unknown[]' : item.type === 'select-change' ? '(value: unknown | unknown[]) => void' : item.type === 'select-highlight' ? '(value: unknown) => void' : item.type === 'boolean' ? 'boolean' : item.type === 'date-string' ? 'string' : item.type === 'range-size' ? '"sm" | "md"' : item.type === 'range-variant' ? '"default" | "subtle"' : item.type === 'nullable-date-change' ? '(value: string | null) => void' : item.type === 'date-change' ? '(value: string) => void' : nativeButton&&['disabled','loading'].includes(item.name)||toggle&&[toggle.controlledProp,toggle.defaultProp,toggle.disabled.prop,toggle.indeterminate?.prop].includes(item.name)?'boolean':safeType(item.type).includes('callback') ? toggle&&item.name==='onCheckedChange'?'(checked: boolean) => void':(clipboardCopy&&item.name==='onCopy')||(toastLifecycle&&['onNotify','onAction'].includes(item.name))?'() => void':'(...args: unknown[]) => void' : clipboardCopy&&[clipboardCopy.copySource.prop,clipboardCopy.copySource.fallback].includes(item.name)?'string':'unknown'};`).join('\n');
  const slots = (model.composition.slots ?? []).map(value => typeof value === 'string' ? value : value.name).filter(Boolean).map(name => `  ${JSON.stringify(name)}?: JSX.Element;`).join('\n');
  const parts = compoundParts(model);
  const partDeclarations = parts.map(part => `export declare const ${part.symbol}: (props: CompoundPartProps) => JSX.Element;`).join('\n');
  const api = parts.reduce((tree, part) => { let cursor = tree; for (const segment of part.path.split('.')) cursor = cursor[segment] ??= {}; cursor.$ = part.symbol; return tree; }, {});
  const apiType = tree => `{ ${Object.entries(tree).map(([segment, child]) => `${JSON.stringify(segment)}: ${child.$ ? `typeof ${child.$}` : apiType(child)}`).join('; ')} }`;
  return `// @generated by src/kumo/emitters/solid/index.mjs; do not edit\nimport type { JSX } from "solid-js";\nexport interface ${model.public.symbol}Props${nativeButton?' extends JSX.ButtonHTMLAttributes<HTMLButtonElement>':nativeInputElement==='input'?' extends JSX.InputHTMLAttributes<HTMLInputElement>':nativeInputElement==='textarea'?' extends JSX.TextareaHTMLAttributes<HTMLTextAreaElement>':''} {\n${props}${slots ? '\n' + slots : ''}\n  children?: JSX.Element;\n  fixture?: unknown;\n  styles?: Record<string, string>;\n}\nexport interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }\n${partDeclarations}${partDeclarations ? '\n' : ''}export declare const ${model.public.symbol}: ((props: ${model.public.symbol}Props) => JSX.Element)${parts.length ? ` & ${apiType(api)}` : ''};\nexport default ${model.public.symbol};\n`;
}
function source(model, toggle, nativeInput, fieldControl, clipboardCopy, paginationControls, radioGroup, tabsNavigation, menubarNavigation, dialogLayer, inputGroupComposition, sensitiveInput, comboboxCollection, autocompleteCollection, commandPalette, toastLifecycle, datePicker, dateRangePicker, responsiveSidebar, popoverLayer, dropdownMenuLayer, selectCollection) {
  const root = model.draftImplementation.componentRoot;
  const tableOfContents = model.component === 'table-of-contents';
  requireContentBindings(model);
  const variants = model.draftImplementation.semanticVariants ?? [];
  const imports = new Set(['splitProps']);
  const serialized = JSON.stringify(root);
  if (serialized.includes('"kind":"collection"')) imports.add('For');
  const hasPortal = serialized.includes('"kind":"portal"');
  const defaults = Object.fromEntries(model.props.items.filter(x => x.default !== null && x.default !== undefined).map(x => [x.name, x.default]));
  const nativeNames = model.props.items.filter(x => x.nativeForwarding).map(x => x.name);
  const nativeButton = model.interactions?.nativeButton;
  const nativeInputElement=nativeInput?.requirements.dom?.[0];
  if(nativeButton||paginationControls||radioGroup||tabsNavigation||menubarNavigation||dialogLayer||inputGroupComposition||sensitiveInput||comboboxCollection||autocompleteCollection||commandPalette||popoverLayer||dropdownMenuLayer||selectCollection)imports.add('mergeProps');
  if(toggle || clipboardCopy || paginationControls || radioGroup || tabsNavigation || dialogLayer || inputGroupComposition || sensitiveInput || comboboxCollection || autocompleteCollection || commandPalette || popoverLayer || dropdownMenuLayer || selectCollection)imports.add('createSignal');
  if(commandPalette) { imports.add('For'); imports.add('Show'); imports.add('onMount'); }
  if(toastLifecycle) { imports.add('createSignal'); imports.add('mergeProps'); }
  if(datePicker || dateRangePicker) { imports.add('createSignal'); imports.add('mergeProps'); imports.add('For'); }
  if(responsiveSidebar) { imports.add('createSignal'); imports.add('mergeProps'); imports.add('For'); }
  if(comboboxCollection || autocompleteCollection) { imports.add('For'); imports.add('Show'); }
  if(inputGroupComposition)imports.add('createUniqueId');
  if(dialogLayer||popoverLayer||dropdownMenuLayer)imports.add('Show');
  if(dropdownMenuLayer||selectCollection)imports.add('For');
  if(selectCollection)imports.add('Show');
  if(radioGroup || tabsNavigation || menubarNavigation || tableOfContents)imports.add('For');
  const localNames = nativeButton ? [...new Set([...model.props.items.filter(x => !x.nativeForwarding).map(x => x.name), 'children', 'fixture', 'styles', 'onClick'])] : nativeNames;
  const toggleTag=toggle?.native.root;
  const toggleRole=toggleTag==='span'?'checkbox':'switch';
  const toggleClass=toggle?.native.styleVariants.length?` class={mergeStyles(${toggle.native.styleVariants.map(variant=>`(${Object.entries(variant.when).map(([name,value])=>`props.${name} === ${JSON.stringify(value)}`).join(' && ')||'true'}) ? ${JSON.stringify(variant.classes.join(' '))} : ""`).join(', ')})}`:'';
  const tableOfContentsFallback=tableOfContents?`<nav aria-label={String(tocFixture()?.props?.["aria-label"] ?? "Table of contents")}><Show when={tocTitle()} children={<p>{tocTitle()}</p>} /><ul><For each={tocItems()} children={item => item.group ? <a href={item.href} aria-current={item.active ? "location" : undefined}>{item.label}</a> : <li><a href={item.href} aria-current={item.active ? "location" : undefined}>{item.label}</a></li>} /></ul></nav>`:null;
  if(tableOfContents)imports.add('Show');
  const toggleFallback=toggle?(toggleTag==='span'?`<span${toggleClass} aria-label={props["aria-label"] as string} role=${JSON.stringify(toggleRole)} aria-checked={currentIndeterminate() ? "mixed" : checked()} aria-disabled={Boolean(props.${toggle.disabled.prop}) || undefined} tabIndex={props.${toggle.disabled.prop} ? undefined : 0} onClick={toggleChecked} onKeyDown={toggleOnKeyDown} />`:`<button${toggleClass} aria-label={props["aria-label"] as string} type="button" role=${JSON.stringify(toggleRole)} aria-checked={checked()} disabled={Boolean(props.${toggle.disabled.prop})} onClick={toggleChecked} />`):null;
  const nativeInputBare = nativeInputElement ? `<${nativeInputElement} {...native} class={mergeStyles(styles.root, props.class)} value={props.${nativeInput?.uncontrolled.prop} as string | number | string[] | undefined} disabled={Boolean(props.disabled)} onInput={nativeInputHandler}></${nativeInputElement}>` : null;
  const ownedControlId = fieldControl?.ownsControl && nativeInputElement ? `kumo-${crypto.createHash('sha256').update(model.modelDigest).digest('hex').slice(0, 12)}` : null;
  const nativeInputFallback = nativeInputBare && ownedControlId ? `props.label != null ? <div><label for=${JSON.stringify(ownedControlId)}>{props.label as JSX.Element}</label><${nativeInputElement} {...native} id=${JSON.stringify(ownedControlId)} class={mergeStyles(styles.root, props.class)} value={props.${nativeInput?.uncontrolled.prop} as string | number | string[] | undefined} disabled={Boolean(props.disabled)} onInput={nativeInputHandler}></${nativeInputElement}></div> : ${nativeInputBare}` : nativeInputBare;
  const providedFieldFallback = fieldControl && !fieldControl.ownsControl ? `<div><label for={props.controlId as string ?? "field-control"}>{props.label as JSX.Element}</label>{props.children}</div>` : null;
  const clipboardFallback = clipboardCopy ? `<div>{props.${clipboardCopy.copySource.fallback} as JSX.Element}<button type="button" onClick={copyText}>Copy</button><span aria-live="polite">{copyStatus()}</span></div>` : null;
  const paginationFallback = paginationControls ? `<div data-slot="pagination"><nav ref={navEl} aria-label={(props.labels as {navigation?: string} | undefined)?.navigation ?? "Pagination"}>{props.fixtureMode !== "simple" ? <button type="button" aria-label="First page" disabled={currentPage() === 1} onClick={() => proposePage(1)}>First</button> : undefined}<button type="button" aria-label={(props.labels as {previousPage?: string} | undefined)?.previousPage ?? "Previous page"} disabled={currentPage() === 1} onClick={() => proposePage(currentPage() - 1)}>Previous</button>{props.fixtureMode !== "simple" ? <input aria-label="Page number" value={inputValue()} onInput={pageInput} onKeyDown={pageKeyDown} onBlur={pageBlur} /> : undefined}<button type="button" aria-label={(props.labels as {nextPage?: string} | undefined)?.nextPage ?? "Next page"} disabled={currentPage() === maxPage()} onClick={() => proposePage(currentPage() + 1)}>Next</button>{props.fixtureMode !== "simple" ? <button type="button" aria-label="Last page" disabled={currentPage() === maxPage()} onClick={() => proposePage(maxPage())}>Last</button> : undefined}{props.fixtureMode === "dropdown" ? <><button type="button" aria-label="Page size">{String(props.perPage)}</button><button type="button" aria-label="Page size menu">Page size</button></> : undefined}</nav></div>` : null;
  const radioFallback = radioGroup ? `<div ref={radioRoot} role="radiogroup" aria-label={radioFixture().legend}><For each={radioFixture().items} children={(item, index) => <div role="radio" aria-checked={selectedValue() === item.value} aria-label={item.label} aria-disabled={Boolean(radioFixture().disabled || item.disabled) || undefined} tabindex={radioFixture().disabled || item.disabled ? undefined : 0} onClick={() => selectRadio(item)} onKeyDown={event => radioKeyDown(event, index())}>{item.label}</div>} /></div>` : null;
  const tabsFallback = tabsNavigation ? `<div><For each={props.tabs as TabItem[]} children={(item, index) => <button ref={element => { tabElements[index()] = element; }} type="button" role="tab" aria-selected={selectedValue() === item.value} tabindex={focusedIndex() === index() ? 0 : -1} onClick={() => commitTab(item.value)} onFocus={() => setFocusedIndex(index())} onKeyDown={event => tabKeyDown(event, index())}>{item.label}</button>} /></div>` : null;
  const menubarFallback = menubarNavigation ? `<nav class=${JSON.stringify(menubarNavigation.root.classes.join(' '))}><For each={props.options as MenuBarOption[]} children={(item, index) => <button ref={element => { menuButtons[index()] = element; }} type="button" aria-label={item.tooltip} title={item.tooltip} onClick={() => item.onClick?.()} onKeyDown={event => menuKeyDown(event, index())}><span aria-hidden="true">{item.icon}</span></button>} /></nav>` : null;
  const dialogFallback = dialogLayer ? `<><button ref={triggerElement} type="button" data-kumo-component="Dialog" data-kumo-part="trigger" aria-haspopup="dialog" onClick={() => setDialogOpen(true)}>{props.Trigger != null ? fixtureText(props.Trigger) : compoundFixtureText(props.fixture, ".Trigger")}</button><Show when={dialogOpen()} children={<Portal mount={document.body} children={<div ref={dialogElement} role="dialog" tabindex="-1">{props.Title as JSX.Element}{props.Description as JSX.Element}<button type="button" data-kumo-part="close" onClick={() => setDialogOpen(false)}>{props.Close as JSX.Element}</button>{props.children}</div>} />} /></>` : null;
  const popoverFallback = popoverLayer ? `<><button ref={popoverTrigger} type="button" tabindex="0" aria-haspopup="dialog" aria-expanded={popoverOpen()} data-kumo-component="Popover" data-kumo-part="trigger" onClick={() => setPopoverOpen(!popoverOpen())} onKeyDown={popoverKeyDown}>{popoverTriggerText()}</button><Show when={popoverOpen()} children={<div ref={popoverContent} role="dialog" data-side={popoverSide()} data-align={popoverContentProps().align as string ?? "center"} data-position-method={popoverContentProps().positionMethod as string ?? "absolute"} onKeyDown={popoverKeyDown}>{popoverContentText()}</div>} /></>` : null;
  const selectFallback = selectCollection ? `<div><button ref={selectTrigger} type="button" tabindex="0" role="combobox" aria-expanded={selectOpen()} aria-haspopup="listbox" aria-label={props["aria-label"] as string} data-kumo-component="Select" data-kumo-part="trigger" onClick={() => setSelectOpen(!selectOpen())} onKeyDown={selectKeyDown}>{selectLabel()}</button><Show when={selectOpen()} children={<div role="listbox"><For each={selectOptions()} children={(item, index) => <div ref={element => { selectElements[index()] = element; }} role="option" tabindex="-1" aria-disabled={item.disabled || undefined} onClick={() => selectOption(item, index())} onKeyDown={selectKeyDown}>{item.label}</div>} /></div>} /></div>` : null;
  const dropdownFallback = dropdownMenuLayer ? `<button ref={dropdownTrigger} type="button" tabindex="0" aria-haspopup="menu" aria-expanded={dropdownOpen()} onClick={() => setDropdownOpen(!dropdownOpen())} onKeyDown={dropdownTriggerKeyDown}>{dropdownTriggerText()}<Show when={dropdownOpen()} children={<Portal mount={document.body} children={<><div role="menu"><For each={dropdownItems()} children={item => <button type="button" role="menuitem" disabled={item.disabled} aria-disabled={item.disabled || undefined} tabindex="-1" onPointerDown={event => selectDropdownItem(item, event)} onKeyDown={event => dropdownItemKeyDown(event, item)}>{item.text}</button>} /></div><Show when={submenuOpen()} children={<div role="menu"><For each={dropdownSubItems()} children={item => <button type="button" role="menuitem" tabindex="-1">{item.text}</button>} /></div>} /></>} />} /></button>` : null;
  const comboboxFallback = comboboxCollection ? `<><input ref={comboboxInput} placeholder={comboboxTrigger().props.placeholder as string} value={comboboxValue()} onClick={() => setComboboxOpen(true)} onKeyDown={comboboxKeyDown} /><Show when={comboboxOpen()} children={<ul role="listbox"><For each={comboboxItems()} children={(item, index) => <li role="option" data-value={item.value} aria-selected={highlightedIndex() === index()}>{fixtureText(item)}</li>} /></ul>} /></>` : null;
  const autocompleteFallback = autocompleteCollection ? `<><input ref={autocompleteInput} placeholder={autocompleteInputGroup().props.placeholder as string} value={autocompleteValue()} onInput={autocompleteOnInput} onKeyDown={autocompleteKeyDown} /><Show when={autocompleteOpen()} children={<ul role="listbox"><For each={autocompleteItems()} children={(item, index) => <li role="option" data-value={item.value} aria-selected={autocompleteHighlightedIndex() === index()}>{fixtureText(item)}</li>} /></ul>} /></>` : null;
  const sensitiveInputFallback = sensitiveInput ? `<div data-kumo-component="SensitiveInput"><div data-kumo-part="masked-container" onClick={revealSensitive}>Value hidden</div><input ref={sensitiveInputElement} data-kumo-part="input" type="password" aria-label={props.label as string} value={sensitiveValue()} onInput={sensitiveOnInput} onKeyDown={sensitiveOnKeyDown} /><button type="button" data-kumo-part="reveal" onClick={revealSensitive}>Reveal</button><button type="button" data-kumo-part="copy" onClick={copySensitive}>Copy</button><div aria-live="polite">{sensitiveAnnouncement()}</div></div>` : null;
  const inputGroupFallback = inputGroupComposition ? `<div data-kumo-component="InputGroup"><label for={inputGroupId}>{inputGroupFixture().props.label as JSX.Element}</label><span>{inputGroupFixture().props.description as JSX.Element}</span>{compoundFixtureText(props.fixture, ".Addon")}<input id={inputGroupId} aria-label={inputGroupPart(".Input").props["aria-label"] as string} disabled={Boolean(inputGroupPart(".Input").props.disabled)} value={inputGroupValue()} onInput={inputGroupOnInput} /><button type="button" data-variant={inputGroupPart(".Button").props.variant as string}>{compoundFixtureText(props.fixture, ".Button")}</button>{compoundFixtureText(props.fixture, ".Suffix")}</div>` : null;
  const datePickerFallback = datePicker ? `<div aria-label={props["aria-label"] as string}><button type="button" aria-label="Previous month">Previous</button><button type="button" aria-label="Next month">Next</button><table role="grid"><tbody><For each={datePickerWeeks()} children={week => <tr><For each={week} children={day => <td><button type="button" data-day={day.iso} disabled={day.disabled} aria-selected={selectedDate() === day.iso || undefined} onClick={event => selectDate(day, event)}>{day.day}</button></td>} /></tr>} /></tbody></table></div>` : null;
  const dateRangePickerFallback = dateRangePicker ? `<div ref={dateRangeRoot} tabindex="-1" class={"kumo-date-range " + rangeClasses()}><div class="kumo-date-range__toolbar"><button type="button" data-navigation="previous" aria-label="Previous month" onClick={() => moveRangeMonth(-1)}>Previous</button><button type="button" data-navigation="next" aria-label="Next month" onClick={() => moveRangeMonth(1)}>Next</button></div><div class="kumo-date-range__months"><For each={rangeMonths()} children={month => <section class="kumo-date-range__month"><h3>{month.label}</h3><div class="kumo-date-range__weekdays" aria-hidden="true"><For each={["Su","Mo","Tu","We","Th","Fr","Sa"]} children={day => <span>{day}</span>} /></div><div class="kumo-date-range__grid" role="grid"><For each={month.days} children={day => <button type="button" data-day={day.iso} data-outside-month={!day.inMonth || undefined} aria-label={day.iso} aria-selected={day.iso === rangeStart() || day.iso === rangeEnd() || undefined} data-in-range={rangeDayInRange(day.iso) || undefined} onClick={() => selectRangeDay(day.iso)}>{day.day}</button>} /></div></section>} /></div><div class="kumo-date-range__footer"><span aria-live="polite">{rangeStart() ? (rangeEnd() ? rangeStart() + " – " + rangeEnd() : "Start: " + rangeStart()) : "Choose a start date"}</span><button type="button" data-reset onClick={resetDateRange}>Reset dates</button></div></div>` : null;
  const sidebarFallback = responsiveSidebar ? `sidebarKind() === "collapsible" ? <div></div> : <div data-sidebar-wrapper="" data-state={sidebarState()} data-side="left" data-open={sidebarOpen()} data-width={sidebarWidth()}><aside data-state={sidebarState()} data-side="left" data-collapsible="icon">{sidebarKind() === "expanded" ? <><span>{sidebarText(".Header")}</span><span>{sidebarText(".GroupLabel")}</span><ul><For each={sidebarMenuButtons()} children={item => <li><button type="button">{fixtureText(item)}</button></li>} /></ul><span>{sidebarText(".Footer")}</span><button type="button" aria-expanded={sidebarOpen()} aria-label={sidebarOpen() ? "Collapse sidebar" : "Expand sidebar"}></button></> : undefined}{sidebarKind() === "resize" ? <div ref={sidebarResizeHandle} role="separator" tabindex="0" aria-label=${JSON.stringify(responsiveSidebar.resize.label)} onKeyDown={sidebarResizeKeyDown}></div> : undefined}</aside></div>` : null;
  const toastFallback = toastLifecycle ? `<div data-kumo-component="Toasty">{props.children}<button type="button" data-notify aria-label="Notify" onClick={notifyToast}></button>{toastVisible() ? <div role="status" aria-live="polite"><strong>Saved</strong><span>Changes saved</span><button type="button" data-toast-action onClick={toastAction}>Action</button><button type="button" aria-label="Close" onClick={closeToast}>Close</button></div> : undefined}</div>` : null;
  const commandPaletteFallback = commandPalette ? `props.text !== undefined ? <span><For each={highlightSegments()} children={segment => segment.mark ? <mark>{segment.text}</mark> : segment.text} /></span> : <Show when={paletteOpen()} fallback={<></>} children={<div data-kumo-component="CommandPalette"><input ref={commandPaletteInput} value={paletteValue()} onInput={commandPaletteOnInput} onKeyDown={commandPaletteKeyDown} /><ul role="listbox"><For each={paletteItems()} children={(item, index) => <li role="option" aria-selected={highlightedPaletteIndex() === index()}>{item.label}</li>} /></ul></div>} />` : null;
  const fallback = tableOfContentsFallback ?? selectFallback ?? dropdownFallback ?? popoverFallback ?? sidebarFallback ?? dateRangePickerFallback ?? datePickerFallback ?? toastFallback ?? commandPaletteFallback ?? autocompleteFallback ?? comboboxFallback ?? sensitiveInputFallback ?? inputGroupFallback ?? dialogFallback ?? menubarFallback ?? tabsFallback ?? radioFallback ?? paginationFallback ?? clipboardFallback ?? (nativeButton
    ? `<button id={props.id as string} class={props.class as string} name={props.name as string} value={props.value as string} data-probe={props["data-probe"] as string} aria-label={props["aria-label"] as string} type={(props.type as JSX.ButtonHTMLAttributes<HTMLButtonElement>["type"]) ?? "button"} disabled={Boolean(props.disabled || props.loading)} onClick={props.onClick as JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>}>{props.loading ? <svg aria-hidden="true" /> : undefined}{props.children}</button>`
    : nativeInputFallback ?? providedFieldFallback ?? toggleFallback ?? node(root));
  for (const op of model.draftImplementation.operations) if (!['render','emit','state','ref','focus','lifecycle','browser-service','portal','style'].includes(op.kind)) throw new Error(`${model.component}: unsupported operation ${op.kind}`);
  const parts = compoundParts(model);
  const partSources = parts.map(part => `export function ${part.symbol}(props: CompoundPartProps): JSX.Element {\n  const [local, native] = splitProps(props, ["children"]);\n  return <div {...native} data-kumo-part=${JSON.stringify(part.path)}>{local.children}</div>;\n}`).join('\n\n');
  const attachments = parts.map(part => `Object.defineProperty(${part.path.split('.').reduce((base, segment, index, all) => index === all.length - 1 ? base : `${base}.${all[index]}`, model.public.symbol)}, ${JSON.stringify(part.path.split('.').at(-1))}, {value:${part.symbol}, enumerable:true});`).join('\n');
  const intermediatePaths = [...new Set(parts.flatMap(part => { const segments = part.path.split('.'); return segments.slice(0,-1).map((_, i) => segments.slice(0,i+1).join('.')); }))].sort();
  const intermediates = intermediatePaths.map(pathValue => `Object.defineProperty(${pathValue.split('.').slice(0,-1).reduce((base, segment) => `${base}.${segment}`, model.public.symbol)}, ${JSON.stringify(pathValue.split('.').at(-1))}, {value:{}, enumerable:true});`).join('\n');
  const semantic = (nativeInputElement || clipboardCopy || paginationControls || radioGroup || tabsNavigation || menubarNavigation || dialogLayer || popoverLayer || dropdownMenuLayer || selectCollection || inputGroupComposition || sensitiveInput || comboboxCollection || autocompleteCollection || commandPalette || toastLifecycle || datePicker || dateRangePicker || responsiveSidebar || tableOfContents) ? '' : [...variants].sort((a, b) => b.when.length - a.when.length).map(variant => `  if (${variant.when.map(predicate).join(' && ') || 'true'}) return (${node(variant.tree)});`).join('\n');
  return `// @generated by src/kumo/emitters/solid/index.mjs; do not edit\nimport { ${[...imports].sort().join(', ')} } from "solid-js";\n${hasPortal || dialogLayer || dropdownMenuLayer ? 'import { Portal } from "solid-js/web";\n' : ''}import type { JSX } from "solid-js";\n\nexport interface ${model.public.symbol}Props extends Record<string, unknown> { children?: JSX.Element; fixture?: unknown; styles?: Record<string, string>; }\nexport interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }\nexport const modelDigest = ${JSON.stringify(model.modelDigest)};\nexport const contentBindingDigest = ${JSON.stringify(model.contentBindings.capabilityDigest)};\nexport const semanticVariantDigests = ${JSON.stringify(Object.fromEntries(variants.map(v => [v.id, v.expectationDigest])))} as const;\nconst styles: Record<string, string> = ${JSON.stringify(Object.fromEntries(['root', ...model.dependencies.styles].map(x => [x, x])))};\nconst mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");\nconst semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);\nconst normalizeRenderContent = (value: unknown, accessors = false): string => {\n  if (value == null || value === false || value === true) return "";\n  if (typeof value === "string" || typeof value === "number") return String(value);\n  if (Array.isArray(value)) return value.map(item => normalizeRenderContent(item, accessors)).join("");\n  if (accessors && typeof value === "function") return normalizeRenderContent(value(), accessors);\n  if (typeof value === "object") { const item = value as {text?: unknown; children?: unknown}; return (typeof item.text === "string" ? item.text : "") + (Array.isArray(item.children) ? item.children.map(child => normalizeRenderContent(child)).join("") : ""); }\n  return "";\n};\nconst normalizeFixture = (value: unknown): unknown => Array.isArray(value) ? value.map(normalizeFixture) : value && typeof value === "object" ? Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalizeFixture(item)])) : value;\nconst fixtureText = (value: unknown): string => normalizeRenderContent(value);
const compoundFixtureText = (value: unknown, exported: string): string => {
  const visit = (item: unknown): string => {
    if (!item || typeof item !== "object") return "";
    const node = item as {export?: unknown; text?: unknown; children?: unknown[]};
    if (node.export === exported) return fixtureText(node);
    return Array.isArray(node.children) ? node.children.map(visit).join("") : "";
  };
  return visit(value);
};\nconst resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;\n\nexport function ${model.public.symbol}(incoming: ${model.public.symbol}Props): JSX.Element {\n  const props = ${(nativeButton||paginationControls||radioGroup||tabsNavigation||menubarNavigation||dialogLayer||inputGroupComposition||sensitiveInput||comboboxCollection||autocompleteCollection||commandPalette||toastLifecycle||datePicker||dateRangePicker||responsiveSidebar||popoverLayer||dropdownMenuLayer||selectCollection)?'mergeProps':'Object.assign'}(${JSON.stringify(toggle ? Object.fromEntries(Object.entries(defaults).filter(([name]) => name !== toggle.controlledProp)) : defaults)}, incoming);\n  const fixture = props.fixture;\n  const renderContent = normalizeRenderContent(props.children, true);\n  const normalizedFixture = normalizeFixture(fixture);\n  const state: Record<string, () => unknown> = {};\n${tableOfContents ? `  type TocNode = {export?: string; text?: string; props?: Record<string, unknown>; children?: TocNode[]};
  const tocFixture = () => props.fixture as TocNode | undefined;
  const tocChildren = (node?: TocNode): TocNode[] => node?.children ?? [];
  const tocText = (node?: TocNode): string => node ? String(node.text ?? "") + tocChildren(node).map(tocText).join("") : "";
  const tocTitle = () => tocText(tocChildren(tocFixture()).find(node => node.export === ".Title"));
  const tocList = () => tocChildren(tocFixture()).find(node => node.export === ".List");
  const tocItems = () => tocChildren(tocList()).flatMap(node => node.export === ".Group" ? [node, ...tocChildren(node)] : [node]).filter(node => node.export === ".Item" || node.export === ".Group").map(node => ({href:String(node.props?.href ?? "#"),active:Boolean(node.props?.active),label:String(node.props?.label ?? tocText(node)),group:node.export === ".Group"}));
` : ''}${selectCollection ? `  type SelectFixtureNode = {export?: string; props?: Record<string, unknown>; text?: string; children?: SelectFixtureNode[]};
  type SelectOption = {value: unknown; label: string; disabled: boolean};
  const selectFixture = () => props.fixture as SelectFixtureNode | null;
  const selectOptions = (): SelectOption[] => { const found: SelectOption[] = []; const visit = (node: SelectFixtureNode | null | undefined) => { if (!node) return; if (node.export === ".Option") found.push({value:node.props?.value, label:fixtureText(node), disabled:Boolean(node.props?.disabled)}); else node.children?.forEach(visit); }; visit(selectFixture()); return found; };
  const hasValue = Object.prototype.hasOwnProperty.call(incoming, "value");
  const hasOpen = Object.prototype.hasOwnProperty.call(incoming, "open");
  const [ownValue, setOwnValue] = createSignal<unknown>(Object.prototype.hasOwnProperty.call(incoming, "defaultValue") ? incoming.defaultValue : incoming.multiple ? [] : null);
  const [ownOpen, setOwnOpen] = createSignal(Boolean(incoming.defaultOpen));
  const selectValue = () => hasValue ? props.value : ownValue();
  const selectOpen = () => hasOpen ? Boolean(props.open) : ownOpen();
  const [activeSelectIndex, setActiveSelectIndex] = createSignal(-1);
  const selectElements: HTMLElement[] = [];
  let selectTrigger: HTMLButtonElement | undefined;
  const setSelectOpen = (next: boolean) => { if (props.disabled) return; if (!hasOpen) setOwnOpen(next); (props.onOpenChange as ((open:boolean) => void) | undefined)?.(next); };
  const selectLabel = () => { const value = selectValue(); if (Array.isArray(value)) return value.map(entry => selectOptions().find(item => semanticEqual(item.value, entry))?.label ?? "").filter(Boolean).join(", ") || String(props.placeholder ?? ""); return selectOptions().find(item => semanticEqual(item.value, value))?.label ?? String(props.placeholder ?? ""); };
  const highlightSelect = (index: number) => { const items=selectOptions(); if (!items.length) return; let next=Math.max(0,Math.min(items.length-1,index)); while (items[next]?.disabled && next<items.length-1) next++; while (items[next]?.disabled && next>0) next--; if (items[next]?.disabled) return; setActiveSelectIndex(next); (props.onItemHighlighted as ((value:unknown)=>void)|undefined)?.(items[next].value); queueMicrotask(() => { const element=selectElements[next]; element?.focus(); element?.scrollIntoView?.({block:"nearest"}); element?.setAttribute("data-highlight-scrolled", "true"); }); };
  const selectOption = (item: SelectOption, index: number) => { if (props.disabled || item.disabled) return; let next: unknown = item.value; if (props.multiple) { const current=Array.isArray(selectValue()) ? selectValue() as unknown[] : []; next=current.some(value=>semanticEqual(value,item.value)) ? current : [...current,item.value]; } if (!hasValue) setOwnValue(next); (props.onSelect as ((value:unknown)=>void)|undefined)?.(item.value); (props.onValueChange as ((value:unknown)=>void)|undefined)?.(next); if (!props.multiple) { setSelectOpen(false); if (hasOpen) highlightSelect(index); else queueMicrotask(()=>selectTrigger?.focus()); } };
  const selectKeyDown = (event: KeyboardEvent) => { if (props.disabled) return; const items=selectOptions(); if (event.key === "Tab") { if (selectOpen()) setSelectOpen(false); event.preventDefault(); queueMicrotask(()=>selectTrigger?.focus()); return; } if (event.key === "Escape") { event.preventDefault(); setSelectOpen(false); queueMicrotask(()=>selectTrigger?.focus()); return; } if (!selectOpen() && event.key === "ArrowDown") { event.preventDefault(); setSelectOpen(true); highlightSelect(Math.max(0, items.findIndex(item=>semanticEqual(item.value,selectValue())))); return; } if (!selectOpen()) return; let index=-1; if (event.key === "Home") index=0; else if (event.key === "End") index=items.length-1; else if (event.key === "ArrowDown") index=activeSelectIndex()+1; else if (event.key.length === 1) index=items.findIndex(item=>!item.disabled && item.label.toLowerCase().startsWith(event.key.toLowerCase())); else return; if(index>=0){event.preventDefault();highlightSelect(index);} };
` : ''}${dropdownMenuLayer ? `  type DropdownFixtureNode = {export?: string; props?: Record<string, unknown>; text?: string; children?: DropdownFixtureNode[]};
  const dropdownFixture = () => props.fixture as DropdownFixtureNode;
  const findDropdownPart = (exported: string, value: DropdownFixtureNode = dropdownFixture()): DropdownFixtureNode | undefined => value?.export === exported ? value : value?.children?.map(child => findDropdownPart(exported, child)).find(Boolean);
  const dropdownTriggerText = () => fixtureText(findDropdownPart(".Trigger")) || ${JSON.stringify(dropdownMenuLayer.trigger.text)};
  const dropdownItems = () => (findDropdownPart(".Content")?.children ?? []).map(node => node.export === ".Sub" ? findDropdownPart(".SubTrigger", node)! : node).filter(node => node?.export === ".Item" || node?.export === ".SubTrigger").map(node => ({node, text:fixtureText(node), disabled:Boolean(node.props?.disabled), submenu:node.export === ".SubTrigger"}));
  const dropdownSubItems = () => (findDropdownPart(".SubContent")?.children ?? []).filter(node => node.export === ".Item").map(node => ({text:fixtureText(node)}));
  const controlled = incoming.open !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = createSignal(Boolean(incoming.defaultOpen));
  const [submenuOpen, setSubmenuOpen] = createSignal(false);
  const dropdownOpen = () => controlled ? Boolean(props.open) : uncontrolledOpen();
  let dropdownTrigger: HTMLButtonElement | undefined;
  const setDropdownOpen = (next: boolean) => { if (!controlled) setUncontrolledOpen(next); (props.onOpenChange as ((open: boolean) => void) | undefined)?.(next); };
  const focusFirstDropdownItem = () => queueMicrotask(() => document.querySelector<HTMLElement>('[role="menuitem"]:not(:disabled)')?.focus());
  const dropdownTriggerKeyDown = (event: KeyboardEvent) => { if (event.key !== ${JSON.stringify(dropdownMenuLayer.keyboard.openKey)}) return; event.preventDefault(); setDropdownOpen(true); focusFirstDropdownItem(); };
  const closeDropdown = () => { setSubmenuOpen(false); setDropdownOpen(false); queueMicrotask(() => dropdownTrigger?.focus()); };
  const selectDropdownItem = (item: {text: string; disabled: boolean}, event: PointerEvent) => { if (item.disabled) { event.preventDefault(); return; } (props.onSelect as ((value: string) => void) | undefined)?.(item.text); setDropdownOpen(false); setDropdownOpen(false); queueMicrotask(() => (document.activeElement as HTMLElement | null)?.blur()); };
  const dropdownItemKeyDown = (event: KeyboardEvent, item: {text: string; disabled: boolean; submenu: boolean}) => { if (event.key === ${JSON.stringify(dropdownMenuLayer.keyboard.dismissKey)}) { event.preventDefault(); closeDropdown(); return; } if (event.key === ${JSON.stringify(dropdownMenuLayer.keyboard.submenuKey)}) { event.preventDefault(); setSubmenuOpen(true); queueMicrotask(() => document.querySelector<HTMLElement>('[role="menu"]:last-of-type [role="menuitem"]')?.focus()); return; } if (event.key.length === 1) { const target = dropdownItems().find(candidate => !candidate.disabled && candidate.text.toLowerCase().startsWith(event.key.toLowerCase())); if (target) queueMicrotask(() => [...document.querySelectorAll<HTMLElement>('[role="menuitem"]')].find(element => element.textContent === target.text)?.focus()); } };
` : ''}${popoverLayer ? `  type PopoverFixtureNode = {export?: string; props?: Record<string, unknown>; text?: string; children?: PopoverFixtureNode[]};
  const popoverFixture = () => props.fixture as PopoverFixtureNode;
  const findPopoverPart = (exported: string, value: PopoverFixtureNode = popoverFixture()): PopoverFixtureNode | undefined => value?.export === exported ? value : value?.children?.map(child => findPopoverPart(exported, child)).find(Boolean);
  const popoverContentProps = () => findPopoverPart(".Content")?.props ?? {};
  const popoverTriggerText = () => fixtureText(findPopoverPart(".Trigger"));
  const popoverContentText = () => fixtureText(findPopoverPart(".Content"));
  const controlled = incoming.open !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = createSignal(Boolean(incoming.defaultOpen));
  const popoverOpen = () => controlled ? Boolean(props.open) : uncontrolledOpen();
  let popoverTrigger: HTMLButtonElement | undefined;
  let popoverContent: HTMLDivElement | undefined;
  const setPopoverOpen = (next: boolean) => { if (!controlled) setUncontrolledOpen(next); (props.onOpenChange as ((open: boolean) => void) | undefined)?.(next); if (!next) queueMicrotask(() => popoverTrigger?.focus()); };
  const popoverSide = () => { const requested = String(popoverContentProps().side ?? "bottom"); if (requested !== "top" || !popoverTrigger) return requested; const rect = popoverTrigger.getBoundingClientRect(); const offset = Number(popoverContentProps().sideOffset ?? 8); return rect.top < offset + 48 ? "bottom" : "top"; };
  const popoverKeyDown = (event: KeyboardEvent) => { if (event.key !== ${JSON.stringify(popoverLayer.dismiss.key)}) return; event.preventDefault(); setPopoverOpen(false); };
` : ''}${responsiveSidebar ? `  type SidebarFixtureNode = {export?: string; props?: Record<string, unknown>; text?: string; children?: SidebarFixtureNode[]};
  const sidebarFixture = () => props.fixture as SidebarFixtureNode;
  const sidebarProviderProps = () => sidebarFixture()?.export === ".Provider" ? sidebarFixture().props ?? {} : {};
  const sidebarFind = (exported: string, value: SidebarFixtureNode = sidebarFixture()): SidebarFixtureNode | undefined => value?.export === exported ? value : value?.children?.map(child => sidebarFind(exported, child)).find(Boolean);
  const sidebarKind = () => sidebarFind(".Collapsible") ? "collapsible" : sidebarFind(".ResizeHandle") ? "resize" : sidebarFind(".Menu") ? "expanded" : "collapsed";
  const sidebarMenuButtons = () => (sidebarFind(".Menu")?.children ?? []).filter(item => item.export === ".MenuButton");
  const sidebarText = (exported: string) => fixtureText(sidebarFind(exported));
  const [sidebarOpen, setSidebarOpen] = createSignal(Boolean(sidebarProviderProps().defaultOpen ?? true));
  const [sidebarWidth, setSidebarWidth] = createSignal(Number(sidebarProviderProps().defaultWidth ?? 256));
  const sidebarState = () => sidebarOpen() ? "expanded" : "collapsed";
  let sidebarResizeHandle: HTMLDivElement | undefined;
  const sidebarResizeKeyDown: JSX.EventHandlerUnion<HTMLDivElement, KeyboardEvent> = event => { if (event.key !== ${JSON.stringify(responsiveSidebar.resize.key)}) return; event.preventDefault(); setSidebarOpen(${JSON.stringify(responsiveSidebar.resize.open)}); setSidebarWidth(${JSON.stringify(responsiveSidebar.resize.width)}); sidebarResizeHandle?.focus(); };
` : ''}${dateRangePicker ? `  type DateRangeDay = {iso: string; day: number; inMonth: boolean};
  type DateRangeMonth = {key: string; label: string; days: DateRangeDay[]};
  const [rangeMonth, setRangeMonth] = createSignal("2026-06-01");
  const [rangeStart, setRangeStart] = createSignal<string | null>(null);
  const [rangeEnd, setRangeEnd] = createSignal<string | null>(null);
  let dateRangeRoot: HTMLDivElement | undefined;
  const buildRangeMonth = (value: string): DateRangeMonth => { const base=new Date(value+"T00:00:00.000Z"), year=base.getUTCFullYear(), month=base.getUTCMonth(), first=new Date(Date.UTC(year,month,1)), start=new Date(first); start.setUTCDate(1-first.getUTCDay()); const days=Array.from({length:42},(_,index)=>{const date=new Date(start);date.setUTCDate(start.getUTCDate()+index);return {iso:date.toISOString().slice(0,10),day:date.getUTCDate(),inMonth:date.getUTCMonth()===month};}); return {key:year+"-"+month,label:new Intl.DateTimeFormat("en-US",{month:"long",year:"numeric",timeZone:"UTC"}).format(first),days}; };
  const rangeMonths = () => [0,1].map(offset => { const date=new Date(rangeMonth()+"T00:00:00.000Z"); date.setUTCMonth(date.getUTCMonth()+offset); return buildRangeMonth(date.toISOString().slice(0,7)+"-01"); });
  const moveRangeMonth = (delta: number) => { const date=new Date(rangeMonth()+"T00:00:00.000Z");date.setUTCMonth(date.getUTCMonth()+delta);setRangeMonth(date.toISOString().slice(0,7)+"-01"); };
  const rangeClasses = () => props.size === "sm" && props.variant === "subtle" ? ${JSON.stringify(dateRangePicker.classes.smallSubtle.join(' '))} : ${JSON.stringify(dateRangePicker.classes.default.join(' '))};
  const rangeDayInRange = (iso: string) => Boolean(rangeStart() && rangeEnd() && iso >= rangeStart()! && iso <= rangeEnd()!);
  const selectRangeDay = (iso: string) => { if (rangeStart() === null || rangeEnd() !== null || iso < rangeStart()!) { setRangeStart(iso); setRangeEnd(null); (props.onStartChange as ((value: string | null) => void) | undefined)?.(iso); (props.onStartDateChange as ((value: string | null) => void) | undefined)?.(iso); return; } setRangeEnd(iso); (props.onEndChange as ((value: string | null) => void) | undefined)?.(iso); (props.onEndDateChange as ((value: string | null) => void) | undefined)?.(iso); };
  const resetDateRange = () => { setRangeStart(null); setRangeEnd(null); (props.onStartChange as ((value: string | null) => void) | undefined)?.(null); (props.onStartDateChange as ((value: string | null) => void) | undefined)?.(null); (props.onEndChange as ((value: string | null) => void) | undefined)?.(null); (props.onEndDateChange as ((value: string | null) => void) | undefined)?.(null); dateRangeRoot?.focus(); };
` : ''}${datePicker ? `  type DatePickerDay = {iso: string; day: number; disabled: boolean};
  const toIsoDate = (date: Date): string => date.toISOString().slice(0, 10);
  const parseIsoDate = (value: string): Date => new Date(value + "T00:00:00.000Z");
  const monthDate = parseIsoDate(String(props.defaultMonthDate ?? props.selectedDate ?? "2025-01-01"));
  const firstOfMonth = new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth(), 1));
  const gridStart = new Date(firstOfMonth); gridStart.setUTCDate(1 - firstOfMonth.getUTCDay());
  const monthEnd = new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth() + 1, 0));
  const cellCount = Math.ceil((firstOfMonth.getUTCDay() + monthEnd.getUTCDate()) / 7) * 7;
  const datePickerDays: DatePickerDay[] = Array.from({length:cellCount}, (_, index) => { const date = new Date(gridStart); date.setUTCDate(gridStart.getUTCDate() + index); const iso = toIsoDate(date); return {iso, day:date.getUTCDate(), disabled:Boolean((props.disabledBeforeDate && iso < props.disabledBeforeDate) || (props.disabledAfterDate && iso > props.disabledAfterDate))}; });
  const datePickerWeeks = (): DatePickerDay[][] => Array.from({length:datePickerDays.length / 7}, (_, index) => datePickerDays.slice(index * 7, index * 7 + 7));
  const [uncontrolledSelectedDate, setUncontrolledSelectedDate] = createSignal<string | undefined>(incoming.selectedDate as string | undefined);
  const selectedDate = () => incoming.selectedDate !== undefined ? String(props.selectedDate) : uncontrolledSelectedDate();
  const selectDate = (day: DatePickerDay, event: MouseEvent & {currentTarget: HTMLButtonElement}) => { if (day.disabled) return; if (incoming.selectedDate === undefined) setUncontrolledSelectedDate(day.iso); (props.onChange as ((value: string) => void) | undefined)?.(day.iso); event.currentTarget.focus(); };
` : ''}${toastLifecycle ? `  const [toastVisible, setToastVisible] = createSignal(false);
  const notifyToast = () => { setToastVisible(true); (props.onNotify as (() => void) | undefined)?.(); };
  const toastAction: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = event => { (props.onAction as (() => void) | undefined)?.(); event.currentTarget.focus(); };
  const closeToast: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = event => {
    const close = event.currentTarget;
    setTimeout(() => { if (document.activeElement === close) close.blur(); setToastVisible(false); }, 300);
  };
` : ''}${toggle ? `  const controlled = incoming.${toggle.controlledProp} !== undefined;\n  const [uncontrolled, setUncontrolled] = createSignal(Boolean(incoming.${toggle.defaultProp} ?? ${JSON.stringify(toggle.initial)}));\n  const checked = () => controlled ? Boolean(incoming.${toggle.controlledProp}) : uncontrolled();\n  ${toggle.indeterminate?`const [currentIndeterminate, setCurrentIndeterminate] = createSignal(Boolean(incoming.${toggle.indeterminate.prop}));\n  `:'const currentIndeterminate = () => false;\n  '}const activateToggle = () => {\n    if (props.${toggle.disabled.prop}) return;\n    const next = ${toggle.indeterminate?'currentIndeterminate() ? '+JSON.stringify(toggle.indeterminate.activationResult)+' : ':''}!checked();\n    ${toggle.indeterminate?'setCurrentIndeterminate(false);\n    ':''}if (!controlled) setUncontrolled(next);\n    (props.onCheckedChange as ((checked: boolean) => void) | undefined)?.(next);\n  };\n  const toggleChecked: JSX.EventHandlerUnion<${toggle.native.root === 'span' ? 'HTMLSpanElement' : 'HTMLButtonElement'}, MouseEvent> = () => activateToggle();\n  const toggleOnKeyDown: JSX.EventHandlerUnion<HTMLSpanElement, KeyboardEvent> = event => { if (event.code === "Space" || event.key === " ") { event.preventDefault(); activateToggle(); } };\n` : ''}${clipboardCopy ? `  const [copyStatus, setCopyStatus] = createSignal("");
  const copyText = async () => {
    await navigator.clipboard.writeText((props.${clipboardCopy.copySource.prop} ?? props.${clipboardCopy.copySource.fallback}) as string);
    (props.onCopy as (() => void) | undefined)?.();
    setCopyStatus(${JSON.stringify(clipboardCopy.behavior.announcesSuccess)});
  };
` : ''}${paginationControls ? `  const maxPage = () => Math.max(1, Math.ceil((props.totalCount as number) / (props.perPage as number)));
  const clampPage = (page: number) => Math.min(maxPage(), Math.max(1, page));
  const hydrated = createSignal(false);
  if (typeof window !== "undefined") queueMicrotask(() => hydrated[1](true));
  const currentPage = () => hydrated[0]() ? clampPage(props.page as number) : 1;
  const [editing, setEditing] = createSignal<string | null>(null);
  const inputValue = () => editing() ?? String(currentPage());
  const proposePage = (page: number) => { const proposal = clampPage(page); setEditing(null); (props.setPage as ((page: number) => void) | undefined)?.(proposal); };
  let navEl: HTMLElement | undefined;
  const commitInput = (element: HTMLInputElement, blur = false) => { const focusNav = () => { if (blur && navEl) { navEl.setAttribute("tabindex", "-1"); navEl.focus(); } }; const value = element.value.trim(); if (!/^\\d+$/.test(value)) { setEditing(null); element.value = String(currentPage()); focusNav(); return; } proposePage(Number.parseInt(value, 10)); element.value = String(clampPage(Number.parseInt(value, 10))); focusNav(); };
  const pageInput: JSX.EventHandlerUnion<HTMLInputElement, InputEvent> = event => setEditing(event.currentTarget.value);
  const pageKeyDown: JSX.EventHandlerUnion<HTMLInputElement, KeyboardEvent> = event => { if (event.key === "Enter") commitInput(event.currentTarget); };
  const pageBlur: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent> = event => commitInput(event.currentTarget, true);
` : ''}${radioGroup ? `  type RadioItem = {label: string; value: string; disabled?: boolean};
  type RadioFixture = {kind: "radio-group"; legend: string; items: RadioItem[]; defaultValue?: string; value?: string; disabled?: boolean};
  const radioFixture = () => props.fixture as RadioFixture;
  const radioControlled = () => radioFixture().value !== undefined;
  const [radioValue, setRadioValue] = createSignal(radioFixture().defaultValue);
  const selectedValue = () => radioControlled() ? radioFixture().value : radioValue();
  let radioRoot: HTMLDivElement | undefined;
  const selectRadio = (item: RadioItem) => {
    if (radioFixture().disabled || item.disabled) return;
    if (!radioControlled()) setRadioValue(item.value);
    (props.onValueChange as ((value: string) => void) | undefined)?.(item.value);
    if (radioRoot) { radioRoot.setAttribute('tabindex', '-1'); radioRoot.focus(); }
  };
  const radioKeyDown = (event: KeyboardEvent & {currentTarget: HTMLDivElement}, index: number) => {
    if (event.key !== "ArrowDown" || radioFixture().disabled) return;
    const items = radioFixture().items;
    const next = items.slice(index + 1).find(item => !item.disabled);
    if (next) { event.preventDefault(); selectRadio(next); }
  };
` : ''}${tabsNavigation ? `  type TabItem = {value: string; label: string};
  const tabs = () => props.tabs as TabItem[];
  const controlled = () => props.selectedValue !== undefined;
  const [committedValue, setCommittedValue] = createSignal(tabs()[0]?.value);
  const selectedValue = () => controlled() ? props.selectedValue as string : committedValue();
  const selectedIndex = () => Math.max(0, tabs().findIndex(item => item.value === selectedValue()));
  const [focusedIndex, setFocusedIndex] = createSignal(selectedIndex());
  const tabElements: HTMLButtonElement[] = [];
  const commitTab = (value: string) => { if (!controlled()) setCommittedValue(value); (props.onValueChange as ((value: string) => void) | undefined)?.(value); };
  const tabKeyDown = (event: KeyboardEvent & {currentTarget: HTMLButtonElement}, index: number) => {
    if (event.key === "ArrowRight") { event.preventDefault(); const next = Math.min(index + 1, tabs().length - 1); setFocusedIndex(next); tabElements[next]?.focus(); if (props.activateOnFocus) commitTab(tabs()[next].value); }
    else if (event.key === "Enter" || event.key === " ") { event.preventDefault(); commitTab(tabs()[index].value); }
  };
` : ''}${menubarNavigation ? `  type MenuBarOption = {id: string; tooltip: string; icon: JSX.Element; onClick?: () => void};
  const menuButtons: HTMLButtonElement[] = [];
  const menuKeyDown = (event: KeyboardEvent, index: number) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const count = (props.options as MenuBarOption[]).length;
    if (!count) return;
    const next = event.key === "ArrowRight" ? (index + 1) % count : (index - 1 + count) % count;
    menuButtons[next]?.focus();
  };
` : ''}${dialogLayer ? `  const [uncontrolledOpen, setUncontrolledOpen] = createSignal(Boolean(incoming.defaultOpen));
  const dialogControlled = () => incoming.open !== undefined;
  const dialogOpen = () => dialogControlled() ? Boolean(props.open) : uncontrolledOpen();
  let triggerElement: HTMLButtonElement | undefined;
  let dialogElement: HTMLDivElement | undefined;
  const setDialogOpen = (next: boolean) => {
    if (!dialogControlled()) setUncontrolledOpen(next);
    (props.onOpenChange as ((open: boolean) => void) | undefined)?.(next);
    queueMicrotask(() => next ? dialogElement?.focus() : triggerElement?.focus());
  };
` : ''}${sensitiveInput ? `  const [sensitiveValue, setSensitiveValue] = createSignal(String(props.defaultValue ?? ""));
  const [sensitiveAnnouncement, setSensitiveAnnouncement] = createSignal("Value hidden");
  let sensitiveInputElement: HTMLInputElement | undefined;
  const revealSensitive = () => sensitiveInputElement?.focus();
  const sensitiveOnInput: JSX.EventHandlerUnion<HTMLInputElement, InputEvent> = event => {
    const next = event.currentTarget.value;
    setSensitiveValue(next);
    (props.onValueChange as ((value: string) => void) | undefined)?.(next);
  };
  const sensitiveOnKeyDown: JSX.EventHandlerUnion<HTMLInputElement, KeyboardEvent> = event => { if (event.key === "Escape") setSensitiveAnnouncement("Value hidden"); };
  const copySensitive = async () => {
    await navigator.clipboard.writeText(sensitiveValue());
    setSensitiveAnnouncement("Copied to clipboard");
    (props.onCopy as (() => void) | undefined)?.();
  };
` : ''}${inputGroupComposition ? `  type InputGroupPart = {export?: string; props: Record<string, unknown>; text?: string; children?: InputGroupPart[]};
  const inputGroupFixture = () => props.fixture as InputGroupPart;
  const inputGroupPart = (exported: string) => inputGroupFixture().children?.find(part => part.export === exported) ?? {props:{}};
  const inputGroupId = createUniqueId();
  const [inputGroupValue, setInputGroupValue] = createSignal("");
  const inputGroupOnInput: JSX.EventHandlerUnion<HTMLInputElement, InputEvent> = event => setInputGroupValue(event.currentTarget.value);
` : ''}${autocompleteCollection ? `  type AutocompleteFixtureNode = {export?: string; props: Record<string, unknown>; text?: string; children?: AutocompleteFixtureNode[]};
  const autocompleteFixture = () => props.fixture as AutocompleteFixtureNode;
  const findAutocompletePart = (exported: string, value: AutocompleteFixtureNode = autocompleteFixture()): AutocompleteFixtureNode | undefined => value.export === exported ? value : value.children?.map(child => findAutocompletePart(exported, child)).find(Boolean);
  const autocompleteInputGroup = () => findAutocompletePart(".InputGroup") ?? {props:{}};
  const autocompleteItems = () => {
    const list = findAutocompletePart(".List");
    return (list?.children ?? []).filter(item => item.export === ".Item").map(item => ({...item, value:String(item.props.value ?? "")}));
  };
  const [uncontrolledAutocompleteOpen, setUncontrolledAutocompleteOpen] = createSignal(false);
  const autocompleteOpen = () => incoming.open !== undefined ? Boolean(props.open) : uncontrolledAutocompleteOpen();
  const [uncontrolledAutocompleteValue, setUncontrolledAutocompleteValue] = createSignal(String(incoming.defaultValue ?? ""));
  const autocompleteValue = () => incoming.value !== undefined ? String(props.value) : uncontrolledAutocompleteValue();
  const [autocompleteHighlightedIndex, setAutocompleteHighlightedIndex] = createSignal(-1);
  let autocompleteInput: HTMLInputElement | undefined;
  const setAutocompleteOpen = (next: boolean) => { if (incoming.open === undefined) setUncontrolledAutocompleteOpen(next); (props.onOpenChange as ((open: boolean) => void) | undefined)?.(next); };
  const autocompleteOnInput: JSX.EventHandlerUnion<HTMLInputElement, InputEvent> = event => {
    const value = event.currentTarget.value;
    if (incoming.value === undefined) setUncontrolledAutocompleteValue(value);
    (props.onValueChange as ((value: string) => void) | undefined)?.(value);
    if (value.length > 0 && !autocompleteOpen()) setAutocompleteOpen(true);
  };
  const autocompleteKeyDown: JSX.EventHandlerUnion<HTMLInputElement, KeyboardEvent> = event => {
    if (event.key === "ArrowDown") { event.preventDefault(); setAutocompleteHighlightedIndex(index => Math.min(index + 1, autocompleteItems().length - 1)); }
    else if (event.key === "Enter" && autocompleteHighlightedIndex() >= 0) { event.preventDefault(); const value = autocompleteItems()[autocompleteHighlightedIndex()]?.value; if (value === undefined) return; if (incoming.value === undefined) setUncontrolledAutocompleteValue(value); (props.onValueChange as ((value: string) => void) | undefined)?.(value); setAutocompleteOpen(false); autocompleteInput?.focus(); }
  };
` : ''}${commandPalette ? `  type CommandPaletteItem = {value: string; label: string};
  type HighlightSegment = {text: string; mark: boolean};
  const paletteItems = (): CommandPaletteItem[] => ((props.items as Array<string | {value: string; label?: string}> | undefined) ?? []).map(item => typeof item === "string" ? {value:item, label:item} : {value:item.value, label:item.label ?? item.value});
  const highlightSegments = (): HighlightSegment[] => {
    const text = String(props.text ?? "");
    const ranges = [...((props.highlights as Array<[number, number]> | undefined) ?? [])].sort((a, b) => a[0] - b[0]);
    const segments: HighlightSegment[] = []; let cursor = 0;
    for (const [start, end] of ranges) { if (start > cursor) segments.push({text:text.slice(cursor, start), mark:false}); if (end >= start) segments.push({text:text.slice(start, end + 1), mark:true}); cursor = Math.max(cursor, end + 1); }
    if (cursor < text.length) segments.push({text:text.slice(cursor), mark:false});
    return segments;
  };
  const [uncontrolledPaletteOpen, setUncontrolledPaletteOpen] = createSignal(Boolean(incoming.defaultOpen));
  const paletteOpen = () => incoming.open !== undefined ? Boolean(props.open) : uncontrolledPaletteOpen();
  const [uncontrolledPaletteValue, setUncontrolledPaletteValue] = createSignal(String(incoming.defaultValue ?? ""));
  const paletteValue = () => incoming.value !== undefined ? String(props.value) : uncontrolledPaletteValue();
  const [highlightedPaletteIndex, setHighlightedPaletteIndex] = createSignal(0);
  let commandPaletteInput: HTMLInputElement | undefined;
  onMount(() => { if (paletteOpen() && paletteItems()[0]) (props.onHighlightChange as ((value: string) => void) | undefined)?.(paletteItems()[0].value); });
  const commandPaletteOnInput: JSX.EventHandlerUnion<HTMLInputElement, InputEvent> = event => { const next = event.currentTarget.value; if (incoming.value === undefined) setUncontrolledPaletteValue(next); (props.onValueChange as ((value: string) => void) | undefined)?.(next); };
  const commandPaletteKeyDown: JSX.EventHandlerUnion<HTMLInputElement, KeyboardEvent> = event => {
    if (event.key === ${JSON.stringify(commandPalette.palette.navigate.key)}) { event.preventDefault(); const next = Math.min(highlightedPaletteIndex() + 1, paletteItems().length - 1); setHighlightedPaletteIndex(next); const item = paletteItems()[next]; if (item) (props.onHighlightChange as ((value: string) => void) | undefined)?.(item.value); }
    else if (event.key === ${JSON.stringify(commandPalette.palette.dismiss.key)}) { if (incoming.open === undefined) setUncontrolledPaletteOpen(false); (props.onOpenChange as ((open: boolean) => void) | undefined)?.(false); commandPaletteInput?.blur(); }
  };
` : ''}${comboboxCollection ? `  type ComboboxFixtureNode = {export?: string; props: Record<string, unknown>; text?: string; children?: ComboboxFixtureNode[]};
  const comboboxFixture = () => props.fixture as ComboboxFixtureNode;
  const findComboboxPart = (exported: string, value: ComboboxFixtureNode = comboboxFixture()): ComboboxFixtureNode | undefined => value.export === exported ? value : value.children?.map(child => findComboboxPart(exported, child)).find(Boolean);
  const comboboxTrigger = () => findComboboxPart(".TriggerInput") ?? {props:{}};
  const comboboxItems = () => {
    const list = findComboboxPart(".List");
    return (list?.children ?? []).filter(item => item.export === ".Item").map(item => ({...item, value:String(item.props.value ?? "")}));
  };
  const [uncontrolledComboboxOpen, setUncontrolledComboboxOpen] = createSignal(Boolean(incoming.defaultOpen));
  const comboboxOpen = () => incoming.open !== undefined ? Boolean(props.open) : uncontrolledComboboxOpen();
  const [uncontrolledComboboxValue, setUncontrolledComboboxValue] = createSignal(String(incoming.defaultValue ?? ""));
  const comboboxValue = () => incoming.value !== undefined ? String(props.value) : uncontrolledComboboxValue();
  const [highlightedIndex, setHighlightedIndex] = createSignal(-1);
  let comboboxInput: HTMLInputElement | undefined;
  const setComboboxOpen = (next: boolean) => { if (incoming.open === undefined) setUncontrolledComboboxOpen(next); (props.onOpenChange as ((open: boolean) => void) | undefined)?.(next); };
  const comboboxKeyDown: JSX.EventHandlerUnion<HTMLInputElement, KeyboardEvent> = event => {
    if (event.key === "ArrowDown") { event.preventDefault(); setHighlightedIndex(index => Math.min(index + 1, comboboxItems().length - 1)); }
    else if (event.key === "Enter" && highlightedIndex() >= 0) { event.preventDefault(); const value = comboboxItems()[highlightedIndex()]?.value; if (value === undefined) return; if (incoming.value === undefined) setUncontrolledComboboxValue(value); (props.onValueChange as ((value: string) => void) | undefined)?.(value); setComboboxOpen(false); comboboxInput?.focus(); }
  };
` : ''}${nativeInputElement ? `  const nativeInputHandler: JSX.EventHandlerUnion<${nativeInputElement === 'input' ? 'HTMLInputElement' : 'HTMLTextAreaElement'}, InputEvent> = event => {\n    (props.onInput as ((value: string) => void) | undefined)?.(event.currentTarget.value);\n  };\n` : ''}  const refs: Record<string, HTMLElement | undefined> = {};\n  const [, native] = splitProps(props as ${model.public.symbol}Props & Record<string, unknown>, ${JSON.stringify(nativeInputElement ? ['class', nativeInput.uncontrolled.prop, 'disabled', 'onInput', 'children', 'fixture', 'styles'] : localNames)});\n  void native; void state; void refs;\n${semantic ? semantic + '\n' : ''}  return (${fallback});\n}\n\n${partSources}${partSources ? '\n\n' : ''}${intermediates}${intermediates ? '\n' : ''}${attachments}${attachments ? '\n\n' : ''}export default ${model.public.symbol};\n`;
}
export function emitSolidLibrary({libraryPath, outputPath} = {}) {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const library = loadLibrary(libraryPath ?? path.resolve(here, '../../library'));
  const controlled = new Map(library.controlledState.specs.map(spec => [spec.component, spec]));
  const native = new Map(library.nativeControls.specs.map(spec => [spec.component, spec]));
  const toggles = new Set(library.behaviorCapabilities.bindings.filter(binding => binding.id === 'toggle-control' && binding.support === 'supported' && binding.missingOperations.length === 0).map(binding => binding.component));
  const nativeInputs = new Map(library.behaviorCapabilities.bindings.filter(binding => binding.id === 'native-input-control' && binding.support === 'supported' && binding.missingOperations.length === 0 && ['input','textarea'].includes(binding.requirements.dom?.[0])).map(binding => [binding.component, binding]));
  const fieldControls = new Map((library.fieldComposition?.support === 'supported' ? library.fieldComposition.controls : []).map(control => [control.component, control]));
  const clipboardCopy = library.clipboardCopy?.support === 'supported' ? library.clipboardCopy : null;
  const paginationControls = library.paginationControls?.support === 'supported' ? library.paginationControls : null;
  const radioGroup = library.radioGroup?.support === 'supported' ? library.radioGroup : null;
  const tabsNavigation = library.tabsNavigation?.support === 'supported' ? library.tabsNavigation : null;
  const menubarNavigation = library.menubarNavigation?.support === 'supported' ? library.menubarNavigation : null;
  const dialogLayer = library.dialogLayer?.support === 'supported' ? library.dialogLayer : null;
  const inputGroupComposition = library.inputGroupComposition?.support === 'supported' ? library.inputGroupComposition : null;
  const sensitiveInput = library.sensitiveInput?.support === 'supported' ? library.sensitiveInput : null;
  const comboboxCollection = library.comboboxCollection?.support === 'supported' ? library.comboboxCollection : null;
  const autocompleteCollection = library.autocompleteCollection?.support === 'supported' ? library.autocompleteCollection : null;
  const commandPalette = library.commandPalette?.support === 'supported' ? library.commandPalette : null;
  const toastLifecycle = library.toastLifecycle?.observableImplementation?.support === 'supported' ? library.toastLifecycle.observableImplementation : null;
  const datePicker = library.dateRange?.observableImplementation?.datePicker?.support === 'supported' ? library.dateRange.observableImplementation.datePicker : null;
  const dateRangePicker = library.dateRange?.observableImplementation?.dateRangePicker?.support === 'supported' ? library.dateRange.observableImplementation.dateRangePicker : null;
  const responsiveSidebar = library.responsiveSidebar?.observableImplementation?.support === 'supported' ? library.responsiveSidebar.observableImplementation : null;
  const popoverLayer = library.popoverLayer?.support === 'supported' ? library.popoverLayer : null;
  const dropdownMenuLayer = library.dropdownMenuLayer?.support === 'supported' ? library.dropdownMenuLayer : null;
  const selectCollection = library.collectionListbox?.observableImplementation?.select?.support === 'supported' ? library.collectionListbox.observableImplementation.select : null;
  const toggleFor = model => { const state=controlled.get(model.component), control=native.get(model.component); return toggles.has(model.component) && state?.event === 'checked-change' && control?.events.includes('checked-change') && ['span','button'].includes(control.root) ? {...state,native:control} : null; };
  const output = outputPath ?? path.resolve(here, '../../../../generated/libraries/solid');
  fs.rmSync(output, {recursive:true, force:true}); fs.mkdirSync(output, {recursive:true});
  const components = [];
  for (const model of library.models) {
    const toggle = toggleFor(model), nativeInput = nativeInputs.get(model.component) ?? null, fieldControl = fieldControls.get(model.component) ?? null;
    const modelClipboardCopy = clipboardCopy && model.component === clipboardCopy.component ? clipboardCopy : null;
    const modelPaginationControls = paginationControls && model.component === paginationControls.component ? paginationControls : null;
    const modelRadioGroup = radioGroup && model.component === radioGroup.component ? radioGroup : null;
    const modelTabsNavigation = tabsNavigation && model.component === tabsNavigation.component ? tabsNavigation : null;
    const modelMenubarNavigation = menubarNavigation && model.component === menubarNavigation.component ? menubarNavigation : null;
    const modelDialogLayer = dialogLayer && model.component === dialogLayer.component ? dialogLayer : null;
    const modelInputGroupComposition = inputGroupComposition && model.component === inputGroupComposition.component ? inputGroupComposition : null;
    const modelSensitiveInput = sensitiveInput && model.component === sensitiveInput.component ? sensitiveInput : null;
    const modelComboboxCollection = comboboxCollection && model.component === comboboxCollection.component ? comboboxCollection : null;
    const modelAutocompleteCollection = autocompleteCollection && model.component === autocompleteCollection.component ? autocompleteCollection : null;
    const modelCommandPalette = commandPalette && model.component === commandPalette.component ? commandPalette : null;
    const modelToastLifecycle = toastLifecycle && model.component === 'toasty' ? toastLifecycle : null;
    const modelDatePicker = datePicker && model.component === 'date-picker' ? datePicker : null;
    const modelDateRangePicker = dateRangePicker && model.component === 'date-range-picker' ? dateRangePicker : null;
    const modelResponsiveSidebar = responsiveSidebar && model.component === 'sidebar' ? responsiveSidebar : null;
    const modelPopoverLayer = popoverLayer && model.component === 'popover' ? popoverLayer : null;
    const modelDropdownMenuLayer = dropdownMenuLayer && model.component === dropdownMenuLayer.component ? dropdownMenuLayer : null;
    const modelSelectCollection = selectCollection && model.component === "select" ? selectCollection : null;
    const js = source(model, toggle, nativeInput, fieldControl, modelClipboardCopy, modelPaginationControls, modelRadioGroup, modelTabsNavigation, modelMenubarNavigation, modelDialogLayer, modelInputGroupComposition, modelSensitiveInput, modelComboboxCollection, modelAutocompleteCollection, modelCommandPalette, modelToastLifecycle, modelDatePicker, modelDateRangePicker, modelResponsiveSidebar, modelPopoverLayer, modelDropdownMenuLayer, modelSelectCollection), dts = declaration(model, toggle, nativeInput, modelClipboardCopy, modelPaginationControls, modelMenubarNavigation, modelDialogLayer, modelInputGroupComposition, modelSensitiveInput, modelComboboxCollection, modelAutocompleteCollection, modelCommandPalette, modelToastLifecycle, modelDatePicker, modelDateRangePicker, modelPopoverLayer, modelDropdownMenuLayer, modelSelectCollection), variants = model.draftImplementation.semanticVariants ?? [];
    fs.writeFileSync(path.join(output, `${model.component}.tsx`), js); fs.writeFileSync(path.join(output, `${model.component}.d.ts`), dts);
    components.push({component:model.component,symbol:model.public.symbol,subpath:model.public.subpath,modelDigest:model.modelDigest,contentBindingDigest:model.contentBindings.capabilityDigest,semanticVariants:variants.map(v => ({id:v.id,expectationDigest:v.expectationDigest})),unresolvedSemanticOperations:model.unresolvedSemanticOperations ?? [],compoundPaths:compoundParts(model).map(x => x.path),source:`${model.component}.tsx`,declaration:`${model.component}.d.ts`,sha256:crypto.createHash('sha256').update(js).digest('hex')});
  }
  fs.writeFileSync(path.join(output,'index.ts'), '// @generated by src/kumo/emitters/solid/index.mjs; do not edit\n'+components.map(x => `export { ${x.symbol} } from "./${x.component}";`).join('\n')+'\n');
  fs.writeFileSync(path.join(output,'index.d.ts'), '// @generated by src/kumo/emitters/solid/index.mjs; do not edit\n'+components.map(x => `export { ${x.symbol} } from "./${x.component}"; export type { ${x.symbol}Props } from "./${x.component}";`).join('\n')+'\n');
  const exports = Object.fromEntries([['.',{source:'./index.ts',types:'./index.d.ts'}], ...components.map(x => [x.subpath,{source:`./${x.source}`,types:`./${x.declaration}`}])]);
  fs.writeFileSync(path.join(output,'package.json'), JSON.stringify({name:'@acoyfellow/kumo-solid',version:'0.0.1',private:true,type:'module',sideEffects:false,exports},null,2)+'\n');
  fs.writeFileSync(path.join(output,'manifest.json'), JSON.stringify({schemaVersion:'kumo.solid-emitter/v1',algebraVersion:'kumo.component-algebra/v1',candidate:true,count:components.length,libraryManifestDigest:crypto.createHash('sha256').update(canonicalJSON(library.manifest)).digest('hex'),components},null,2)+'\n');
  return {output, components};
}
export {source as emitSolidComponent};
