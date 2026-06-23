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
function declaration(model, toggle, nativeInput, clipboardCopy, paginationControls, menubarNavigation) {
  const nativeButton=Boolean(model.interactions?.nativeButton);
  const nativeInputElement=nativeInput?.requirements.dom?.[0];
  const modelProps = menubarNavigation ? [
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
  const props = modelProps.map(item => `  ${JSON.stringify(item.name)}${item.required ? '' : '?'}: ${item.type === 'number' ? 'number' : item.type === 'menubar-options' ? 'Array<{ id: string; tooltip: string; icon: JSX.Element; onClick?: () => void }>' : item.type === 'menubar-active' ? 'number | string' : item.type === 'pagination-mode' ? '"simple" | "dropdown"' : item.type === 'pagination-labels' ? '{ navigation?: string; previousPage?: string; nextPage?: string }' : item.type === 'pagination-callback' ? '(page: number) => void' : nativeButton&&['disabled','loading'].includes(item.name)||toggle&&[toggle.controlledProp,toggle.defaultProp,toggle.disabled.prop,toggle.indeterminate?.prop].includes(item.name)?'boolean':safeType(item.type).includes('callback') ? toggle&&item.name==='onCheckedChange'?'(checked: boolean) => void':clipboardCopy&&item.name==='onCopy'?'() => void':'(...args: unknown[]) => void' : clipboardCopy&&[clipboardCopy.copySource.prop,clipboardCopy.copySource.fallback].includes(item.name)?'string':'unknown'};`).join('\n');
  const slots = (model.composition.slots ?? []).map(value => typeof value === 'string' ? value : value.name).filter(Boolean).map(name => `  ${JSON.stringify(name)}?: JSX.Element;`).join('\n');
  const parts = compoundParts(model);
  const partDeclarations = parts.map(part => `export declare const ${part.symbol}: (props: CompoundPartProps) => JSX.Element;`).join('\n');
  const api = parts.reduce((tree, part) => { let cursor = tree; for (const segment of part.path.split('.')) cursor = cursor[segment] ??= {}; cursor.$ = part.symbol; return tree; }, {});
  const apiType = tree => `{ ${Object.entries(tree).map(([segment, child]) => `${JSON.stringify(segment)}: ${child.$ ? `typeof ${child.$}` : apiType(child)}`).join('; ')} }`;
  return `// @generated by src/kumo/emitters/solid/index.mjs; do not edit\nimport type { JSX } from "solid-js";\nexport interface ${model.public.symbol}Props${nativeButton?' extends JSX.ButtonHTMLAttributes<HTMLButtonElement>':nativeInputElement==='input'?' extends JSX.InputHTMLAttributes<HTMLInputElement>':nativeInputElement==='textarea'?' extends JSX.TextareaHTMLAttributes<HTMLTextAreaElement>':''} {\n${props}${slots ? '\n' + slots : ''}\n  children?: JSX.Element;\n  fixture?: unknown;\n  styles?: Record<string, string>;\n}\nexport interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }\n${partDeclarations}${partDeclarations ? '\n' : ''}export declare const ${model.public.symbol}: ((props: ${model.public.symbol}Props) => JSX.Element)${parts.length ? ` & ${apiType(api)}` : ''};\nexport default ${model.public.symbol};\n`;
}
function source(model, toggle, nativeInput, fieldControl, clipboardCopy, paginationControls, radioGroup, tabsNavigation, menubarNavigation) {
  const root = model.draftImplementation.componentRoot;
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
  if(nativeButton||paginationControls||radioGroup||tabsNavigation||menubarNavigation)imports.add('mergeProps');
  if(toggle || clipboardCopy || paginationControls || radioGroup || tabsNavigation)imports.add('createSignal');
  if(radioGroup || tabsNavigation || menubarNavigation)imports.add('For');
  const localNames = nativeButton ? [...new Set([...model.props.items.filter(x => !x.nativeForwarding).map(x => x.name), 'children', 'fixture', 'styles', 'onClick'])] : nativeNames;
  const toggleTag=toggle?.native.root;
  const toggleRole=toggleTag==='span'?'checkbox':'switch';
  const toggleClass=toggle?.native.styleVariants.length?` class={mergeStyles(${toggle.native.styleVariants.map(variant=>`(${Object.entries(variant.when).map(([name,value])=>`props.${name} === ${JSON.stringify(value)}`).join(' && ')||'true'}) ? ${JSON.stringify(variant.classes.join(' '))} : ""`).join(', ')})}`:'';
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
  const fallback = menubarFallback ?? tabsFallback ?? radioFallback ?? paginationFallback ?? clipboardFallback ?? (nativeButton
    ? `<button id={props.id as string} class={props.class as string} name={props.name as string} value={props.value as string} data-probe={props["data-probe"] as string} aria-label={props["aria-label"] as string} type={(props.type as JSX.ButtonHTMLAttributes<HTMLButtonElement>["type"]) ?? "button"} disabled={Boolean(props.disabled || props.loading)} onClick={props.onClick as JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>}>{props.loading ? <svg aria-hidden="true" /> : undefined}{props.children}</button>`
    : nativeInputFallback ?? providedFieldFallback ?? toggleFallback ?? node(root));
  for (const op of model.draftImplementation.operations) if (!['render','emit','state','ref','focus','lifecycle','browser-service','portal','style'].includes(op.kind)) throw new Error(`${model.component}: unsupported operation ${op.kind}`);
  const parts = compoundParts(model);
  const partSources = parts.map(part => `export function ${part.symbol}(props: CompoundPartProps): JSX.Element {\n  const [local, native] = splitProps(props, ["children"]);\n  return <div {...native} data-kumo-part=${JSON.stringify(part.path)}>{local.children}</div>;\n}`).join('\n\n');
  const attachments = parts.map(part => `Object.defineProperty(${part.path.split('.').reduce((base, segment, index, all) => index === all.length - 1 ? base : `${base}.${all[index]}`, model.public.symbol)}, ${JSON.stringify(part.path.split('.').at(-1))}, {value:${part.symbol}, enumerable:true});`).join('\n');
  const intermediatePaths = [...new Set(parts.flatMap(part => { const segments = part.path.split('.'); return segments.slice(0,-1).map((_, i) => segments.slice(0,i+1).join('.')); }))].sort();
  const intermediates = intermediatePaths.map(pathValue => `Object.defineProperty(${pathValue.split('.').slice(0,-1).reduce((base, segment) => `${base}.${segment}`, model.public.symbol)}, ${JSON.stringify(pathValue.split('.').at(-1))}, {value:{}, enumerable:true});`).join('\n');
  const semantic = (nativeInputElement || clipboardCopy || paginationControls || radioGroup || tabsNavigation || menubarNavigation) ? '' : [...variants].sort((a, b) => b.when.length - a.when.length).map(variant => `  if (${variant.when.map(predicate).join(' && ') || 'true'}) return (${node(variant.tree)});`).join('\n');
  return `// @generated by src/kumo/emitters/solid/index.mjs; do not edit\nimport { ${[...imports].sort().join(', ')} } from "solid-js";\n${hasPortal ? 'import { Portal } from "solid-js/web";\n' : ''}import type { JSX } from "solid-js";\n\nexport interface ${model.public.symbol}Props extends Record<string, unknown> { children?: JSX.Element; fixture?: unknown; styles?: Record<string, string>; }\nexport interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }\nexport const modelDigest = ${JSON.stringify(model.modelDigest)};\nexport const contentBindingDigest = ${JSON.stringify(model.contentBindings.capabilityDigest)};\nexport const semanticVariantDigests = ${JSON.stringify(Object.fromEntries(variants.map(v => [v.id, v.expectationDigest])))} as const;\nconst styles: Record<string, string> = ${JSON.stringify(Object.fromEntries(['root', ...model.dependencies.styles].map(x => [x, x])))};\nconst mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");\nconst semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);\nconst normalizeRenderContent = (value: unknown, accessors = false): string => {\n  if (value == null || value === false || value === true) return "";\n  if (typeof value === "string" || typeof value === "number") return String(value);\n  if (Array.isArray(value)) return value.map(item => normalizeRenderContent(item, accessors)).join("");\n  if (accessors && typeof value === "function") return normalizeRenderContent(value(), accessors);\n  if (typeof value === "object") { const item = value as {text?: unknown; children?: unknown}; return (typeof item.text === "string" ? item.text : "") + (Array.isArray(item.children) ? item.children.map(child => normalizeRenderContent(child)).join("") : ""); }\n  return "";\n};\nconst normalizeFixture = (value: unknown): unknown => Array.isArray(value) ? value.map(normalizeFixture) : value && typeof value === "object" ? Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalizeFixture(item)])) : value;\nconst fixtureText = (value: unknown): string => normalizeRenderContent(value);\nconst resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;\n\nexport function ${model.public.symbol}(incoming: ${model.public.symbol}Props): JSX.Element {\n  const props = ${(nativeButton||paginationControls||radioGroup||tabsNavigation||menubarNavigation)?'mergeProps':'Object.assign'}(${JSON.stringify(toggle ? Object.fromEntries(Object.entries(defaults).filter(([name]) => name !== toggle.controlledProp)) : defaults)}, incoming);\n  const fixture = props.fixture;\n  const renderContent = normalizeRenderContent(props.children, true);\n  const normalizedFixture = normalizeFixture(fixture);\n  const state: Record<string, () => unknown> = {};\n${toggle ? `  const controlled = incoming.${toggle.controlledProp} !== undefined;\n  const [uncontrolled, setUncontrolled] = createSignal(Boolean(incoming.${toggle.defaultProp} ?? ${JSON.stringify(toggle.initial)}));\n  const checked = () => controlled ? Boolean(incoming.${toggle.controlledProp}) : uncontrolled();\n  ${toggle.indeterminate?`const [currentIndeterminate, setCurrentIndeterminate] = createSignal(Boolean(incoming.${toggle.indeterminate.prop}));\n  `:'const currentIndeterminate = () => false;\n  '}const activateToggle = () => {\n    if (props.${toggle.disabled.prop}) return;\n    const next = ${toggle.indeterminate?'currentIndeterminate() ? '+JSON.stringify(toggle.indeterminate.activationResult)+' : ':''}!checked();\n    ${toggle.indeterminate?'setCurrentIndeterminate(false);\n    ':''}if (!controlled) setUncontrolled(next);\n    (props.onCheckedChange as ((checked: boolean) => void) | undefined)?.(next);\n  };\n  const toggleChecked: JSX.EventHandlerUnion<${toggle.native.root === 'span' ? 'HTMLSpanElement' : 'HTMLButtonElement'}, MouseEvent> = () => activateToggle();\n  const toggleOnKeyDown: JSX.EventHandlerUnion<HTMLSpanElement, KeyboardEvent> = event => { if (event.code === "Space" || event.key === " ") { event.preventDefault(); activateToggle(); } };\n` : ''}${clipboardCopy ? `  const [copyStatus, setCopyStatus] = createSignal("");
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
    const js = source(model, toggle, nativeInput, fieldControl, modelClipboardCopy, modelPaginationControls, modelRadioGroup, modelTabsNavigation, modelMenubarNavigation), dts = declaration(model, toggle, nativeInput, modelClipboardCopy, modelPaginationControls, modelMenubarNavigation), variants = model.draftImplementation.semanticVariants ?? [];
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
