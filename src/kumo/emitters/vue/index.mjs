import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {loadLibrary, canonicalJSON} from '../../library/index.mjs';
import {validateImplementation, NODE_KINDS, EXPRESSION_KINDS, OPERATION_KINDS} from '../../library/algebra.mjs';
import {requireContentBindings, semanticExpression, semanticPredicate} from '../shared/content-adapter.mjs';
import {clampPage, maxPage, nextPage, previousPage, commitPageInput} from '../../library/pagination-state.mjs';
import {KUMO_INPUT_CLASS, KUMO_INPUT_ERROR_CLASS, KUMO_INPUTAREA_CLASS, KUMO_INPUTAREA_ERROR_CLASS, KUMO_FIELD_LABEL_CLASS, KUMO_FIELD_DESCRIPTION_CLASS, KUMO_CHECKBOX_CLASS, KUMO_CHECKBOX_BOX_CLASS, KUMO_CHECKBOX_INDICATOR_CLASS, KUMO_CHECKBOX_CHECK_SVG, KUMO_CHECKBOX_MINUS_SVG, KUMO_CHECKBOX_HIDDEN_INPUT_STYLE, KUMO_CHECKBOX_LABEL_WRAPPER_CLASS, KUMO_CHECKBOX_LABEL_CLASS, KUMO_CHECKBOX_LABEL_TEXT_CLASS, KUMO_CLIPBOARD_ROOT_CLASS, KUMO_CLIPBOARD_TEXT_CLASS, KUMO_CLIPBOARD_BUTTON_CLASS, KUMO_CLIPBOARD_CHECK_SPAN_CLASS, KUMO_CLIPBOARD_COPY_SPAN_CLASS, KUMO_CLIPBOARD_CHECK_SVG, KUMO_CLIPBOARD_COPY_SVG, KUMO_SWITCH_TRACK_CLASS, KUMO_SWITCH_THUMB_CLASS, KUMO_TABS_LIST_CLASS, KUMO_TABS_TRIGGER_CLASS, KUMO_TABS_INDICATOR_CLASS, KUMO_METER_ROOT_CLASS, KUMO_METER_HEADER_CLASS, KUMO_METER_LABEL_CLASS, KUMO_METER_VALUE_CLASS, KUMO_METER_TRACK_CLASS, KUMO_METER_FILL_CLASS, KUMO_PLUS_ICON_SVG} from '../shared/native-classes.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../../..');
const visualContract = JSON.parse(fs.readFileSync(path.join(root,'generated/visual-contract.json'),'utf8'));
const esc = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const directive = value => String(value).replaceAll('&','&amp;').replaceAll('"','&quot;');
// Build a ternary chain that picks the real per-variant Kumo class string for a
// native button, defaulting to the canonical default variant's classes.
const nativeButtonVariantExpression = (nativeButton, accessor) => {
  const {styleVariants, defaultVariant} = nativeButton;
  const fallbackEntry = styleVariants.find(v => v.when.variant === defaultVariant) ?? styleVariants[0];
  const others = styleVariants.filter(v => v.when.variant !== defaultVariant);
  const chain = others.map(v => `${accessor} === ${JSON.stringify(v.when.variant)} ? ${JSON.stringify(v.classes.join(' '))}`).join(' : ');
  const fallbackClasses = JSON.stringify(fallbackEntry.classes.join(' '));
  return others.length ? `${chain} : ${fallbackClasses}` : fallbackClasses;
};
// Real per-variant Kumo Badge classes, copied verbatim from @cloudflare/kumo
// badge.d.ts KUMO_BADGE_VARIANTS (filled appearance) + KUMO_BADGE_BASE_STYLES.
// Not invented, not button's, not inline styles: the same tokens React Kumo ships.
const KUMO_BADGE_BASE_STYLES = 'inline-flex w-fit flex-none shrink-0 items-center justify-self-start rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap';
const KUMO_BADGE_VARIANT_CLASSES = {primary:'bg-kumo-badge-inverted text-kumo-badge-inverted',secondary:'bg-kumo-fill text-kumo-badge-neutral-subtle',error:'bg-kumo-danger-tint/60 text-kumo-danger',warning:'bg-kumo-warning-tint/70 text-kumo-warning',success:'bg-kumo-success-tint/70 text-kumo-success',destructive:'bg-kumo-badge-red text-white',info:'bg-kumo-info-tint/70 text-kumo-info',beta:'border border-dashed border-kumo-brand bg-transparent text-kumo-link',outline:'border border-kumo-fill bg-transparent text-kumo-default',red:'bg-kumo-badge-red text-white',green:'bg-kumo-badge-green text-white',neutral:'bg-kumo-badge-neutral text-white',orange:'bg-kumo-badge-orange text-black',purple:'bg-kumo-badge-purple text-white',teal:'bg-kumo-badge-teal text-white','teal-subtle':'bg-kumo-badge-teal-subtle text-kumo-badge-teal-subtle',blue:'bg-kumo-badge-blue text-white'};
const badgeStyleVariants = () => Object.entries(KUMO_BADGE_VARIANT_CLASSES).map(([variant, cls]) => ({when:{variant}, classes:`${KUMO_BADGE_BASE_STYLES} ${cls}`.split(/\s+/).filter(Boolean)}));
const badgeVariantExpression = accessor => nativeButtonVariantExpression({styleVariants: badgeStyleVariants(), defaultVariant: 'primary'}, accessor);
// Emphasis variants (primary, destructive/danger) bind four inline CSS vars from a
// single tone via color-mix so the bg-(--kumo-button-emphasis-bg)/ring-(--kumo-button-emphasis-ring)
// utilities resolve to a real color, mirroring the canonical React 2.6.0 button.
// Non-emphasis variants get no inline style (undefined). Values flow verbatim from
// the nativeButton capability's emphasis descriptor.
const styleObjectLiteral = obj => `{${Object.entries(obj).map(([k,v]) => `${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(', ')}}`;
const nativeButtonEmphasisStyleExpression = (emphasis, accessor) => `${Object.entries(emphasis.variants).map(([variant, styleObj]) => `${accessor} === ${JSON.stringify(variant)} ? ${styleObjectLiteral(styleObj)}`).join(' : ')} : undefined`;
const nativeButtonEmphasisCondition = (emphasis, accessor) => Object.keys(emphasis.variants).map(v => `${accessor} === ${JSON.stringify(v)}`).join(' || ');
const id = value => value.replace(/[^A-Za-z0-9_$]/g, '_').replace(/^([0-9])/, '_$1');
const pascal = value => value.split(/[-_ ]+/).map(x => x[0]?.toUpperCase() + x.slice(1)).join('');
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
// Inline a static Kumo icon SVG string as REAL Vue template <svg>/<path> nodes
// (no v-html / innerHTML bandaid). Optionally inject a Vue directive (e.g. v-if)
// into the opening <svg> tag so caller can toggle between icons declaratively.
const svgTemplate = (svgString, directiveAttr = '') => directiveAttr
  ? svgString.replace(/^<svg/, `<svg ${directiveAttr}`)
  : svgString;

function expression(value, scope = 'props') {
  switch (value.kind) {
    case 'literal': return JSON.stringify(value.value);
    case 'prop': return `${scope}.${id(value.name)}`;
    case 'state': return `${id(value.name)}.value`;
    case 'item': return id(value.name);
    case 'coalesce': return `(${value.values.map(v => expression(v, scope)).join(' ?? ')})`;
    case 'equals': return `(${expression(value.left, scope)} === ${expression(value.right, scope)})`;
    case 'not': return `(!${expression(value.value, scope)})`;
    case 'concat': return `[${value.values.map(v => expression(v, scope)).join(', ')}].join(${JSON.stringify(value.separator ?? '')})`;
    case 'style-ref': return `styles[${JSON.stringify(value.name)}]`;
    default: throw new Error(`unsupported Vue expression: ${value.kind}`);
  }
}
function node(value, context = {}) {
  const child = x => node(x, context);
  switch (value.kind) {
    case 'children': return '<slot />';
    case 'text': return `{{ ${expression(value.value)} }}`;
    case 'slot': return `<slot name="${esc(value.name)}">${value.fallback ? child(value.fallback) : ''}</slot>`;
    case 'condition': return `<template v-if="${esc(expression(value.when))}">${child(value.then)}</template>${value.else ? `<template v-else>${child(value.else)}</template>` : ''}`;
    case 'collection': return `<template v-for="${id(value.item)} in ${esc(expression(value.source))}" :key="${esc(expression(value.key))}">${node(value.template, {...context, item:value.item})}</template>`;
    case 'compound': return `<div data-kumo-compound="${esc(value.name)}" :class="styles.root">${Object.entries(value.parts).map(([name, part]) => `<section data-kumo-part="${esc(name)}">${child(part)}</section>`).join('')}</div>`;
    case 'portal': return `<Teleport :to="${esc(expression(value.target))}"><div data-kumo-layer="${esc(value.layer)}">${value.children.map(child).join('')}</div></Teleport>`;
    case 'element': {
      if (value.tag === 'merge-trigger') { const fallback = value.children?.[0]; return `<template v-if="${esc(expression(value.properties.when))}">${(fallback.children ?? []).map(child).join('')}</template><template v-else>${child(fallback)}</template>`; }
      const attrs = [];
      for (const [name, exp] of Object.entries(value.attributes ?? {})) attrs.push(`:${name}="${esc(expression(exp))}"`);
      for (const [name, exp] of Object.entries(value.properties ?? {})) attrs.push(`:${name}="${esc(expression(exp))}"`);
      for (const [name, exp] of Object.entries(value.events ?? {})) attrs.push(`@${name}="${esc(expression(exp))}"`);
      if (value.ref) attrs.push(`ref="${esc(value.ref)}"`);
      if (value.styles?.length) attrs.push(`:class="[${directive(value.styles.map(v => expression(v)).join(', '))}]"`);
      return `<${value.tag}${attrs.length ? ' '+attrs.join(' ') : ''}>${(value.children ?? []).map(child).join('')}</${value.tag}>`;
    }
    default: throw new Error(`unsupported Vue node: ${value.kind}`);
  }
}
function vueType(type) {
  const boolean = /boolean/i.test(type), number = /number/i.test(type), string = /string|base\||sm\||xs\||lg\||primary\||dialog\|/i.test(type);
  if ([boolean,number,string].filter(Boolean).length > 1) return 'unknown';
  if (boolean) return 'boolean';
  if (number) return 'number';
  if (string) return 'string';
  return 'unknown';
}
function compoundPartSource(partPath) {
  return `<!-- @generated by src/kumo/emitters/vue/index.mjs; do not edit -->\n<script setup lang="ts">
defineOptions({ inheritAttrs: false })
</script>

<template>
  <span v-bind="$attrs" data-kumo-part="${esc(partPath)}"><slot /></span>
</template>
`;
}
function compoundBindingSource(graph, imports) {
  const root = {};
  for (const item of graph.paths) {
    const segments = item.path.split('.');
    let cursor = root;
    for (let index = 0; index < segments.length; index++) {
      const segment = segments[index];
      cursor[segment] ??= index === segments.length - 1 ? imports.get(item.path) : {};
      cursor = cursor[segment];
    }
  }
  const literal = value => typeof value === 'string' ? value : `{ ${Object.entries(value).map(([key, child]) => `${JSON.stringify(key)}: ${literal(child)}`).join(', ')} }`;
  return `export const ${id(graph.canonicalRoot)} = Object.assign(RootComponent, ${literal(root)})`;
}
const vuePropName = name => name.replace(/-([a-z])/g,(_,letter)=>letter.toUpperCase());
function semanticNode(value) {
  const e = item => {
    const semanticItem = item.kind === 'prop' ? {...item,name:vuePropName(item.name)} : item;
    const semantic = semanticExpression(semanticItem,{props:'semanticValues',fixture:'fixture',content:'renderContent()'});
    if (semantic !== null) return semantic;
    return expression(item,'semanticValues');
  };
  switch (value.kind) {
    case 'semantic-element': {
      if (value.tag.kind !== 'literal' || !/^[a-z][a-z0-9-]*$/.test(value.tag.value)) throw new Error('Vue semantic element requires literal tag');
      const entries = Object.entries(value.attributes ?? {});
      const dynamicTag = entries.some(([name]) => /[A-Z]/.test(name));
      const attrs = dynamicTag ? [`v-bind="{ ${entries.map(([name,item]) => `${directive(JSON.stringify(name))}: ${directive(e(item))}`).join(', ')} }"`] : entries.map(([name,item]) => item.kind === 'literal' && typeof item.value === 'string' ? `${name}="${esc(item.value)}"` : `:${name}="${directive(e(item))}"`);
      if (value.classes?.length) attrs.push(`class="${esc(value.classes.map(x => x.value).join(' '))}"`);
      const tag = dynamicTag ? `component :is="'${value.tag.value}'"` : value.tag.value;
      const close = dynamicTag ? 'component' : value.tag.value;
      return `<${tag}${attrs.length?' '+attrs.join(' '):''}>${(value.children??[]).map(semanticNode).join('')}</${close}>`;
    }
    case 'text': return `{{ ${e(value.value)} }}`;
    case 'fixture-children': return `{{ fixtureText(${e(value.value)}) }}`;
    default: return node(value);
  }
}
function toggleBinding(model, library) {
  const behavior = library.behaviorCapabilities.bindings.find(binding => binding.component === model.component && binding.id === 'toggle-control' && binding.support === 'supported');
  if (!behavior || behavior.missingOperations.length || !behavior.controlled.supported || !behavior.uncontrolled.supported) return null;
  const state = library.controlledState.specs.find(spec => spec.component === behavior.component);
  const native = library.nativeControls.specs.find(spec => spec.component === behavior.component && spec.contractDigest === behavior.contractDigest);
  if (!state || !native || native.events.join('\0') !== state.event || !['span','button'].includes(native.root)) return null;
  return {behavior,state,native};
}
// Real Kumo Switch track/thumb classes copied VERBATIM from @cloudflare/kumo 2.6.0
// switch chunk (checked=on vs unchecked=off states). The shared native-classes
// KUMO_SWITCH_* constants encode an older simplified geometry (h-4 w-8, no state
// colors) that does NOT match React canonical (h-4.5 w-9, blue-on / neutral-off);
// this lane owns only the vue emitter, so the faithful classes live here.
const VUE_SWITCH_TRACK_BASE = 'relative inline-flex items-center ring cursor-pointer border-none p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand transition-colors duration-150 ease-out motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-50 h-4.5 w-9 rounded-[5px] supports-[corner-shape:squircle]:rounded-[10px] [corner-shape:squircle]';
const VUE_SWITCH_TRACK_ON = 'bg-blue-500 dark:bg-blue-600 ring-blue-600 dark:ring-blue-500';
const VUE_SWITCH_TRACK_OFF = 'bg-neutral-200 dark:bg-neutral-700 ring-neutral-300 dark:ring-neutral-600';
const VUE_SWITCH_THUMB_BASE = 'absolute top-0 bottom-0 shadow-[0_0_1px_0.5px_var(--color-kumo-shadow-edge),0_1px_2px_var(--color-kumo-shadow-drop)] w-4.5 rounded-[5px] supports-[corner-shape:squircle]:rounded-[10px] [corner-shape:squircle] bg-kumo-base dark:bg-blue-300 transition-all duration-150 ease-out motion-reduce:transition-none';
function toggleSource({state,native}) {
  const role = native.root === 'span' ? 'checkbox' : 'switch';
  const indeterminate = state.indeterminate;
  const rootAttrs = native.root === 'button' ? ` type="button"` : ` :tabindex="props.disabled ? undefined : 0"`;
  const keyHandler = native.root === 'button' ? '' : ` @keydown="activateOnSpace"`;
  const aria = indeterminate ? `(currentIndeterminate ? 'mixed' : currentChecked)` : 'currentChecked';
  const rootClassConst = native.root === 'span' ? KUMO_CHECKBOX_CLASS : KUMO_SWITCH_TRACK_CLASS;
  const variantExpressions = native.styleVariants.map(variant=>`(${Object.entries(variant.when).map(([name,value])=>`props.${vuePropName(name)} === ${JSON.stringify(value)}`).join(' && ')||'true'}) ? ${JSON.stringify(variant.classes.join(' '))} : ''`);
  const styleExpression = `[${[JSON.stringify(rootClassConst), ...variantExpressions].join(', ')}]`;
  const styleClass = ` :class="${directive(styleExpression)}"`;
  // Canonical @cloudflare/kumo 2.6.0 Switch/Checkbox emit ONLY data-checked/
  // data-unchecked(/data-indeterminate) -- verified via renderToStaticMarkup across
  // checked/unchecked/defaultChecked combinations. There is no data-state attribute
  // on either; it was an emitter invention that the route-cascade's real-DOM
  // comparison caught (the component sweep's SSR-only measurement did not).
  const dataAttrs = ` :data-checked="currentChecked ? '' : undefined" :data-unchecked="currentChecked ? undefined : ''"${indeterminate?` :data-indeterminate="currentIndeterminate ? '' : undefined"`:''}`;
  const thumb = native.root === 'button' ? `<span aria-hidden="true" class="${esc(KUMO_SWITCH_THUMB_CLASS)}"></span>` : '';
  // Checkbox renders the SAME control-subtree React canonical does: box span carrying
  // the real Kumo checkmark <svg> indicator, plus the visually-hidden native <input>,
  // wrapped (when a label is present) in React's Field.Root div + label + text span.
  const isCheckbox = native.root === 'span';
  const iconSetup = '';
  const setup = `const instance = getCurrentInstance()\nconst controlled = Object.prototype.hasOwnProperty.call(instance?.vnode.props ?? {}, ${JSON.stringify(state.controlledProp)})\nconst internalChecked = ref(props.${state.defaultProp} ?? ${JSON.stringify(state.initial)})\nconst currentChecked = computed(() => controlled ? props.${state.controlledProp} : internalChecked.value)\n${indeterminate?`const currentIndeterminate = ref(Boolean(props.${indeterminate.prop}))\n`:''}function activate(event: Event) {\n  if (props.${state.disabled.prop}) return\n  const next = ${indeterminate ? `currentIndeterminate.value ? ${JSON.stringify(indeterminate.activationResult)} : ` : ''}!currentChecked.value\n  ${indeterminate?'currentIndeterminate.value = false\n  ':''}if (!controlled) internalChecked.value = next\n  props.onCheckedChange?.(next)\n}\n${native.root==='span'?`function activateOnSpace(event: KeyboardEvent) {\n  if (event.code === 'Space' || event.key === ' ') { event.preventDefault(); activate(event) }\n}\n`:''}${iconSetup}`;
  let template;
  if (isCheckbox) {
    // Emit the real Kumo checkmark as an actual <svg>/<path> template subtree (like
    // vue cloudflare-logo) — NO v-html. With indeterminate support we toggle between
    // the minus and check SVGs declaratively via v-if/v-else; the box span's
    // data-[unchecked]:invisible class hides the icon when unchecked, matching React.
    const iconMarkup = indeterminate
      ? `${svgTemplate(KUMO_CHECKBOX_MINUS_SVG, 'v-if="currentIndeterminate"')}${svgTemplate(KUMO_CHECKBOX_CHECK_SVG, 'v-else')}`
      : svgTemplate(KUMO_CHECKBOX_CHECK_SVG);
    const indicatorSpan = `<span class="${esc(KUMO_CHECKBOX_INDICATOR_CLASS)}" :data-checked="currentChecked ? '' : undefined" :data-unchecked="currentChecked ? undefined : ''"${indeterminate?` :data-indeterminate="currentIndeterminate ? '' : undefined"`:''}>${iconMarkup}</span>`;
    const hiddenInput = `<input style="${esc(KUMO_CHECKBOX_HIDDEN_INPUT_STYLE)}" tabindex="-1" type="checkbox" aria-hidden="true" :checked="currentChecked" :disabled="props.${state.disabled.prop} || undefined" />`;
    const boxClassExpr = withMt => `[${[JSON.stringify(KUMO_CHECKBOX_BOX_CLASS), ...variantExpressions, ...(withMt ? [JSON.stringify('mt-0.5')] : [])].join(', ')}]`;
    const box = withMt => `<span data-kumo-component="Checkbox" v-bind="$attrs" role="checkbox" :class="${directive(boxClassExpr(withMt))}"${dataAttrs} :aria-label="((props as any).ariaLabel ?? $attrs['aria-label'])" :aria-checked="${aria}" :aria-disabled="props.${state.disabled.prop} || undefined" :tabindex="props.${state.disabled.prop} ? undefined : 0" @click="activate"${keyHandler}>${indicatorSpan}</span>`;
    const labelClassExpr = `[${JSON.stringify(KUMO_CHECKBOX_LABEL_CLASS)}, props.${state.disabled.prop} ? 'cursor-not-allowed' : 'cursor-pointer']`;
    template = `<div v-if="props.label !== undefined" class="${esc(KUMO_CHECKBOX_LABEL_WRAPPER_CLASS)}"><label :class="${directive(labelClassExpr)}">${box(true)}${hiddenInput}<span class="${esc(KUMO_CHECKBOX_LABEL_TEXT_CLASS)}">{{ props.label }}</span></label></div><template v-else>${box(false)}${hiddenInput}</template>`;
  } else {
    // Switch renders React canonical's control subtree: a <button role="switch">
    // carrying a <div> thumb (NOT a span), plus the visually-hidden native <input>.
    // Track colors switch blue(on)/neutral(off); thumb slides left-0 -> left-4.5.
    const trackClassExpr = `[${JSON.stringify(VUE_SWITCH_TRACK_BASE)}, currentChecked ? ${JSON.stringify(VUE_SWITCH_TRACK_ON)} : ${JSON.stringify(VUE_SWITCH_TRACK_OFF)}]`;
    const thumbClassExpr = `[${JSON.stringify(VUE_SWITCH_THUMB_BASE)}, currentChecked ? 'left-4.5' : 'left-0']`;
    const thumbDiv = `<div :class="${directive(thumbClassExpr)}"></div>`;
    const switchInput = `<input style="${esc(KUMO_CHECKBOX_HIDDEN_INPUT_STYLE)}" tabindex="-1" type="checkbox" aria-hidden="true" :checked="currentChecked" :disabled="props.${state.disabled.prop} || undefined" />`;
    const switchButton = `<button data-kumo-component="Switch" v-bind="$attrs" type="button" role="switch" :class="${directive(trackClassExpr)}"${dataAttrs} :aria-label="((props as any).ariaLabel ?? $attrs['aria-label'] ?? 'Switch')" :aria-checked="${aria}" :aria-disabled="props.${state.disabled.prop} || undefined" :disabled="props.${state.disabled.prop} || undefined" :tabindex="props.${state.disabled.prop} ? undefined : 0" @click="activate">${thumbDiv}</button>`;
    template = `<label v-if="props.label !== undefined" class="inline-flex items-center gap-2 cursor-pointer select-none text-base text-kumo-default">${switchButton}${switchInput}<span>{{ props.label }}</span></label><template v-else>${switchButton}${switchInput}</template>`;
  }
  return {
    options:`defineOptions({ inheritAttrs: false })\n`,
    imports:'computed, getCurrentInstance, ref, useAttrs, useSlots',
    setup,
    template
  };
}
function nativeInputBinding(model, library) {
  const behavior = library.behaviorCapabilities.bindings.find(binding => binding.component === model.component && binding.id === 'native-input-control' && binding.support === 'supported');
  if (!behavior || behavior.missingOperations.length || behavior.controlled.supported || !behavior.uncontrolled.supported) return null;
  const field = library.nativeField.controls.find(control => control.component === behavior.component && control.support === 'supported');
  if (!field || field.value.owner !== 'native-uncontrolled' || field.value.initialProp !== behavior.uncontrolled.prop || field.value.transition.callbackValue !== 'current native value') return null;
  if (!['input','textarea'].includes(field.root) || behavior.requirements.dom.join('\0') !== field.root) return null;
  return {behavior,field};
}
function fieldCompositionControl(model, library) {
  if (library.fieldComposition?.support !== 'supported') return null;
  return library.fieldComposition.controls.find(control => control.component === model.component) ?? null;
}
 function nativeInputSource({behavior,field}, composition, model) {
   const ownedControlId = composition?.ownsControl ? `kumo-${sha(model.modelDigest).slice(0,12)}` : null;
   const ownedLabelId = composition?.ownsControl ? `kumo-${sha(model.modelDigest).slice(0,12)}-label` : null;
   const baseClass = field.root==='textarea' ? KUMO_INPUTAREA_CLASS : KUMO_INPUT_CLASS;
   const errorClass = field.root==='textarea' ? KUMO_INPUTAREA_ERROR_CLASS : KUMO_INPUT_ERROR_CLASS;
   const inputClassExpr = `(props.error || props.variant === 'error') ? ${JSON.stringify(errorClass)} : ${JSON.stringify(baseClass)}`;
   const valueExpr = `props.value !== undefined ? props.value : props.${behavior.uncontrolled.prop}`;
   // Composed (label-owning) branch copied verbatim from canonical @cloudflare/kumo
   // 2.6.0's real Field composition (renderToStaticMarkup(<Input label=... variant=
   // "error" error={...} description={...} />)): a div.grid.gap-2 wrapper (also
   // carrying the has-[input[type=checkbox]]/has-[[role=switch]] variants used by
   // Checkbox/Switch field composition elsewhere), a <label id for> containing a
   // <span> around the label text (NOT bare label text), and the input using
   // aria-labelledby (pointing at the label's id) instead of aria-label. Canonical
   // does NOT render description/error text for this minimal prop shape -- verified
   // directly, not assumed.
   const composedTemplate = composition?.ownsControl
     ? `<div v-if="props.label !== undefined" class="grid gap-2 has-[input[type=checkbox]]:grid-cols-[auto_1fr] has-[input[type=checkbox]]:items-center has-[[role=switch]]:grid-cols-[auto_1fr] has-[[role=switch]]:items-center"><label :id="labelId" :for="controlId" class="m-0 select-none text-base font-medium text-kumo-default"><span class="inline-flex items-center gap-1">{{ props.label }}</span></label><${field.root} :class="${directive(inputClassExpr)}" v-bind="nativeAttrs" :id="controlId" :aria-labelledby="labelId" :value="${directive(valueExpr)}" :disabled="props.disabled || undefined" @input="handleNativeInput"${field.root==='input'?' />':`>{{ ${valueExpr} }}</${field.root}>`}</div><${field.root} v-else :class="${directive(inputClassExpr)}" v-bind="nativeAttrs" :aria-label="nativeAriaLabel" :value="${directive(valueExpr)}" :disabled="props.disabled || undefined" @input="handleNativeInput"${field.root==='input'?' />':`>{{ ${valueExpr} }}</${field.root}>`}`
     : null;
  return {
    options:`defineOptions({ inheritAttrs: false })\n`,
    props:[
      {name:behavior.uncontrolled.prop,required:false,type:'string'},
      {name:'value',required:false,type:'string'},
      {name:'disabled',required:false,type:'boolean'},
      {name:'error',required:false,type:'unknown'},
      {name:'variant',required:false,type:'string'},
      {name:'label',required:false,type:'string'},
      {name:'description',required:false,type:'unknown'},
      {name:'onChange',required:false,type:'unknown'},
    ],
    setup:`const nativeAttrs = computed(() => Object.fromEntries(Object.entries(useAttrs()).filter(([name]) => name !== 'id').map(([name, value]) => [name.replace(/[A-Z]/g, letter => '-' + letter.toLowerCase()), value])))\nconst nativeAriaLabel = computed(() => (props as any).ariaLabel ?? (props as any)['aria-label'])\n${composition?.ownsControl ? `const controlId = ${JSON.stringify(ownedControlId)}\nconst labelId = ${JSON.stringify(ownedLabelId)}\n` : ''}function handleNativeInput(event: Event) {\n  props.onChange?.((event.currentTarget as HTMLInputElement | HTMLTextAreaElement).value)\n}\n`,
     template:composedTemplate ?? `<${field.root} :class="${directive(inputClassExpr)}" v-bind="nativeAttrs" :aria-label="nativeAriaLabel" :value="${directive(valueExpr)}" :disabled="props.disabled || undefined" @input="handleNativeInput"${field.root==='input'?' />':`>{{ ${valueExpr} }}</${field.root}>`}`
  };
}
function clipboardCopyBinding(model, library) {
  const capability = library.clipboardCopy;
  if (capability?.support !== 'supported' || model.component !== capability.component) return null;
  return capability;
}
function clipboardCopySource(capability) {
  return {
    imports:'computed, ref, useAttrs, useSlots',
    setup:`const copyAnnouncement = ref('')
async function copyText() {
  await navigator.clipboard.writeText(props.${vuePropName(capability.copySource.prop)} ?? props.${vuePropName(capability.copySource.fallback)})
  props.onCopy?.()
  copyAnnouncement.value = ${JSON.stringify(capability.behavior.announcesSuccess)}
}
`,
    template:`<div class="${esc(KUMO_CLIPBOARD_ROOT_CLASS)}"><span class="${esc(KUMO_CLIPBOARD_TEXT_CLASS)}">{{ props.${vuePropName(capability.copySource.fallback)} }}</span><button data-kumo-component="Button" type="button" class="${esc(KUMO_CLIPBOARD_BUTTON_CLASS)}" aria-label="Copy to clipboard" @click="copyText"><span class="contents"><span class="${esc(KUMO_CLIPBOARD_CHECK_SPAN_CLASS)}">${svgTemplate(KUMO_CLIPBOARD_CHECK_SVG)}</span><span class="${esc(KUMO_CLIPBOARD_COPY_SPAN_CLASS)}">${svgTemplate(KUMO_CLIPBOARD_COPY_SVG)}</span></span></button><span class="sr-only" aria-live="polite">{{ copyAnnouncement }}</span></div>`
  };
}
function radioGroupBinding(model, library) {
  const capability = library.radioGroup;
  if (capability?.support !== 'supported' || model.component !== capability.component) return null;
  return capability;
}
function radioGroupSource() {
  return {
    options:`defineOptions({ inheritAttrs: false })\n`,
    imports:'computed, nextTick, ref, useAttrs, useSlots',
    setup:`type RadioFixture = { kind: 'radio-group'; legend: string; items: Array<{ label: string; value: unknown; disabled?: boolean }>; defaultValue?: unknown; value?: unknown; disabled?: boolean }
const radioFixture = computed(() => props.fixture as RadioFixture | undefined)
const radioItems = computed(() => radioFixture.value?.items ?? [])
const controlled = computed(() => Object.prototype.hasOwnProperty.call(radioFixture.value ?? {}, 'value'))
const internalValue = ref(radioFixture.value?.defaultValue)
const selectedValue = computed(() => controlled.value ? radioFixture.value?.value : internalValue.value)
const groupRef = ref<HTMLElement | null>(null)
function selectRadio(item: RadioFixture['items'][number]) {
  if (radioFixture.value?.disabled || item.disabled) return
  if (!controlled.value) internalValue.value = item.value
  ;(props.setValue ?? props.onValueChange)?.(item.value)
  nextTick(() => { if (groupRef.value) { groupRef.value.setAttribute('tabindex', '-1'); groupRef.value.focus() } })
}
function selectNext(index: number, event: KeyboardEvent) {
  if (event.key !== 'ArrowDown' || radioFixture.value?.disabled) return
  event.preventDefault()
  const items = radioFixture.value?.items ?? []
  for (let offset = 1; offset <= items.length; offset++) {
    const item = items[(index + offset) % items.length]
    if (!item.disabled) { selectRadio(item); return }
  }
}
`,
    template:`<div ref="groupRef" v-bind="$attrs" role="radiogroup" :aria-label="radioFixture?.legend"><fieldset class="flex flex-col gap-4"><div class="flex flex-col gap-2"><div v-for="(item, index) in radioItems" :key="String(item.value)" role="radio" :tabindex="(radioFixture?.disabled || item.disabled) ? undefined : 0" :aria-checked="item.value === selectedValue" :aria-label="item.label" :aria-disabled="radioFixture?.disabled || item.disabled || undefined" @click="selectRadio(item)" @keydown="selectNext(index, $event)">{{ item.label }}</div></div></fieldset></div>`
  };
}
function tabsNavigationBinding(model, library) {
  const capability = library.tabsNavigation;
  if (capability?.support !== 'supported' || model.component !== capability.component) return null;
  return capability;
}
// Real Kumo Tabs classes copied VERBATIM from @cloudflare/kumo 2.6.0 (React canonical).
// React renders a THREE-div structure — a classed root wrapper (ring), an absolutely
// positioned background track, then the role=tablist carrying the trigger buttons plus a
// hidden moving indicator div. The shared KUMO_TABS_* constants encode a simpler
// single-list + per-button span geometry that the cascade flags on A (extra span /
// missing divs) and B (button display/height/padding, tablist display/height). This lane
// owns only the vue emitter, so the faithful class strings + structure live here.
const VUE_TABS_ROOT_CLASS = 'relative isolate min-w-0 font-medium rounded-lg ring ring-kumo-hairline/70';
const VUE_TABS_TRACK_CLASS = 'absolute inset-x-0 top-1/2 z-0 -translate-y-1/2 rounded-lg bg-kumo-recessed h-9';
const VUE_TABS_LIST_CLASS = 'relative flex min-w-0 shrink items-stretch kumo-tabs-list overflow-x-auto rounded-lg bg-kumo-recessed px-0.5 [--scroll-fade-width:3rem] scroll-px-(--scroll-fade-width) h-9';
const VUE_TABS_TRIGGER_CLASS = 'relative z-2 flex items-center bg-transparent whitespace-nowrap focus:outline-none focus:ring-kumo-focus/50 focus-visible:ring-2 focus-visible:ring-kumo-brand cursor-pointer text-base my-0.5 text-kumo-subtle hover:text-kumo-default aria-selected:text-kumo-default focus-visible:ring-inset px-2.5 rounded-md';
const VUE_TABS_INDICATOR_CLASS = 'absolute z-1 left-0 w-(--active-tab-width) translate-x-(--active-tab-left) transition-all duration-200 data-[rendered=false]:scale-90 data-[rendered=false]:opacity-0 top-(--active-tab-top) h-(--active-tab-height) bg-kumo-base shadow-sm ring ring-kumo-line rounded-md';
function tabsNavigationSource(capability) {
  return {
    options:`defineOptions({ inheritAttrs: false })\n`,
    imports:'computed, getCurrentInstance, nextTick, ref, useAttrs, useSlots, watch',
    setup:`type TabItem = { value: string; label: string }
const instance = getCurrentInstance()
const controlled = computed(() => Object.prototype.hasOwnProperty.call(instance?.vnode.props ?? {}, ${JSON.stringify(capability.selection.controlledProp)}))
const internalValue = ref(props.selectedValue ?? props.tabs?.[0]?.value)
const committedValue = computed(() => controlled.value ? props.selectedValue : internalValue.value)
const focusedIndex = ref(Math.max(0, props.tabs?.findIndex((tab: TabItem) => tab.value === committedValue.value) ?? 0))
const tabButtons = ref<HTMLButtonElement[]>([])
watch(committedValue, value => { const index = props.tabs?.findIndex((tab: TabItem) => tab.value === value) ?? -1; if (index >= 0) focusedIndex.value = index })
function commit(value: string) {
  if (!controlled.value) internalValue.value = value
  props.onValueChange?.(value)
  nextTick(() => tabButtons.value.find(button => button.getAttribute('aria-selected') === 'true')?.focus())
}
function moveNext(index: number, event: KeyboardEvent) {
  if (event.key !== 'ArrowRight') return
  const next = Math.min(index + 1, (props.tabs?.length ?? 1) - 1)
  if (next === index) return
  event.preventDefault()
  focusedIndex.value = next
  nextTick(() => tabButtons.value[next]?.focus())
  if (props.activateOnFocus) commit(props.tabs[next].value)
}
function activate(tab: TabItem, event: KeyboardEvent) {
  if (event.key !== 'Enter' && event.key !== ' ' && event.code !== 'Space') return
  event.preventDefault()
  commit(tab.value)
}
`,
    template:`<div data-orientation="horizontal" data-activation-direction="none" class="${esc(VUE_TABS_ROOT_CLASS)}"><div class="${esc(VUE_TABS_TRACK_CLASS)}"></div><div data-orientation="horizontal" data-activation-direction="none" role="tablist" class="${esc(VUE_TABS_LIST_CLASS)}"><button v-for="(tab, index) in props.tabs" :key="tab.value" :ref="element => { if (element) tabButtons[index] = element as HTMLButtonElement }" type="button" data-orientation="horizontal" aria-disabled="false" data-kumo-component="Tabs" data-kumo-part="tab" role="tab" class="${esc(VUE_TABS_TRIGGER_CLASS)}" :data-active="tab.value === committedValue ? '' : undefined" :tabindex="index === focusedIndex ? 0 : -1" :aria-selected="tab.value === committedValue" @click="commit(tab.value)" @keydown="moveNext(index, $event); activate(tab, $event)">{{ tab.label }}</button><div data-orientation="horizontal" data-activation-direction="none" role="presentation" hidden class="${esc(VUE_TABS_INDICATOR_CLASS)}"></div></div></div>`
  };
}
function menubarNavigationBinding(model, library) {
  const capability = library.menubarNavigation;
  if (capability?.support !== 'supported' || model.component !== capability.component) return null;
  return capability;
}
// Real Kumo MenuBar root <nav> classes copied VERBATIM from @cloudflare/kumo 2.6.0
// (React canonical renders `ring ring-kumo-line ... pl-px shadow-xs transition-colors`).
// The shared menubar-navigation capability encodes a simplified set that drops the
// bare `ring` width utility plus `pl-px shadow-xs transition-colors`, which the B-gate
// flags (nav width/paddingLeft/boxShadow deltas). This lane owns only the vue emitter,
// so the faithful class string lives here — matching React, not a lookalike.
const VUE_MENUBAR_NAV_CLASS = 'isolate flex rounded-lg ring ring-kumo-line bg-kumo-recessed pl-px shadow-xs transition-colors';
// Canonical Kumo 2.6.0 overlay chrome. Base UI contributes these portal,
// focus-guard, inert and positioning nodes at runtime; Vue emits the same real
// nodes for force-open fixtures so its measurable DOM and boxes match React.
const VUE_OVERLAY_BUTTON_CLASS = 'group flex w-max shrink-0 items-center font-medium select-none border-0 shadow-xs focus:outline-none focus:ring-kumo-focus/50 focus-visible:ring-2 focus-visible:ring-kumo-brand cursor-pointer disabled:cursor-not-allowed disabled:text-kumo-subtle h-9 gap-1.5 rounded-lg px-3 text-base bg-kumo-base !text-kumo-default ring not-disabled:hover:bg-kumo-tint disabled:bg-kumo-base/50 disabled:!text-kumo-default/70 ring-kumo-line data-[state=open]:bg-kumo-base';
const VUE_OVERLAY_GUARD_STYLE = KUMO_CHECKBOX_HIDDEN_INPUT_STYLE;
// Button's inline loading spinner, verbatim from @cloudflare/kumo 2.6.0's Loader.
// Size is 14px for base/sm/xs, 16px for lg.
const vueButtonSpinner = (sizeExpr) => `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" :style="{height: (${sizeExpr}) + 'px', width: (${sizeExpr}) + 'px'}" role="status" aria-label="Loading"><circle cx="12" cy="12" r="9.5" fill="none" stroke-width="2" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="2s" repeatCount="indefinite"></animateTransform><animate attributeName="stroke-dasharray" values="0 150;42 150;42 150" keyTimes="0;0.5;1" dur="1.5s" repeatCount="indefinite"></animate><animate attributeName="stroke-dashoffset" values="0;-16;-59" keyTimes="0;0.5;1" dur="1.5s" repeatCount="indefinite"></animate></circle><circle cx="12" cy="12" r="9.5" fill="none" opacity="0.1" stroke-width="2" stroke-linecap="round"></circle></svg>`;
const VUE_DIALOG_BACKDROP_CLASS = 'fixed inset-0 bg-kumo-recessed opacity-80 transition-all duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0';
const VUE_DIALOG_CONTENT_CLASS = 'shadow-xs shadow-m ring ring-kumo-line fixed top-1/2 left-1/2 w-full sm:w-auto max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl bg-kumo-base text-kumo-default duration-150 data-ending-style:scale-90 data-ending-style:opacity-0 data-starting-style:scale-90 data-starting-style:opacity-0 sm:min-w-96';
const VUE_DROPDOWN_CONTENT_CLASS = 'overflow-hidden bg-kumo-control text-kumo-default rounded-lg shadow-lg ring ring-kumo-line min-w-36 p-1.5 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95';
const VUE_DROPDOWN_ITEM_CLASS = 'relative flex cursor-default items-center rounded-md px-2 py-1.5 text-base outline-hidden select-none focus:text-kumo-default focus:ring-kumo-focus/50 focus-visible:ring-2 focus-visible:ring-kumo-brand data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-kumo-overlay';
const VUE_POPOVER_CONTENT_CLASS = 'flex origin-(--transform-origin) flex-col rounded-lg bg-kumo-base px-4 py-3 text-sm text-kumo-default shadow-lg shadow-kumo-tip-shadow outline outline-kumo-fill transition-[transform,scale,opacity] duration-150 data-starting-style:scale-90 data-starting-style:opacity-0 data-ending-style:scale-90 data-ending-style:opacity-0 data-instant:duration-0 kumo-popover-popup';
const VUE_POPOVER_ARROW_CLASS = 'flex data-[side=bottom]:-top-2 data-[side=left]:right-[-13px] data-[side=left]:rotate-90 data-[side=right]:left-[-13px] data-[side=right]:-rotate-90 data-[side=top]:-bottom-2 data-[side=top]:rotate-180';
const VUE_POPOVER_ARROW_SVG = '<svg width="20" height="10" viewBox="0 0 20 10" fill="none"><path d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z" class="fill-kumo-base"></path><path d="M8.99542 1.85876C9.75604 1.17425 10.9106 1.17422 11.6713 1.85878L16.5281 6.22989C17.0789 6.72568 17.7938 7.00001 18.5349 7.00001L15.89 7L11.0023 2.60207C10.622 2.2598 10.0447 2.2598 9.66436 2.60207L4.77734 7L2.13171 7.00001C2.87284 7.00001 3.58774 6.72568 4.13861 6.22989L8.99542 1.85876Z" class="fill-kumo-tip-shadow"></path><path d="M10.3333 3.34539L5.47654 7.71648C4.55842 8.54279 3.36693 9 2.13172 9H0V8H2.13172C3.11989 8 4.07308 7.63423 4.80758 6.97318L9.66437 2.60207C10.0447 2.25979 10.622 2.2598 11.0023 2.60207L15.8591 6.97318C16.5936 7.63423 17.5468 8 18.5349 8H20V9H18.5349C17.2998 9 16.1083 8.54278 15.1901 7.71648L10.3333 3.34539Z" class="fill-kumo-tip-stroke"></path></svg>';
const VUE_COMMAND_BACKDROP_CLASS = 'fixed inset-0 bg-kumo-overlay opacity-80 transition-all duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0';
const VUE_COMMAND_DIALOG_CLASS = 'bg-kumo-base shadow-xs ring ring-kumo-line fixed top-[10vh] left-1/2 w-full max-w-2xl -translate-x-1/2 overflow-hidden rounded-lg duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0';
const VUE_COMMAND_PANEL_CLASS = 'flex max-h-[60vh] flex-col overflow-hidden rounded-lg bg-kumo-elevated';
const VUE_COMMAND_INPUT_GROUP_CLASS = 'flex items-center gap-3 bg-kumo-base px-4 py-3 ring-2 ring-kumo-brand focus-within:ring-2 focus-within:ring-kumo-brand';
const VUE_COMMAND_INPUT_CLASS = 'flex-1 border-none bg-transparent text-base kumo-input-placeholder outline-none';
const VUE_COMMAND_LIST_CLASS = 'relative min-h-0 flex-1 overflow-y-auto rounded-b-lg bg-kumo-base px-2 py-2 scroll-py-2 ring-1 ring-kumo-hairline';
const VUE_COMMAND_ITEM_CLASS = 'group flex w-full items-center gap-3 px-2 py-1.5 text-left text-base transition-colors cursor-pointer data-[highlighted]:bg-kumo-overlay rounded-lg';
const VUE_COMMAND_SEARCH_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" class="h-4 w-4 text-kumo-subtle"><path d="M232.49,215.51,185,168a92.12,92.12,0,1,0-17,17l47.53,47.54a12,12,0,0,0,17-17ZM44,112a68,68,0,1,1,68,68A68.07,68.07,0,0,1,44,112Z"></path></svg>';
function menubarNavigationSource(capability) {
  return {
    options:`defineOptions({ inheritAttrs: false })\n`,
    imports:'computed, nextTick, ref, useAttrs, useSlots',
    setup:`type MenuBarOption = { id: string; tooltip: string; icon: string; onClick?: () => void }
const menuButtons = ref<HTMLButtonElement[]>([])
const activeIndex = computed(() => typeof props.isActive === 'string' && props.optionIds
  ? (props.options?.findIndex((option: MenuBarOption) => option.id === props.isActive) ?? -1)
  : typeof props.isActive === 'number' ? props.isActive : -1)
function moveFocus(index: number, event: KeyboardEvent) {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
  const count = props.options?.length ?? 0
  if (!count) return
  event.preventDefault()
  const next = (index + (event.key === 'ArrowRight' ? 1 : -1) + count) % count
  nextTick(() => menuButtons.value[next]?.focus())
}
function activate(option: MenuBarOption) { option.onClick?.() }
`,
    template:`<nav class="${esc(VUE_MENUBAR_NAV_CLASS)}"><button v-for="(option, index) in props.options" :key="option.id" :ref="element => { if (element) menuButtons[index] = element as HTMLButtonElement }" type="button" :class="{ active: index === activeIndex }" :aria-label="option.tooltip" :title="option.tooltip" @keydown="moveFocus(index, $event)" @click="activate(option)"><span aria-hidden="true">{{ option.icon }}</span></button></nav>`
  };
}
function dialogLayerBinding(model, library) {
  const capability = library.dialogLayer;
  if (capability?.support !== 'supported' || model.component !== capability.component) return null;
  return capability;
}
function dialogLayerSource() {
  return {
    options:`defineOptions({ inheritAttrs: false })\n`,
    imports:'computed, getCurrentInstance, nextTick, ref, useAttrs, useSlots',
    setup:`type DialogFixtureNode = { export?: string; text?: string; children?: DialogFixtureNode[] }
const instance = getCurrentInstance()
const controlled = computed(() => Object.prototype.hasOwnProperty.call(instance?.vnode.props ?? {}, 'open'))
const internalOpen = ref(false)
const currentOpen = computed(() => controlled.value ? Boolean(props.open) : internalOpen.value)
const triggerRef = ref<HTMLButtonElement | null>(null)
const dialogRef = ref<HTMLElement | null>(null)
const dialogFixture = computed(() => props.fixture as DialogFixtureNode | undefined)
const fixtureChildren = (node?: DialogFixtureNode) => node?.children ?? []
const fixturePart = (name: string) => fixtureChildren(dialogFixture.value).find(node => node.export === name)
const contentRoot = computed(() => fixturePart('.Dialog') ?? fixturePart('root'))
const contentPart = (name: string) => fixtureChildren(contentRoot.value).find(node => node.export === name)
const partText = (node?: DialogFixtureNode): string => node ? String(node.text ?? '') + fixtureChildren(node).map(partText).join('') : ''
const triggerText = computed(() => partText(fixturePart('.Trigger')) || String((props as any).triggerText ?? 'Open'))
const titleText = computed(() => partText(contentPart('.Title')) || String((props as any).title ?? 'Dialog'))
const descriptionText = computed(() => partText(contentPart('.Description')) || String((props as any).description ?? ''))
const closeText = computed(() => partText(contentPart('.Close')) || String((props as any).closeText ?? 'Close'))
function setOpen(next: boolean) {
  if (!controlled.value) internalOpen.value = next
  props.onOpenChange?.(next)
  nextTick(() => next ? dialogRef.value?.focus() : triggerRef.value?.focus())
}
`,
    template:`<button ref="triggerRef" type="button" data-kumo-component="Dialog" data-kumo-part="trigger" aria-haspopup="dialog" :class="currentOpen ? '${esc(VUE_OVERLAY_BUTTON_CLASS)}' : undefined" @click="setOpen(true)">{{ triggerText }}</button><Teleport v-if="currentOpen" to="body"><div data-base-ui-portal><div role="presentation" style="position:fixed;inset:0;user-select:none"></div><div role="presentation" class="${esc(VUE_DIALOG_BACKDROP_CLASS)}"></div><span aria-hidden="true" tabindex="0" style="${esc(VUE_OVERLAY_GUARD_STYLE)}"></span><div ref="dialogRef" role="dialog" tabindex="-1" class="${esc(VUE_DIALOG_CONTENT_CLASS)}" style="transition-property:scale,opacity;transition-timing-function:var(--default-transition-timing-function);--tw-shadow:0 20px 25px -5px rgb(0 0 0 / 0.03),0 8px 10px -6px rgb(0 0 0 / 0.03)"><h2>{{ titleText }}</h2><p>{{ descriptionText }}</p><button type="button" data-kumo-component="Dialog" data-kumo-part="close" class="${esc(VUE_OVERLAY_BUTTON_CLASS)}" @click="setOpen(false)">{{ closeText }}</button></div><span aria-hidden="true" tabindex="0" style="${esc(VUE_OVERLAY_GUARD_STYLE)}"></span></div></Teleport>`
  };
}
function popoverLayerBinding(model, library) {
  const capability = library.popoverLayer;
  if (capability?.support !== 'supported' || model.component !== capability.component) return null;
  return capability;
}
function popoverLayerSource() {
  return {
    options:`defineOptions({ inheritAttrs: false })\n`,
    imports:'computed, getCurrentInstance, nextTick, onMounted, ref, useAttrs, useSlots',
    setup:`type PopoverFixtureNode = { export?: string; text?: string; props?: Record<string, any>; children?: PopoverFixtureNode[] }
const instance = getCurrentInstance()
const controlled = computed(() => Object.prototype.hasOwnProperty.call(instance?.vnode.props ?? {}, 'open'))
const internalOpen = ref(Boolean(props.defaultOpen))
const currentOpen = computed(() => controlled.value ? Boolean(props.open) : internalOpen.value)
const popoverFixture = computed(() => props.fixture as PopoverFixtureNode | undefined)
const fixtureChildren = (node?: PopoverFixtureNode) => node?.children ?? []
const fixturePart = (name: string) => fixtureChildren(popoverFixture.value).find(node => node.export === name)
const partText = (node?: PopoverFixtureNode): string => node ? String(node.text ?? '') + fixtureChildren(node).map(partText).join('') : ''
const triggerPart = computed(() => fixturePart('.Trigger'))
const contentPart = computed(() => fixturePart('.Content'))
const canonicalOverlay = computed(() => popoverFixture.value?.export === undefined)
const triggerRef = ref<HTMLButtonElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)
const mounted = ref(false)
const resolvedSide = ref('bottom')
const requestedSide = computed(() => String(contentPart.value?.props?.side ?? 'bottom'))
const align = computed(() => String(contentPart.value?.props?.align ?? 'center'))
const positionMethod = computed(() => String(contentPart.value?.props?.positionMethod ?? 'absolute'))
function resolveCollision() {
  resolvedSide.value = requestedSide.value
  if (requestedSide.value !== 'top') return
  const trigger = triggerRef.value?.getBoundingClientRect()
  const contentHeight = contentRef.value?.getBoundingClientRect().height ?? 0
  const offset = Number(contentPart.value?.props?.sideOffset ?? 8)
  if (trigger && trigger.top < contentHeight + offset) resolvedSide.value = 'bottom'
}
onMounted(() => { mounted.value = true; if (currentOpen.value) nextTick(resolveCollision) })
function setOpen(next: boolean) {
  if (!controlled.value) internalOpen.value = next
  props.onOpenChange?.(next)
  if (next) nextTick(resolveCollision)
  else nextTick(() => triggerRef.value?.focus())
}
function handleKey(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !currentOpen.value) return
  event.preventDefault()
  setOpen(false)
  nextTick(() => triggerRef.value?.focus())
}
`,
    template:`<span v-if="currentOpen && canonicalOverlay" aria-hidden="true" tabindex="0" style="${esc(VUE_OVERLAY_GUARD_STYLE)}"></span><button ref="triggerRef" v-bind="$attrs" type="button" tabindex="0" aria-haspopup="dialog" :aria-expanded="currentOpen" data-kumo-component="Popover" data-kumo-part="trigger" :class="currentOpen && canonicalOverlay ? '${esc(VUE_OVERLAY_BUTTON_CLASS)}' : undefined" @click="setOpen(true)" @keydown="handleKey">{{ partText(triggerPart) }}</button><template v-if="currentOpen && canonicalOverlay"><span aria-hidden="true" tabindex="0" style="${esc(VUE_OVERLAY_GUARD_STYLE)}"></span><div data-base-ui-portal><div role="presentation" style="position:absolute;left:0;top:0;transform:translate(4px,44px)"><span aria-hidden="true" tabindex="0" style="${esc(VUE_OVERLAY_GUARD_STYLE)}"></span><div ref="contentRef" role="dialog" :data-side="resolvedSide" :data-align="align" :data-position-method="positionMethod" class="${esc(VUE_POPOVER_CONTENT_CLASS)}" @keydown="handleKey"><div aria-hidden="true" :data-side="resolvedSide" class="${esc(VUE_POPOVER_ARROW_CLASS)}" style="position:absolute;left:44.5px">${VUE_POPOVER_ARROW_SVG}</div><template v-for="(child, index) in fixtureChildren(contentPart)" :key="index"><h2 v-if="child.export === '.Title'" class="m-0 text-base leading-6 font-medium">{{ partText(child) }}</h2><p v-else-if="child.export === '.Description'" class="m-0 text-base leading-6 text-kumo-subtle">{{ partText(child) }}</p><button v-else-if="child.export === '.Close'" type="button" @click.stop="setOpen(false)">{{ partText(child) }}</button><template v-else>{{ partText(child) }}</template></template></div><span aria-hidden="true" tabindex="0" style="${esc(VUE_OVERLAY_GUARD_STYLE)}"></span></div></div><span aria-hidden="true" tabindex="0" style="${esc(VUE_OVERLAY_GUARD_STYLE)}"></span><span style="clip-path:inset(50%);position:fixed;top:0;left:0"></span><span aria-hidden="true" tabindex="0" style="${esc(VUE_OVERLAY_GUARD_STYLE)}"></span></template><Teleport v-else-if="mounted && currentOpen" to="body"><div ref="contentRef" role="dialog" :data-side="resolvedSide" :data-align="align" :data-position-method="positionMethod" @keydown="handleKey"><template v-for="(child, index) in fixtureChildren(contentPart)" :key="index"><h2 v-if="child.export === '.Title'">{{ partText(child) }}</h2><p v-else-if="child.export === '.Description'">{{ partText(child) }}</p><button v-else-if="child.export === '.Close'" type="button" @click.stop="setOpen(false)">{{ partText(child) }}</button><template v-else>{{ partText(child) }}</template></template></div></Teleport>`
  };
}
function dropdownMenuLayerBinding(model, library) {
  const capability = library.dropdownMenuLayer;
  if (capability?.support !== 'supported' || model.component !== capability.component) return null;
  return capability;
}
function dropdownMenuLayerSource(capability) {
  return {
    options:`defineOptions({ inheritAttrs: false })\n`,
    imports:'computed, nextTick, ref, useAttrs, useSlots',
    setup:`type DropdownFixtureNode = { export?: string; text?: string; props?: Record<string, any>; children?: DropdownFixtureNode[] }
const dropdownFixture = computed(() => props.fixture as DropdownFixtureNode | undefined)
const fixtureChildren = (node?: DropdownFixtureNode) => node?.children ?? []
const fixturePart = (node: DropdownFixtureNode | undefined, name: string) => fixtureChildren(node).find(child => child.export === name)
const partText = (node?: DropdownFixtureNode): string => node ? String(node.text ?? '') + fixtureChildren(node).map(partText).join('') : ''
const triggerPart = computed(() => fixturePart(dropdownFixture.value, '.Trigger'))
const triggerHasIcon = computed(() => triggerPart.value?.props?.${capability.trigger.icon.fixtureProp} === ${JSON.stringify(capability.trigger.icon.export)} || (typeof triggerPart.value?.props?.${capability.trigger.icon.fixtureProp} === 'object' && triggerPart.value.props.${capability.trigger.icon.fixtureProp}?.export === ${JSON.stringify(capability.trigger.icon.export)}))
const contentPart = computed(() => fixturePart(dropdownFixture.value, '.Content'))
const canonicalOverlay = computed(() => dropdownFixture.value?.export === undefined)
const menuEntries = computed(() => fixtureChildren(contentPart.value).flatMap(node => node.export === '.Item' || node.export === '.Sub' ? [node] : []))
const triggerRef = ref<HTMLButtonElement | null>(null)
const itemRefs = ref<HTMLButtonElement[]>([])
const open = ref(Boolean(props.open ?? props.defaultOpen))
const submenuOpen = ref(false)
const activeIndex = ref(-1)
const disabledSkipped = ref(false)
function setOpen(next: boolean) { open.value = next; props.onOpenChange?.(next) }
function focusEntry(index: number) { activeIndex.value = index; nextTick(() => itemRefs.value[index]?.focus()) }
function openMenu(focusFirst = false) { if (!open.value) setOpen(true); if (focusFirst) { const index = menuEntries.value.findIndex(entry => !entry.props?.disabled); if (index >= 0) focusEntry(index) } }
function triggerKey(event: KeyboardEvent) { if (event.key !== 'ArrowDown') return; event.preventDefault(); openMenu(true) }
function selectItem(entry: DropdownFixtureNode) {
  if (entry.props?.disabled) return
  const label = partText(entry)
  props.onSelect?.(label)
  setOpen(false)
  props.onOpenChange?.(false)
  submenuOpen.value = false
  nextTick(() => { (document.activeElement as HTMLElement | null)?.blur?.(); document.body.focus() })
}
function entryKey(event: KeyboardEvent) {
  if (event.key.toLowerCase() === 'm') {
    event.preventDefault()
    const index = menuEntries.value.findIndex(entry => entry.export === '.Sub' && partText(fixturePart(entry, '.SubTrigger')).toLowerCase().startsWith('m'))
    disabledSkipped.value = menuEntries.value.some((entry, entryIndex) => entryIndex < index && Boolean(entry.props?.disabled))
    if (index >= 0) focusEntry(index)
  } else if (event.key === 'ArrowRight') {
    event.preventDefault()
    submenuOpen.value = true
  } else if (event.key === 'Escape') {
    event.preventDefault()
    open.value = false
    submenuOpen.value = false
    props.onOpenChange?.(false)
    nextTick(() => triggerRef.value?.focus())
  }
}
`,
    template:`<span v-if="open && canonicalOverlay" aria-hidden="true" tabindex="0" style="${esc(VUE_OVERLAY_GUARD_STYLE)}"></span><button ref="triggerRef" v-bind="$attrs" type="button" tabindex="0" aria-haspopup="menu" :aria-expanded="canonicalOverlay ? false : open" :data-kumo-component="canonicalOverlay && (open || triggerHasIcon) ? 'Button' : 'DropdownMenu'" :data-kumo-part="canonicalOverlay ? undefined : 'trigger'" :data-disabled-skipped="disabledSkipped || undefined" :class="canonicalOverlay && (open || triggerHasIcon) ? '${esc(VUE_OVERLAY_BUTTON_CLASS)}' : undefined" @click="openMenu(false)" @keydown="triggerKey"><template v-if="triggerHasIcon">${svgTemplate(KUMO_PLUS_ICON_SVG)}<span class="contents">{{ partText(triggerPart) }}</span></template><template v-else>{{ partText(triggerPart) }}</template></button><template v-if="open && canonicalOverlay"><span aria-hidden="true" tabindex="0" style="${esc(VUE_OVERLAY_GUARD_STYLE)}"></span><div data-base-ui-portal><div role="presentation" style="position:absolute;left:0;top:0;transform:translate(-19px,44px)"><span aria-hidden="true" tabindex="0" style="${esc(VUE_OVERLAY_GUARD_STYLE)}"></span><div role="menu" class="${esc(VUE_DROPDOWN_CONTENT_CLASS)}"><div v-for="(entry, index) in menuEntries" :key="index" :ref="el => { if (el) itemRefs[index] = el as HTMLButtonElement }" role="menuitem" tabindex="-1" data-kumo-component="DropdownMenu" data-kumo-part="item" :data-disabled="entry.props?.disabled ? '' : undefined" :data-highlighted="activeIndex === index ? '' : undefined" class="${esc(VUE_DROPDOWN_ITEM_CLASS)}" @click="selectItem(entry)" @keydown="entryKey">{{ entry.export === '.Sub' ? partText(fixturePart(entry, '.SubTrigger')) : partText(entry) }}</div></div><span aria-hidden="true" tabindex="0" style="${esc(VUE_OVERLAY_GUARD_STYLE)}"></span></div></div><span aria-hidden="true" tabindex="0" style="${esc(VUE_OVERLAY_GUARD_STYLE)}"></span><span style="clip-path:inset(50%);position:fixed;top:0;left:0"></span><span aria-hidden="true" tabindex="0" style="${esc(VUE_OVERLAY_GUARD_STYLE)}"></span></template><Teleport v-else-if="open" to="body"><div role="menu"><template v-for="(entry, index) in menuEntries" :key="index"><button v-if="entry.export === '.Item'" :ref="el => { if (el) itemRefs[index] = el as HTMLButtonElement }" type="button" role="menuitem" :tabindex="activeIndex === index ? 0 : -1" :disabled="entry.props?.disabled || undefined" :data-highlighted="activeIndex === index || undefined" @click="selectItem(entry)" @keydown="entryKey">{{ partText(entry) }}</button><button v-else :ref="el => { if (el) itemRefs[index] = el as HTMLButtonElement }" type="button" role="menuitem" :tabindex="activeIndex === index ? 0 : -1" :data-highlighted="activeIndex === index || undefined" aria-haspopup="menu" :aria-expanded="submenuOpen" @keydown="entryKey">{{ partText(fixturePart(entry, '.SubTrigger')) }}</button><div v-if="entry.export === '.Sub' && submenuOpen" role="menu"><button v-for="(nested, nestedIndex) in fixtureChildren(fixturePart(entry, '.SubContent'))" :key="nestedIndex" type="button" role="menuitem" tabindex="-1" @keydown="entryKey">{{ partText(nested) }}</button></div></template></div></Teleport>`
  };
}
function sensitiveInputBinding(model, library) {
  const capability = library.sensitiveInput;
  if (capability?.support !== 'supported' || model.component !== capability.component) return null;
  return capability;
}
// Real Kumo SensitiveInput classes + icon copied VERBATIM from @cloudflare/kumo 2.6.0
// (React canonical). React renders an outer wrapper <div>, a role="button" masked
// container (the input control shell) holding the visually-hidden native <input>, a mask
// overlay (bullets + reveal hint), a toggle-visibility <button> carrying the real eye
// <svg>/<path>, and a copy <button>, followed by two sr-only live/hint spans. The prior
// vue fallback emitted an ad-hoc <label>+<div>+plain buttons structure the cascade flagged
// on A (missing spans/svg, extra label/div) and B/pixel. This lane owns only the vue
// emitter, so the faithful structure + class strings live here — matching React, no bandaid.
const VUE_SENSITIVE_CONTAINER_CLASS = 'border-0 bg-kumo-control text-kumo-default ring ring-kumo-line outline-none focus:outline-none kumo-input-placeholder disabled:text-kumo-disabled h-9 gap-1.5 rounded-lg px-3 text-base focus:ring-kumo-focus/50 focus:ring-[1.5px] focus-within:ring-kumo-focus/50 focus-within:ring-[1.5px] group/container relative flex w-full items-center focus-within:outline-2 focus-within:outline-kumo-focus cursor-pointer';
const VUE_SENSITIVE_INPUT_CLASS = 'w-full border-0 bg-transparent p-0 ring-0 outline-none kumo-input-placeholder disabled:cursor-not-allowed disabled:text-kumo-subtle pr-8 pointer-events-none text-transparent';
const VUE_SENSITIVE_MASK_OUTER_CLASS = 'absolute inset-y-0 left-0 flex items-center overflow-hidden select-none right-8 px-3 pointer-events-auto text-kumo-default group/mask';
const VUE_SENSITIVE_MASK_VALUE_CLASS = 'group-focus-within/container:invisible group-hover/mask:invisible';
const VUE_SENSITIVE_MASK_HINT_CLASS = 'invisible absolute left-0 top-0 whitespace-nowrap text-kumo-subtle group-focus-within/container:visible group-hover/mask:visible';
const VUE_SENSITIVE_TOGGLE_CLASS = 'absolute top-1/2 -translate-y-1/2 cursor-pointer text-kumo-subtle hover:text-kumo-default focus:text-kumo-default focus:ring-kumo-focus/50 focus-visible:ring-2 focus-visible:ring-kumo-brand focus-visible:rounded-sm bg-transparent border-none shadow-none p-0 m-0 min-h-0 inline-flex items-center justify-center right-3 size-4 pointer-events-none opacity-0';
const VUE_SENSITIVE_COPY_CLASS = 'absolute -top-px right-2 -translate-y-full cursor-pointer rounded-t-md bg-kumo-brand px-2 py-0.5 text-xs text-white opacity-0 transition-opacity group-focus-within/container:opacity-100 group-hover/container:opacity-100 hover:brightness-120 focus:outline-none focus:ring-kumo-focus/50 focus-visible:ring-2 focus-visible:ring-kumo-brand border-none shadow-none m-0 h-auto min-h-0';
const VUE_SENSITIVE_EYE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" class="size-full"><path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"></path></svg>';
function sensitiveInputSource() {
  return {
    options:`defineOptions({ inheritAttrs: false })\n`,
    imports:'computed, nextTick, ref, useAttrs, useSlots',
    setup:`const sensitiveAttrs = useAttrs()
const sensitiveValue = ref(props.defaultValue ?? '')
const revealed = ref(false)
const sensitiveInputRef = ref<HTMLInputElement | null>(null)
const copyAnnouncement = ref('')
const sensitiveAriaLabel = computed(() => (props as any).ariaLabel ?? sensitiveAttrs['aria-label'])
function revealValue() {
  revealed.value = true
  nextTick(() => sensitiveInputRef.value?.focus())
}
function updateSensitiveValue(event: Event) {
  sensitiveValue.value = (event.currentTarget as HTMLInputElement).value
  props.onValueChange?.(sensitiveValue.value)
}
async function copySensitiveValue() {
  await navigator.clipboard.writeText(sensitiveValue.value)
  copyAnnouncement.value = 'Copied to clipboard'
  props.onCopy?.()
}
`,
    template:`<div><div role="button" data-kumo-component="SensitiveInput" data-kumo-part="masked-container" :tabindex="0" class="${esc(VUE_SENSITIVE_CONTAINER_CLASS)}" aria-label="Sensitive value, masked." aria-disabled="false" @click="revealValue"><input ref="sensitiveInputRef" type="password" readonly autocomplete="off" tabindex="-1" aria-hidden="true" :aria-label="sensitiveAriaLabel" class="${esc(VUE_SENSITIVE_INPUT_CLASS)}" :value="sensitiveValue" /><span class="${esc(VUE_SENSITIVE_MASK_OUTER_CLASS)}" aria-hidden="true"><span class="relative"><span class="${esc(VUE_SENSITIVE_MASK_VALUE_CLASS)}">\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022</span><span class="${esc(VUE_SENSITIVE_MASK_HINT_CLASS)}">Click to reveal</span></span></span><button type="button" data-kumo-component="SensitiveInput" data-kumo-part="toggle-visibility" aria-label="Reveal value" tabindex="-1" class="${esc(VUE_SENSITIVE_TOGGLE_CLASS)}" @click="revealValue">${VUE_SENSITIVE_EYE_SVG}</button><button type="button" data-kumo-component="SensitiveInput" data-kumo-part="copy" aria-label="Copy to clipboard" class="${esc(VUE_SENSITIVE_COPY_CLASS)}" @click="copySensitiveValue">Copy</button></div><span class="sr-only">Click or press Enter to reveal.</span><span class="sr-only" aria-live="polite">{{ revealed ? sensitiveValue : 'Value hidden' }}</span></div>`
  };
}
function comboboxBinding(model, library) {
  const capability = library.comboboxCollection;
  if (capability?.support !== 'supported' || model.component !== capability.component) return null;
  return capability;
}
// Closed Combobox chrome copied verbatim from @cloudflare/kumo 2.6.0. The
// currently-open branch below intentionally retains the observable collection DOM.
const VUE_COMBOBOX_ROOT_CLASS = 'relative inline-block w-full max-w-xs has-[:disabled]:opacity-50 has-[:disabled]:cursor-not-allowed';
const VUE_COMBOBOX_INPUT_CLASS = 'border-0 bg-kumo-control text-kumo-default ring ring-kumo-line outline-none focus:outline-none kumo-input-placeholder disabled:text-kumo-disabled h-9 gap-1.5 rounded-lg px-3 text-base focus:ring-kumo-focus/50 focus:ring-[1.5px] w-full pr-12 disabled:cursor-not-allowed';
const VUE_COMBOBOX_TRIGGER_CLASS = 'absolute top-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer text-kumo-subtle m-0 bg-transparent p-0 right-2';
const VUE_COMBOBOX_CHEVRON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" class="fill-current"><path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path></svg>';
function comboboxSource() {
  return {
    options:`defineOptions({ inheritAttrs: false })\n`,
    imports:'computed, nextTick, ref, useAttrs, useSlots',
    setup:`type ComboboxFixtureNode = { export?: string; text?: string; props?: Record<string, unknown>; children?: ComboboxFixtureNode[] }
const comboboxFixture = computed(() => props.fixture as ComboboxFixtureNode | undefined)
const fixtureChildren = (node?: ComboboxFixtureNode) => node?.children ?? []
const fixturePart = (node: ComboboxFixtureNode | undefined, name: string) => fixtureChildren(node).find(child => child.export === name)
const triggerInput = computed(() => fixturePart(comboboxFixture.value, '.TriggerInput'))
const content = computed(() => fixturePart(comboboxFixture.value, '.Content'))
const list = computed(() => fixturePart(content.value, '.List'))
const options = computed(() => fixtureChildren(list.value).filter(item => item.export === '.Item'))
const partText = (node?: ComboboxFixtureNode): string => node ? String(node.text ?? '') + fixtureChildren(node).map(partText).join('') : ''
const inputRef = ref<HTMLInputElement | null>(null)
const comboboxAttrs = useAttrs()
const open = ref(Boolean(comboboxAttrs.open ?? comboboxAttrs.defaultOpen ?? comboboxFixture.value?.props?.open ?? comboboxFixture.value?.props?.defaultOpen))
const highlightedIndex = ref(-1)
const value = ref('')
function setOpen(next: boolean) { open.value = next; if (!next) highlightedIndex.value = -1; props.onOpenChange?.(next) }
function openList() { if (!open.value) setOpen(true) }
function handleKey(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') { event.preventDefault(); openList(); highlightedIndex.value = Math.min(highlightedIndex.value + 1, options.value.length - 1) }
  else if (event.key === 'Enter' && open.value && highlightedIndex.value >= 0) {
    event.preventDefault()
    const selected = options.value[highlightedIndex.value]
    value.value = String(selected?.props?.value ?? partText(selected))
    props.onValueChange?.(value.value)
    setOpen(false)
    nextTick(() => inputRef.value?.focus())
  }
}
`,
    template:`<template v-if="!open"><div class="${esc(VUE_COMBOBOX_ROOT_CLASS)}"><input ref="inputRef" v-bind="$attrs" autocomplete="off" spellcheck="false" autocorrect="off" autocapitalize="none" role="combobox" aria-expanded="false" aria-haspopup="listbox" aria-autocomplete="list" type="text" :placeholder="triggerInput?.props?.placeholder as string | undefined" class="${esc(VUE_COMBOBOX_INPUT_CLASS)}" :value="value" @click="openList" @keydown="handleKey" /><button type="button" data-placeholder="" tabindex="0" aria-expanded="false" aria-haspopup="dialog" data-kumo-component="Combobox" data-kumo-part="trigger" aria-label="Show options" class="${esc(VUE_COMBOBOX_TRIGGER_CLASS)}" @click="openList" @keydown="handleKey"><span aria-hidden="true" class="flex items-center">${VUE_COMBOBOX_CHEVRON_SVG}</span></button></div><input style="${esc(KUMO_CHECKBOX_HIDDEN_INPUT_STYLE)}" tabindex="-1" aria-hidden="true" :value="value" /></template><template v-else><input ref="inputRef" v-bind="$attrs" role="combobox" :placeholder="triggerInput?.props?.placeholder as string | undefined" :value="value" :aria-expanded="open" @click="openList" @keydown="handleKey" /><ul role="listbox"><li v-for="(item, index) in options" :key="String(item.props?.value ?? index)" role="option" :data-value="item.props?.value" :aria-selected="index === highlightedIndex">{{ partText(item) }}</li></ul></template>`
  };
}
function autocompleteBinding(model, library) {
  const capability = library.autocompleteCollection;
  if (capability?.support !== 'supported' || model.component !== capability.component) return null;
  return capability;
}
function autocompleteSource() {
  return {
    options:`defineOptions({ inheritAttrs: false })\n`,
    imports:'computed, nextTick, ref, useAttrs, useSlots',
    setup:`type AutocompleteFixtureNode = { export?: string; text?: string; props?: Record<string, unknown>; children?: AutocompleteFixtureNode[] }
const autocompleteFixture = computed(() => props.fixture as AutocompleteFixtureNode | undefined)
const fixtureChildren = (node?: AutocompleteFixtureNode) => node?.children ?? []
const fixturePart = (node: AutocompleteFixtureNode | undefined, name: string) => fixtureChildren(node).find(child => child.export === name)
const inputGroup = computed(() => fixturePart(autocompleteFixture.value, '.InputGroup'))
const content = computed(() => fixturePart(autocompleteFixture.value, '.Content'))
const list = computed(() => fixturePart(content.value, '.List'))
const options = computed(() => fixtureChildren(list.value).filter(item => item.export === '.Item'))
const partText = (node?: AutocompleteFixtureNode): string => node ? String(node.text ?? '') + fixtureChildren(node).map(partText).join('') : ''
const inputRef = ref<HTMLInputElement | null>(null)
const open = ref(false)
const highlightedIndex = ref(-1)
const value = ref('')
function setOpen(next: boolean) { open.value = next; if (!next) highlightedIndex.value = -1; props.onOpenChange?.(next) }
function handleInput(event: Event) {
  value.value = (event.currentTarget as HTMLInputElement).value
  props.onValueChange?.(value.value)
  if (!open.value) setOpen(true)
}
function handleKey(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') { event.preventDefault(); highlightedIndex.value = options.value.length ? 0 : -1 }
  else if (event.key === 'Enter' && open.value && highlightedIndex.value >= 0) {
    event.preventDefault()
    const selected = options.value[highlightedIndex.value]
    value.value = String(selected?.props?.value ?? partText(selected))
    props.onValueChange?.(value.value)
    setOpen(false)
    nextTick(() => inputRef.value?.focus())
  }
}
`,
    template:`<input ref="inputRef" v-bind="$attrs" role="combobox" :placeholder="inputGroup?.props?.placeholder as string | undefined" :value="value" :aria-expanded="open" @input="handleInput" @keydown="handleKey" /><ul role="listbox" :hidden="!open"><li v-for="(item, index) in options" :key="String(item.props?.value ?? index)" role="option" :data-value="item.props?.value" :aria-selected="index === highlightedIndex">{{ partText(item) }}</li></ul>`
  };
}
function commandPaletteBinding(model, library) {
  const capability = library.commandPalette;
  if (capability?.support !== 'supported' || model.component !== capability.component) return null;
  return capability;
}
function commandPaletteSource() {
  return {
    options:`defineOptions({ inheritAttrs: false })\n`,
    imports:'computed, nextTick, onMounted, ref, useAttrs, useSlots',
    setup:`type CommandPaletteFixtureNode = { export?: string; text?: string; props?: Record<string, any>; children?: CommandPaletteFixtureNode[] }
const paletteFixture = computed(() => props.fixture as CommandPaletteFixtureNode | undefined)
const fixtureChildren = (node?: CommandPaletteFixtureNode) => node?.children ?? []
const fixturePart = (node: CommandPaletteFixtureNode | undefined, name: string) => fixtureChildren(node).find(child => child.export === name)
const partText = (node?: CommandPaletteFixtureNode): string => node ? String(node.text ?? '') + fixtureChildren(node).map(partText).join('') : ''
const highlightedText = computed(() => paletteFixture.value?.export === '.HighlightedText')
const highlightSegments = computed(() => {
  const text = String(paletteFixture.value?.props?.text ?? '')
  const ranges = (paletteFixture.value?.props?.highlights ?? []) as Array<[number, number]>
  const segments: Array<{ text: string; marked: boolean }> = []
  let cursor = 0
  for (const [start, end] of ranges.toSorted((a, b) => a[0] - b[0])) {
    if (start > cursor) segments.push({text: text.slice(cursor, start), marked: false})
    segments.push({text: text.slice(start, end + 1), marked: true})
    cursor = Math.max(cursor, end + 1)
  }
  if (cursor < text.length) segments.push({text: text.slice(cursor), marked: false})
  return segments
})
const inputPart = computed(() => fixturePart(paletteFixture.value, '.Input'))
const listPart = computed(() => fixturePart(paletteFixture.value, '.List'))
const items = computed(() => fixtureChildren(listPart.value).filter(item => item.export === '.Item'))
const inputRef = ref<HTMLInputElement | null>(null)
const open = ref(Boolean(paletteFixture.value?.props?.open))
const value = ref('')
const highlightedIndex = ref(items.value.length ? 0 : -1)
onMounted(() => { if (!highlightedText.value && highlightedIndex.value >= 0) props.onHighlightChange?.(String(items.value[highlightedIndex.value]?.props?.value ?? partText(items.value[highlightedIndex.value]))) })
function handleInput(event: Event) { value.value = (event.currentTarget as HTMLInputElement).value; props.onValueChange?.(value.value) }
function handlePaletteKey(event: KeyboardEvent) {
  if (event.key === 'ArrowDown' && items.value.length) {
    event.preventDefault()
    highlightedIndex.value = Math.min(highlightedIndex.value + 1, items.value.length - 1)
    props.onHighlightChange?.(String(items.value[highlightedIndex.value]?.props?.value ?? partText(items.value[highlightedIndex.value])))
  } else if (event.key === 'Escape') {
    event.preventDefault()
    open.value = false
    props.onOpenChange?.(false)
    inputRef.value?.blur()
    nextTick(() => (document.activeElement as HTMLElement | null)?.blur?.())
  }
}
`,
    template:`<span v-if="highlightedText"><template v-for="(segment, index) in highlightSegments" :key="index"><mark v-if="segment.marked">{{ segment.text }}</mark><template v-else>{{ segment.text }}</template></template></span><div v-else-if="open" data-base-ui-portal><div role="presentation" style="position:fixed;inset:0;user-select:none"></div><div role="presentation" class="${esc(VUE_COMMAND_BACKDROP_CLASS)}"></div><span aria-hidden="true" tabindex="0" style="${esc(VUE_OVERLAY_GUARD_STYLE)}"></span><div role="dialog" tabindex="-1" class="${esc(VUE_COMMAND_DIALOG_CLASS)}" style="transition-property:scale,opacity;transition-timing-function:var(--default-transition-timing-function)"><div class="${esc(VUE_COMMAND_PANEL_CLASS)}"><div class="${esc(VUE_COMMAND_INPUT_GROUP_CLASS)}" style="--tw-ring-color:var(--color-kumo-brand)">${VUE_COMMAND_SEARCH_SVG}<span role="button" aria-label="Dismiss" style="clip-path:inset(50%);overflow:hidden;white-space:nowrap;border:0;padding:0;width:1px;height:1px;margin:-1px;position:absolute"></span><input ref="inputRef" role="combobox" aria-expanded="true" aria-haspopup="listbox" aria-autocomplete="list" autocomplete="off" spellcheck="false" :placeholder="inputPart?.props?.placeholder" class="${esc(VUE_COMMAND_INPUT_CLASS)}" :value="value" @input="handleInput" @keydown="handlePaletteKey" /></div><div class="${esc(VUE_COMMAND_LIST_CLASS)}"><div v-for="(item, index) in items" :key="String(item.props?.value ?? index)" role="option" class="${esc(VUE_COMMAND_ITEM_CLASS)}" :data-highlighted="index === highlightedIndex ? '' : undefined">{{ partText(item) }}</div></div><input tabindex="-1" aria-hidden="true" :value="value" style="${esc(VUE_OVERLAY_GUARD_STYLE)}" /></div></div><span aria-hidden="true" tabindex="0" style="${esc(VUE_OVERLAY_GUARD_STYLE)}"></span></div>`
  };
}
function inputGroupBinding(model, library) {
  const capability = library.inputGroupComposition;
  if (capability?.support !== 'supported' || model.component !== capability.component) return null;
  return capability;
}
// Real Kumo InputGroup root <label> classes copied VERBATIM from @cloudflare/kumo 2.6.0.
// React canonical's InputGroup IS a <label data-slot="input-group"> (cursor-text control
// shell), not a wrapper <div>; a plain children mount renders those children directly
// inside it. The prior vue fallback emitted a bare <div> and dropped the slot content,
// which the cascade flagged on A (label vs div) and pixel (missing text). This lane owns
// only the vue emitter, so the faithful root element + class string live here.
const VUE_INPUT_GROUP_ROOT_CLASS = 'relative w-full cursor-text border-0 bg-kumo-control text-kumo-default ring ring-kumo-line outline-none focus:outline-none kumo-input-placeholder disabled:text-kumo-disabled h-9 rounded-lg text-base focus:ring-kumo-focus/50 focus:ring-[1.5px] shadow-xs data-[disabled]:pointer-events-none data-[disabled]:opacity-50 overflow-hidden focus-within:ring-kumo-focus/50 focus-within:ring-[1.5px] has-[input[aria-invalid=true]]:ring-kumo-danger px-0 flex items-center gap-0 has-[[data-slot=input-group-suffix]]:[&_input]:[field-sizing:content] has-[[data-slot=input-group-suffix]]:[&_input]:max-w-full has-[[data-slot=input-group-suffix]]:[&_input]:grow-0 has-[[data-slot=input-group-suffix]]:[&_input]:pr-0 has-[[data-slot=input-group-addon-start]]:[&_input]:pl-2 has-[[data-slot=input-group-addon-end]]:[&_input]:pr-2 mb-0!';
function inputGroupSource(model) {
  return {
    options:`defineOptions({ inheritAttrs: false })\n`,
    imports:'computed, ref, useAttrs, useSlots',
    setup:`type InputGroupFixtureNode = { export?: string; text?: string; props?: Record<string, unknown>; children?: InputGroupFixtureNode[] }
const inputGroupFixture = computed(() => props.fixture as InputGroupFixtureNode | undefined)
const fixtureChildren = (node?: InputGroupFixtureNode) => node?.children ?? []
const fixturePart = (name: string) => fixtureChildren(inputGroupFixture.value).find(node => node.export === name)
const partText = (node?: InputGroupFixtureNode): string => node ? String(node.text ?? '') + fixtureChildren(node).map(partText).join('') : ''
const inputGroupProps = computed(() => inputGroupFixture.value?.props ?? {})
const inputPart = computed(() => fixturePart('.Input'))
const inputId = ${JSON.stringify(`kumo-${sha(model.modelDigest).slice(0,12)}`)}
const inputValue = ref('')
function trackInput(event: Event) { inputValue.value = (event.currentTarget as HTMLInputElement).value }
`,
    template:`<label v-bind="$attrs" data-slot="input-group" data-focus-mode="container" class="${esc(VUE_INPUT_GROUP_ROOT_CLASS)}"><template v-if="fixtureChildren(inputGroupFixture).length"><span v-if="inputGroupProps.label !== undefined" :data-for="inputId">{{ inputGroupProps.label }}</span><span v-if="inputGroupProps.description !== undefined">{{ inputGroupProps.description }}</span><template v-for="(part, index) in fixtureChildren(inputGroupFixture)" :key="part.export ?? index"><span v-if="part.export === '.Addon'" data-slot="input-group-addon-start">{{ partText(part) }}</span><input v-else-if="part.export === '.Input'" :id="inputId" :aria-label="inputPart?.props?.['aria-label'] as string | undefined" :disabled="props.disabled || undefined" :required="inputGroupProps.required as boolean | undefined" :value="inputValue" @input="trackInput" /><button v-else-if="part.export === '.Button'" type="button" :data-variant="part.props?.variant">{{ partText(part) }}</button><span v-else-if="part.export === '.Suffix'" data-slot="input-group-suffix">{{ partText(part) }}</span></template></template><slot v-else /></label>`
  };
}
function datePickerBinding(model, library) {
  const capability = library.dateRange?.observableImplementation?.datePicker;
  if (capability?.support !== 'supported' || model.component !== 'date-picker') return null;
  return capability;
}
 function datePickerSource() {
   return {
     options:`defineOptions({ inheritAttrs: false })\n`,
     imports:'computed, getCurrentInstance, ref, useAttrs, useSlots',
     setup:`type CalendarDay = { iso: string; day: number; inMonth: boolean; monthStr: string; isToday: boolean; className: string; label: string }
const instance = getCurrentInstance()
const controlled = computed(() => Object.prototype.hasOwnProperty.call(instance?.vnode.props ?? {}, 'selectedDate'))
const internalSelectedDate = ref(props.selectedDate)
const selectedDate = computed(() => controlled.value ? props.selectedDate : internalSelectedDate.value)
const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
const weekdayList = [{ short: 'Su', full: 'Sunday' },{ short: 'Mo', full: 'Monday' },{ short: 'Tu', full: 'Tuesday' },{ short: 'We', full: 'Wednesday' },{ short: 'Th', full: 'Thursday' },{ short: 'Fr', full: 'Friday' },{ short: 'Sa', full: 'Saturday' }]
const weekdays = weekdayList
const todayIso = (() => { const t = new Date(); return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0') })()
const padDatePart = (value: number) => String(value).padStart(2, '0')
const isoDate = (date: Date) => \`${'${String(date.getUTCFullYear()).padStart(4, \'0\')}-${padDatePart(date.getUTCMonth() + 1)}-${padDatePart(date.getUTCDate())}'}\`
const parseDate = (value: unknown, fallback: string) => {
  const match = typeof value === 'string' && /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(value)
  if (!match) return new Date(fallback + 'T00:00:00.000Z')
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
  return Number.isNaN(date.getTime()) ? new Date(fallback + 'T00:00:00.000Z') : date
}
const initialMonth = parseDate(props.defaultMonthDate, '2025-01-01')
const monthDate = ref(new Date(Date.UTC(initialMonth.getUTCFullYear(), initialMonth.getUTCMonth(), 1)))
const caption = computed(() => monthNames[monthDate.value.getUTCMonth()] + ' ' + monthDate.value.getUTCFullYear())
const calendarDays = computed<CalendarDay[]>(() => {
  const first = monthDate.value
  const displayMonth = first.getUTCMonth()
  const start = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), 1 - first.getUTCDay()))
  const daysInMonth = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate()
  const count = Math.ceil((first.getUTCDay() + daysInMonth) / 7) * 7
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(start.getTime() + index * 86400000)
    const iso = isoDate(date)
    const inMonth = date.getUTCMonth() === displayMonth
    const isToday = iso === todayIso
    const className = 'rdp-day' + (inMonth ? '' : ' rdp-outside') + (isToday ? ' rdp-today' : '')
    const label = (isToday ? 'Today, ' : '') + weekdayList[date.getUTCDay()].full + ', ' + monthNames[date.getUTCMonth()] + ' ' + date.getUTCDate() + ', ' + date.getUTCFullYear()
    return { iso, day: date.getUTCDate(), inMonth, monthStr: iso.slice(0, 7), isToday, className, label }
  })
})
const calendarRows = computed(() => Array.from({ length: calendarDays.value.length / 7 }, (_, row) => calendarDays.value.slice(row * 7, row * 7 + 7)))
function isDisabled(iso: string) { return Boolean((props.disabledBeforeDate && iso < props.disabledBeforeDate) || (props.disabledAfterDate && iso > props.disabledAfterDate)) }
function changeMonth(offset: number) { monthDate.value = new Date(Date.UTC(monthDate.value.getUTCFullYear(), monthDate.value.getUTCMonth() + offset, 1)) }
function selectDay(iso: string) {
  if (isDisabled(iso)) return
  if (!controlled.value) internalSelectedDate.value = iso
  props.onChange?.(iso)
}
`,
     template:`<div class="rdp-root select-none rounded-xl bg-kumo-base"><div class="rdp-months"><nav data-animated-nav="true" class="rdp-nav" aria-label="Navigation bar"><button type="button" class="rdp-button_previous" aria-label="Go to the Previous Month" @click="changeMonth(-1)"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" class="rdp-chevron"><path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"></path></svg></button><button type="button" class="rdp-button_next" aria-label="Go to the Next Month" @click="changeMonth(1)"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" class="rdp-chevron"><path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path></svg></button></nav><div data-animated-month="true" class="rdp-month"><div data-animated-caption="true" class="rdp-month_caption"><span class="rdp-caption_label" role="status" aria-live="polite">{{ caption }}</span></div><table role="grid" aria-multiselectable="false" :aria-label="caption" class="rdp-month_grid"><thead aria-hidden="true"><tr data-animated-weekdays="true" class="rdp-weekdays"><th v-for="weekday in weekdays" :key="weekday.short" :aria-label="weekday.full" class="rdp-weekday" scope="col">{{ weekday.short }}</th></tr></thead><tbody data-animated-weeks="true" class="rdp-weeks"><tr v-for="(row, rowIndex) in calendarRows" :key="rowIndex" class="rdp-week"><td v-for="day in row" :key="day.iso" :class="day.className" role="gridcell" :aria-label="day.label" :data-day="day.iso" :data-month="day.inMonth ? undefined : day.monthStr" :data-outside="day.inMonth ? undefined : 'true'" :data-today="day.isToday ? 'true' : undefined" @click="selectDay(day.iso)">{{ day.day }}</td></tr></tbody></table></div></div></div>`
   };
 }
function dateRangePickerBinding(model, library) {
  const capability = library.dateRange?.observableImplementation?.dateRangePicker;
  if (capability?.support !== 'supported' || model.component !== 'date-range-picker') return null;
  return capability;
}
function dateRangePickerSource(capability) {
  if (capability.navigationButtons !== 2 || capability.calendarButtons !== 84 || capability.resetButtons !== 1 || capability.totalButtons !== 87) throw new Error('unsupported date-range-picker button contract');
  return {
    options:`defineOptions({ inheritAttrs: false })\n`,
    imports:'computed, nextTick, ref, useAttrs, useSlots',
     setup:`type RangeDay = { iso: string; day: number; inMonth: boolean; className: string; label: string; id: string }
type RangeMonth = { key: string; label: string; days: RangeDay[] }
const rangeRoot = ref<HTMLElement | null>(null)
const startValue = ref<string | null>(null)
const endValue = ref<string | null>(null)
const rangeToday = new Date()
const monthCursor = ref(new Date(Date.UTC(rangeToday.getFullYear(), rangeToday.getMonth(), 1)))
const pad = (value: number) => String(value).padStart(2, '0')
const iso = (date: Date) => \`\${date.getUTCFullYear()}-\${pad(date.getUTCMonth() + 1)}-\${pad(date.getUTCDate())}\`
const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
const monthAbbr = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const weekdayFull = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const weekdayAbbr = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const weekdayShort = ['Su','Mo','Tu','We','Th','Fr','Sa']
const rangeTimezone = 'New York, NY, USA (GMT-4)'
const dayInClass = 'h-[26px] w-7 text-sm cursor-pointer text-center transition-all duration-[50] leading-[26px] hover:bg-kumo-interact bg-transparent text-kumo-default'
const dayOutClass = 'h-[26px] w-7 text-sm cursor-pointer text-center text-kumo-default transition-all duration-[50] leading-[26px] bg-transparent !text-kumo-subtle'
function buildMonth(base: Date): RangeMonth {
  const year = base.getUTCFullYear(), month = base.getUTCMonth()
  const first = new Date(Date.UTC(year, month, 1)), start = new Date(first)
  start.setUTCDate(1 - first.getUTCDay())
  const days = Array.from({length:42}, (_, index) => { const date = new Date(start); date.setUTCDate(start.getUTCDate() + index); const inMonth = date.getUTCMonth() === month; const wd = date.getUTCDay(); return {iso:iso(date),day:date.getUTCDate(),inMonth,className: inMonth ? dayInClass : dayOutClass,label: weekdayFull[wd] + ', ' + monthNames[date.getUTCMonth()] + ' ' + date.getUTCDate() + ', ' + date.getUTCFullYear(),id: weekdayAbbr[wd] + ' ' + monthAbbr[date.getUTCMonth()] + ' ' + pad(date.getUTCDate()) + ' ' + date.getUTCFullYear()} })
  return {key:\`\${year}-\${month}\`,label:\`\${monthNames[month]} \${year}\`,days}
}
const monthPanels = computed(() => [0,1].map(offset => { const date = new Date(monthCursor.value); date.setUTCMonth(date.getUTCMonth() + offset); return buildMonth(date) }))
function changeMonth(delta: number) { const date = new Date(monthCursor.value); date.setUTCMonth(date.getUTCMonth() + delta); monthCursor.value = date }
function isInRange(value: string) { return Boolean(startValue.value && endValue.value && value >= startValue.value && value <= endValue.value) }
function selectDay(value: string) {
  if (startValue.value === null || endValue.value !== null || value < startValue.value) {
    startValue.value = value
    endValue.value = null
    props.onStartChange?.(value)
    props.onStartDateChange?.(value)
    return
  }
  endValue.value = value
  props.onEndChange?.(value)
  props.onEndDateChange?.(value)
}
function resetRange() {
  startValue.value = null
  endValue.value = null
  props.onStartChange?.(null)
  props.onStartDateChange?.(null)
  props.onEndChange?.(null)
  props.onEndDateChange?.(null)
  nextTick(() => { if (rangeRoot.value) { rangeRoot.value.setAttribute('tabindex', '-1'); rangeRoot.value.focus() } })
}
`,
     template:`<div ref="rangeRoot" class="flex w-fit flex-col rounded-xl select-none bg-kumo-overlay p-4 gap-2.5"><div class="flex gap-4"><div v-for="(month, monthIndex) in monthPanels" :key="month.key" class="relative w-[196px]"><button v-if="monthIndex === 0" type="button" aria-label="Previous month" class="absolute top-0 left-0 cursor-pointer rounded bg-kumo-interact/85 p-1.5 hover:bg-kumo-interact" @click="changeMonth(-1)"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"></path></svg></button><button v-else type="button" aria-label="Next month" class="absolute top-0 right-0 cursor-pointer rounded bg-kumo-interact/85 p-1.5 hover:bg-kumo-interact" @click="changeMonth(1)"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path></svg></button><div><div class="mb-3 text-center"><input aria-label="Edit month and year" class="w-full rounded-md border-none bg-transparent py-1.5 text-center font-semibold text-kumo-default transition-all duration-200 focus:outline-none focus:ring-kumo-focus/50 focus:ring-[1.5px] text-sm" :value="month.label" /></div><div class="mt-2 grid grid-cols-7 gap-1"><div v-for="weekday in weekdayShort" :key="weekday" class="h-[22px] text-center text-kumo-subtle w-7 text-sm">{{ weekday }}</div></div></div><div class="grid grid-cols-7 gap-0 gap-y-0.5"><button v-for="day in month.days" :key="day.iso" type="button" :aria-label="day.label" :id="day.id" :class="day.className" @click="selectDay(day.iso)">{{ day.day }}</button></div></div></div><div class="flex items-center gap-2 text-kumo-subtle text-sm"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm88,104a87.62,87.62,0,0,1-6.4,32.94l-44.7-27.49a15.92,15.92,0,0,0-6.24-2.23l-22.82-3.08a16.11,16.11,0,0,0-16,7.86h-8.72l-3.8-7.86a15.91,15.91,0,0,0-11-8.67l-8-1.73L96.14,104h16.71a16.06,16.06,0,0,0,7.73-2l12.25-6.76a16.62,16.62,0,0,0,3-2.14l26.91-24.34A15.93,15.93,0,0,0,166,49.1l-.36-.65A88.11,88.11,0,0,1,216,128ZM143.31,41.34,152,56.9,125.09,81.24,112.85,88H96.14a16,16,0,0,0-13.88,8l-8.73,15.23L63.38,84.19,74.32,58.32a87.87,87.87,0,0,1,69-17ZM40,128a87.53,87.53,0,0,1,8.54-37.8l11.34,30.27a16,16,0,0,0,11.62,10l21.43,4.61L96.74,143a16.09,16.09,0,0,0,14.4,9h1.48l-7.23,16.23a16,16,0,0,0,2.86,17.37l.14.14L128,205.94l-1.94,10A88.11,88.11,0,0,1,40,128Zm102.58,86.78,1.13-5.81a16.09,16.09,0,0,0-4-13.9,1.85,1.85,0,0,1-.14-.14L120,174.74,133.7,144l22.82,3.08,45.72,28.12A88.18,88.18,0,0,1,142.58,214.78Z"></path></svg><span class="flex-1">Timezone: {{ rangeTimezone }}</span><button type="button" class="cursor-pointer font-semibold text-kumo-default underline underline-offset-2" @click="resetRange">Reset Dates</button></div></div>`
  };
}
function responsiveSidebarBinding(model, library) {
  const capability = library.responsiveSidebar?.observableImplementation;
  if (capability?.support !== 'supported' || model.component !== library.responsiveSidebar.component) return null;
  return capability;
}
function responsiveSidebarSource(capability) {
  if (capability.expanded?.buttons !== 3 || capability.expanded?.menuItems !== 2 || capability.resize?.width !== 480) throw new Error('unsupported responsive-sidebar observable contract');
  return {
    options:`defineOptions({ inheritAttrs: false })\n`,
    imports:'computed, nextTick, ref, useAttrs, useSlots',
    setup:`type SidebarFixtureNode = { export?: string; text?: string; props?: Record<string, unknown>; children?: SidebarFixtureNode[] }
const sidebarFixture = computed(() => props.fixture as SidebarFixtureNode | undefined)
const fixtureChildren = (node?: SidebarFixtureNode) => node?.children ?? []
const part = (node: SidebarFixtureNode | undefined, name: string) => fixtureChildren(node).find(child => child.export === name)
const partText = (node?: SidebarFixtureNode): string => node ? String(node.text ?? '') + fixtureChildren(node).map(partText).join('') : ''
const providerProps = computed(() => sidebarFixture.value?.props ?? {})
const sidebarRoot = computed(() => part(sidebarFixture.value, 'root'))
const header = computed(() => part(sidebarRoot.value, '.Header'))
const content = computed(() => part(sidebarRoot.value, '.Content'))
const group = computed(() => part(content.value, '.Group'))
const menu = computed(() => part(group.value, '.Menu'))
const menuButtons = computed(() => fixtureChildren(menu.value).filter(node => node.export === '.MenuButton'))
const collapsible = computed(() => part(sidebarRoot.value, '.Collapsible'))
const resizeHandle = computed(() => part(sidebarRoot.value, '.ResizeHandle'))
const open = ref(providerProps.value.defaultOpen !== false)
const width = ref(Number(providerProps.value.defaultWidth ?? 256))
const state = computed(() => open.value ? 'expanded' : 'collapsed')
const resizeRef = ref<HTMLButtonElement | null>(null)
function toggleSidebar() { open.value = !open.value; props.onOpenChange?.(open.value) }
function resizeKey(event: KeyboardEvent) {
  if (event.key !== 'End') return
  event.preventDefault()
  open.value = true
  width.value = Number(providerProps.value.maxWidth ?? ${capability.resize.width})
  props.onOpenChange?.(true)
  props.onWidthChange?.(width.value)
  nextTick(() => resizeRef.value?.focus())
}
`,
    template:`<div v-bind="$attrs" data-sidebar-wrapper="" :data-state="state" data-side="left" :style="{ '--sidebar-width': width + 'px', width: width + 'px' }"><aside :data-state="state" data-side="left" data-collapsible="icon"><template v-if="collapsible"></template><template v-else><header v-if="header">{{ partText(header) }}</header><div v-if="content"><div v-if="group"><span>{{ partText(part(group, '.GroupLabel')) }}</span><ul v-if="menu"><li v-for="(item, index) in menuButtons" :key="index"><button type="button">{{ partText(item) }}</button></li></ul></div></div><footer v-if="part(sidebarRoot, '.Footer')"><button type="button" :aria-expanded="open" :aria-label="open ? 'Collapse sidebar' : 'Expand sidebar'" @click="toggleSidebar">{{ open ? 'Collapse sidebar' : 'Expand sidebar' }}</button></footer><button v-if="resizeHandle" ref="resizeRef" type="button" aria-label="Resize sidebar" @keydown="resizeKey"></button></template></aside></div>`
  };
}
function selectBinding(model, library) {
  const capability = library.collectionListbox?.observableImplementation?.select;
  if (capability?.support !== 'supported' || model.component !== 'select') return null;
  return capability;
}
// Real Kumo Select trigger classes + chevron icon copied VERBATIM from @cloudflare/kumo
// 2.6.0 (React canonical). React renders a `grid gap-2` root wrapping a role=combobox
// trigger <button> that carries a truncating value <span> + an aria-hidden chevron
// <span><svg><path>, followed by a visually-hidden native <input> mirroring the value.
// The prior vue fallback emitted a bare, class-less empty <button>, which the cascade
// flagged on A (missing spans/svg/input) and B/pixel (no geometry). This lane owns only
// the vue emitter, so the faithful trigger structure + class strings live here.
const VUE_SELECT_ROOT_CLASS = 'grid gap-2';
const VUE_SELECT_TRIGGER_CLASS = 'group flex w-max shrink-0 items-center select-none border-0 shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand cursor-pointer disabled:cursor-not-allowed disabled:text-kumo-subtle h-9 gap-1.5 rounded-lg px-3 text-base bg-kumo-base !text-kumo-default ring not-disabled:hover:bg-kumo-tint disabled:bg-kumo-base/50 disabled:!text-kumo-default/70 ring-kumo-line data-[state=open]:bg-kumo-base justify-between font-normal focus:opacity-100 focus:ring-kumo-focus/50 focus-visible:ring-inset *:in-focus:opacity-100';
const VUE_SELECT_VALUE_CLASS = 'min-w-0 truncate data-[placeholder]:text-kumo-placeholder';
const VUE_SELECT_CHEVRON_SPAN_CLASS = 'flex shrink-0 items-center text-kumo-subtle';
const VUE_SELECT_CHEVRON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" class="fill-current"><path d="M181.66,170.34a8,8,0,0,1,0,11.32l-48,48a8,8,0,0,1-11.32,0l-48-48a8,8,0,0,1,11.32-11.32L128,212.69l42.34-42.35A8,8,0,0,1,181.66,170.34Zm-96-84.68L128,43.31l42.34,42.35a8,8,0,0,0,11.32-11.32l-48-48a8,8,0,0,0-11.32,0l-48,48A8,8,0,0,0,85.66,85.66Z"></path></svg>';
function selectSource() {
  return {
    options:`defineOptions({ inheritAttrs: false })\n`,
    imports:'computed, getCurrentInstance, nextTick, onMounted, ref, useAttrs, useSlots',
    setup:`type SelectFixtureNode = { export?: string; text?: string; props?: Record<string, any>; children?: SelectFixtureNode[] }
type SelectOption = { value: any; label: string; disabled: boolean }
const instance = getCurrentInstance()
const supplied = (name: string) => Object.prototype.hasOwnProperty.call(instance?.vnode.props ?? {}, name)
const fixtureRoot = computed(() => props.fixture as SelectFixtureNode | undefined)
const fixtureTextContent = (node?: SelectFixtureNode): string => node ? String(node.text ?? '') + (node.children ?? []).map(fixtureTextContent).join('') : ''
const selectOptions = computed<SelectOption[]>(() => (fixtureRoot.value?.children ?? []).filter(node => node.export === '.Option').map(node => ({ value: node.props?.value, label: fixtureTextContent(node), disabled: node.props?.disabled === true })))
const multiple = computed(() => Boolean((props as any).multiple))
const valueControlled = supplied('value')
const openControlled = supplied('open')
const internalValue = ref<any>(supplied('defaultValue') ? (props as any).defaultValue : (multiple.value ? [] : null))
const internalOpen = ref(supplied('defaultOpen') ? Boolean((props as any).defaultOpen) : false)
const selectedValue = computed(() => valueControlled ? (props as any).value : internalValue.value)
const selectOpen = computed(() => openControlled ? Boolean((props as any).open) : internalOpen.value)
const triggerRef = ref<HTMLButtonElement | null>(null)
const mounted = ref(false)
onMounted(() => { mounted.value = true })
const optionRefs = ref<HTMLElement[]>([])
const activeIndex = ref(-1)
const highlightScrolled = ref(false)
const selectLabel = computed(() => (props as any).ariaLabel ?? (props as any)['aria-label'])
const selectHasValue = computed(() => multiple.value ? (Array.isArray(selectedValue.value) && selectedValue.value.length > 0) : (selectedValue.value != null && selectedValue.value !== ''))
const selectDisplay = computed(() => { const found = selectOptions.value.find(item => isSelected(item.value)); if (found) return found.label; if (!multiple.value && selectedValue.value != null && selectedValue.value !== '') return String(selectedValue.value); return (props as any).placeholder ?? '' })
const equalValue = (a: any, b: any) => a === b || JSON.stringify(a) === JSON.stringify(b)
const isSelected = (value: any) => multiple.value ? (Array.isArray(selectedValue.value) && selectedValue.value.some(item => equalValue(item, value))) : equalValue(selectedValue.value, value)
function emitOpen(next: boolean) { if (!openControlled) internalOpen.value = next; (props as any).onOpenChange?.(next) }
function focusOption(index: number) {
  activeIndex.value = index
  nextTick(() => { const element = optionRefs.value[index]; element?.focus(); if (element) { element.scrollIntoView?.({ block: 'nearest' }); highlightScrolled.value = true } })
}
function firstEnabled() { return selectOptions.value.findIndex(item => !item.disabled) }
function lastEnabled() { for (let i = selectOptions.value.length - 1; i >= 0; i--) if (!selectOptions.value[i].disabled) return i; return -1 }
function openSelect() { if (selectOpen.value) return; emitOpen(true); const index = firstEnabled(); if (index >= 0) focusOption(index) }
function triggerKey(event: KeyboardEvent) { if (event.key === 'ArrowDown') { event.preventDefault(); openSelect(); if (selectOpen.value) { const index = firstEnabled(); if (index >= 0) focusOption(index) } } }
function selectItem(item: SelectOption, index: number) {
  if (item.disabled) return
  if (multiple.value) {
    const current = Array.isArray(selectedValue.value) ? selectedValue.value : []
    const next = current.some(value => equalValue(value, item.value)) ? current : [...current, item.value]
    if (!valueControlled) internalValue.value = next
    ;(props as any).onValueChange?.(next)
    focusOption(index)
    return
  }
  if (!valueControlled) internalValue.value = item.value
  ;(props as any).onValueChange?.(item.value)
  emitOpen(false)
  if (openControlled) focusOption(index)
  else nextTick(() => triggerRef.value?.focus())
}
function optionKey(event: KeyboardEvent) {
  let index = -1
  if (event.key === 'Home') index = firstEnabled()
  else if (event.key === 'End') index = lastEnabled()
  else if (event.key.length === 1) index = selectOptions.value.findIndex(item => !item.disabled && item.label.toLocaleLowerCase().startsWith(event.key.toLocaleLowerCase()))
  else if (event.key === 'Escape') { event.preventDefault(); emitOpen(false); nextTick(() => triggerRef.value?.focus()); return }
  else if (event.key === 'Tab') { event.preventDefault(); emitOpen(false); nextTick(() => triggerRef.value?.focus()); return }
  else return
  if (index >= 0) { event.preventDefault(); focusOption(index) }
}
`,
    template:`<div class="${esc(VUE_SELECT_ROOT_CLASS)}"><button ref="triggerRef" type="button" tabindex="0" role="combobox" :aria-expanded="String(selectOpen)" aria-haspopup="listbox" :aria-label="selectLabel ?? (props as any).placeholder" data-kumo-component="Select" data-kumo-part="trigger" class="${esc(VUE_SELECT_TRIGGER_CLASS)}" :data-state="selectOpen ? 'open' : undefined" @click="openSelect" @keydown="triggerKey"><span class="${esc(VUE_SELECT_VALUE_CLASS)}" :data-placeholder="selectHasValue ? undefined : ''">{{ selectDisplay }}</span><span aria-hidden="true" class="${esc(VUE_SELECT_CHEVRON_SPAN_CLASS)}">${VUE_SELECT_CHEVRON_SVG}</span></button><input style="${esc(KUMO_CHECKBOX_HIDDEN_INPUT_STYLE)}" tabindex="-1" aria-hidden="true" :value="selectHasValue ? (typeof selectedValue === 'object' ? JSON.stringify(selectedValue) : String(selectedValue)) : ''" /><Teleport v-if="mounted && selectOpen" to="body"><div role="listbox" :aria-multiselectable="multiple || undefined" :data-highlight-scrolled="highlightScrolled || undefined"><div v-for="(item, index) in selectOptions" :key="index" :ref="element => { if (element) optionRefs[index] = element as HTMLElement }" role="option" tabindex="-1" :aria-selected="isSelected(item.value)" :aria-disabled="item.disabled || undefined" :data-value="typeof item.value === 'object' ? item.value?.id : item.value" :data-highlighted="activeIndex === index || undefined" :data-selected="isSelected(item.value) || undefined" @click="selectItem(item, index)" @keydown="optionKey">{{ item.label }}</div></div></Teleport></div>`
  };
}
function toastLifecycleBinding(model, library) {
  const capability = library.toastLifecycle;
  if (capability?.observableImplementation?.support !== 'supported' || model.component !== capability.component) return null;
  return capability.observableImplementation;
}
const VUE_TOAST_TYPES = `export type KumoToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info'
export interface KumoToastAction { label: string; disabled?: boolean; onClick?: (event: MouseEvent) => void }
export interface KumoToastOptions { id?: string; title?: string | number | null; description?: string | number | null; timeout?: number; priority?: 'low' | 'high'; variant?: KumoToastVariant; actions?: readonly KumoToastAction[]; onClose?: () => void; onRemove?: () => void }
export type KumoToast = Omit<KumoToastOptions, 'id'> & { id: string }
export interface KumoToastManager { readonly toasts: readonly KumoToast[]; add(options: KumoToastOptions): string; close(id?: string): void; subscribe(listener: (toasts: readonly KumoToast[]) => void): () => void }
`;
const VUE_TOAST_MANAGER_SOURCE = `export const KUMO_TOAST_MANAGER_KEY: InjectionKey<KumoToastManager> = Symbol('kumo-toast-manager')

export function createKumoToastManager(): KumoToastManager {
  let nextId = 1
  let current: KumoToast[] = []
  const listeners = new Set<(toasts: readonly KumoToast[]) => void>()
  const timers = new Map<string, ReturnType<typeof setTimeout>>()
  const snapshot = () => current.slice()
  const publish = () => { const value = snapshot(); for (const listener of listeners) listener(value) }
  const clearTimer = (id: string) => { const timer = timers.get(id); if (timer !== undefined) clearTimeout(timer); timers.delete(id) }
  const manager: KumoToastManager = {
    get toasts() { return snapshot() },
    add(options) {
      const id = options.id ?? 'kumo-toast-' + nextId++
      const index = current.findIndex(toast => toast.id === id)
      const toast = { ...(index >= 0 ? current[index] : {}), ...options, id } as KumoToast
      current = index >= 0 ? current.map((item, itemIndex) => itemIndex === index ? toast : item) : [...current, toast]
      clearTimer(id)
      const timeout = toast.timeout ?? 5000
      if (timeout !== 0) {
        const timer = setTimeout(() => manager.close(id), Math.max(0, timeout))
        ;(timer as ReturnType<typeof setTimeout> & { unref?: () => void }).unref?.()
        timers.set(id, timer)
      }
      publish()
      return id
    },
    close(id) {
      const removed = id === undefined ? current : current.filter(toast => toast.id === id)
      if (removed.length === 0) return
      for (const toast of removed) { clearTimer(toast.id); toast.onClose?.() }
      const removedIds = new Set(removed.map(toast => toast.id))
      current = current.filter(toast => !removedIds.has(toast.id))
      publish()
      for (const toast of removed) toast.onRemove?.()
    },
    subscribe(listener) {
      listeners.add(listener)
      listener(snapshot())
      return () => listeners.delete(listener)
    },
  }
  return manager
}

export function useKumoToastManager(): KumoToastManager {
  const manager = inject(KUMO_TOAST_MANAGER_KEY)
  if (!manager) throw new Error('useKumoToastManager must be used within Toasty or ToastProvider')
  return manager
}

export const Toast = Object.freeze({ createToastManager: createKumoToastManager, useToastManager: useKumoToastManager })
`;
function toastLifecycleSource(capability) {
  return {
    options:`defineOptions({ inheritAttrs: false })\n`,
    imports:'computed, inject, onBeforeUnmount, provide, ref, useAttrs, useSlots',
    setup:`const providerToastManager = (props.toastManager as KumoToastManager | undefined) ?? createKumoToastManager()
provide(KUMO_TOAST_MANAGER_KEY, providerToastManager)
const managedToasts = ref<readonly KumoToast[]>(providerToastManager.toasts)
const unsubscribeToasts = providerToastManager.subscribe(value => { managedToasts.value = value })
onBeforeUnmount(() => { unsubscribeToasts() })
function closeToast(id: string) { providerToastManager.close(id) }
`,
    template:`<template v-if="$slots.default"><slot /><Teleport v-if="managedToasts.length" to="body"><div role="region" aria-live="polite" data-kumo-component="Toasty"><div v-for="toast in managedToasts" :key="toast.id" role="status" data-kumo-component="Toast" :data-variant="toast.variant ?? variant"><strong v-if="toast.title !== undefined" data-toast-title>{{ toast.title }}</strong><span v-if="toast.description !== undefined" data-toast-description>{{ toast.description }}</span><div v-if="toast.actions?.length"><button v-for="action in toast.actions" :key="action.label" type="button" :disabled="action.disabled" data-toast-action @click="action.onClick?.($event)">{{ action.label }}</button></div><button type="button" aria-label="Close" @click="closeToast(toast.id)">Close</button></div></div></Teleport></template><button v-else type="button" data-kumo-component="Button" class="${esc(VUE_OVERLAY_BUTTON_CLASS)}">Notify</button>`
  };
}
function paginationBinding(model, library) {
  const capability = library.paginationControls;
  if (capability?.support !== 'supported' || model.component !== capability.component) return null;
  // Exercise the canonical algebra while emitting its equivalent browser-side logic.
  const maximum = maxPage(8, 2);
  clampPage(2, maximum); nextPage(2, maximum); previousPage(2, maximum); commitPageInput(2, '3', maximum);
  return capability;
}
// Real Kumo Pagination classes + chevron icons copied VERBATIM from @cloudflare/kumo
// 2.6.0 (React canonical). React renders a flex row: an aria-live pagination-info block
// ("Showing N-M of T" with tabular-nums spans) + a pagination-controls column whose <nav>
// wraps an InputGroup (data-focus-mode="individual") of four segmented Button controls
// (First/Prev/Next/Last, each a span.contents > svg > path) around the page-number <input>.
// The prior vue fallback emitted a class-less <nav> with empty buttons + no info block,
// which the cascade flagged on A (missing spans/divs/svg/path) and B/pixel (no geometry).
// This lane owns only the vue emitter, so the faithful structure + class strings live here.
const VUE_PAGINATION_GROUP_CLASS = 'relative w-full cursor-text border-0 bg-kumo-control text-kumo-default ring-kumo-line outline-none focus:outline-none kumo-input-placeholder disabled:text-kumo-disabled h-9 rounded-lg text-base focus:ring-kumo-focus/50 focus:ring-[1.5px] data-[disabled]:pointer-events-none data-[disabled]:opacity-50 isolate overflow-visible ring-0 shadow-none has-[input[aria-invalid=true]]:ring-kumo-danger px-0 flex items-center gap-0 has-[[data-slot=input-group-suffix]]:[&_input]:[field-sizing:content] has-[[data-slot=input-group-suffix]]:[&_input]:max-w-full has-[[data-slot=input-group-suffix]]:[&_input]:grow-0 has-[[data-slot=input-group-suffix]]:[&_input]:pr-0 has-[[data-slot=input-group-addon-start]]:[&_input]:pl-2 has-[[data-slot=input-group-addon-end]]:[&_input]:pr-2 !mb-0';
const VUE_PAGINATION_BUTTON_CLASS = 'group flex w-max shrink-0 items-center font-medium select-none shadow-xs focus:outline-none focus:ring-kumo-focus/50 focus-visible:ring-kumo-brand cursor-pointer disabled:cursor-not-allowed disabled:text-kumo-subtle h-9 gap-1.5 px-3 text-base bg-kumo-base !text-kumo-default not-disabled:hover:bg-kumo-tint ring-kumo-line data-[state=open]:bg-kumo-base pointer-events-auto focus:ring-0 relative h-full! rounded-none ring-0 focus-visible:ring-0 border border-kumo-line first:rounded-l-[inherit] last:rounded-r-[inherit] not-first:-ml-px hover:z-1 focus:z-2 focus-visible:border-kumo-focus/50 disabled:bg-kumo-overlay disabled:text-kumo-inactive!';
const VUE_PAGINATION_INPUT_CLASS = 'text-kumo-default ring-kumo-line outline-none focus:outline-none kumo-input-placeholder disabled:text-kumo-disabled gap-1.5 text-base focus:ring-kumo-focus/50 flex h-full min-w-0 grow items-center rounded-none bg-transparent font-sans px-3 text-ellipsis relative ring-0 focus:ring-0 border border-kumo-line first:rounded-l-[inherit] last:rounded-r-[inherit] not-first:-ml-px hover:z-1 hover:border-kumo-line focus:z-2 focus:border-kumo-focus/50 text-center';
const VUE_PAGINATION_ICON = d => `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="${d}"></path></svg>`;
const VUE_PAGINATION_FIRST_SVG = VUE_PAGINATION_ICON('M205.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L131.31,128ZM51.31,128l74.35-74.34a8,8,0,0,0-11.32-11.32l-80,80a8,8,0,0,0,0,11.32l80,80a8,8,0,0,0,11.32-11.32Z');
const VUE_PAGINATION_PREV_SVG = VUE_PAGINATION_ICON('M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z');
const VUE_PAGINATION_NEXT_SVG = VUE_PAGINATION_ICON('M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z');
const VUE_PAGINATION_LAST_SVG = VUE_PAGINATION_ICON('M141.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L124.69,128,50.34,53.66A8,8,0,0,1,61.66,42.34l80,80A8,8,0,0,1,141.66,133.66Zm80-11.32-80-80a8,8,0,0,0-11.32,11.32L204.69,128l-74.35,74.34a8,8,0,0,0,11.32,11.32l80-80A8,8,0,0,0,221.66,122.34Z');
function paginationSource() {
  return {
    imports:'computed, onMounted, ref, useAttrs, useSlots, watch',
    setup:`const maximumPage = computed(() => Math.max(1, Math.ceil(props.totalCount / props.perPage)))
const currentPage = ref(1)
const editingPage = ref('1')
const navRef = ref<HTMLElement | null>(null)
const disabledPage = computed(() => Math.min(maximumPage.value, Math.max(1, props.page)))
const infoStart = computed(() => (Math.max(1, props.page) - 1) * props.perPage + 1)
const infoEnd = computed(() => Math.min(Math.max(1, props.page) * props.perPage, props.totalCount))
const infoTotal = computed(() => props.totalCount)
onMounted(() => { currentPage.value = Math.min(maximumPage.value, Math.max(1, props.page)); editingPage.value = String(currentPage.value) })
watch(() => props.page, value => { currentPage.value = Math.min(maximumPage.value, Math.max(1, value)); editingPage.value = String(currentPage.value) })
function proposePage(target: number) {
  const proposal = Math.min(maximumPage.value, Math.max(1, target))
  if (proposal !== currentPage.value) props.setPage?.(proposal)
}
function commitInput(trigger: 'Enter' | 'blur') {
  const text = editingPage.value.trim()
  const restore = () => { editingPage.value = String(currentPage.value) }
  const focusNav = () => { if (trigger === 'blur' && navRef.value) { navRef.value.setAttribute('tabindex', '-1'); navRef.value.focus() } }
  if (!/^[0-9]+$/.test(text)) { restore(); focusNav(); return }
  const parsed = Number(text)
  if (!Number.isSafeInteger(parsed)) { restore(); focusNav(); return }
  const proposal = Math.min(maximumPage.value, Math.max(1, parsed))
  editingPage.value = String(proposal)
  if (proposal !== currentPage.value) props.setPage?.(proposal)
  focusNav()
}
function enterInput(event: KeyboardEvent) { if (event.key === 'Enter') commitInput('Enter') }
`,
    template:`<div data-slot="pagination" class="flex items-center gap-2 w-full"><div aria-live="polite" aria-atomic="true" data-slot="pagination-info" class="grow text-sm text-kumo-subtle">Showing <span class="tabular-nums">{{ infoStart }}-{{ infoEnd }}</span> of <span class="tabular-nums">{{ infoTotal }}</span></div><div data-slot="pagination-controls" class="grow flex flex-col items-end"><nav ref="navRef" :aria-label="props.labels?.navigation ?? 'Pagination'"><div data-slot="input-group" data-focus-mode="individual" class="${esc(VUE_PAGINATION_GROUP_CLASS)}"><button data-kumo-component="Button" class="${esc(VUE_PAGINATION_BUTTON_CLASS)}" type="button" aria-label="First page" :disabled="disabledPage === 1 || undefined" @click="proposePage(1)"><span class="contents">${VUE_PAGINATION_FIRST_SVG}</span></button><button data-kumo-component="Button" class="${esc(VUE_PAGINATION_BUTTON_CLASS)}" type="button" aria-label="Previous page" :disabled="disabledPage === 1 || undefined" @click="proposePage(currentPage - 1)"><span class="contents">${VUE_PAGINATION_PREV_SVG}</span></button><input aria-label="Page number" autocomplete="off" class="${esc(VUE_PAGINATION_INPUT_CLASS)}" style="width:50px" :value="editingPage" @input="editingPage = ($event.currentTarget as HTMLInputElement).value" @keydown="enterInput" @blur="commitInput('blur')" /><button data-kumo-component="Button" class="${esc(VUE_PAGINATION_BUTTON_CLASS)}" type="button" aria-label="Next page" :disabled="disabledPage === maximumPage || undefined" @click="proposePage(currentPage + 1)"><span class="contents">${VUE_PAGINATION_NEXT_SVG}</span></button><button data-kumo-component="Button" class="${esc(VUE_PAGINATION_BUTTON_CLASS)}" type="button" aria-label="Last page" :disabled="disabledPage === maximumPage || undefined" @click="proposePage(maximumPage)"><span class="contents">${VUE_PAGINATION_LAST_SVG}</span></button></div></nav></div></div>`
  };
}
function tableOfContentsSource() {
  return {
    imports:'computed, useAttrs, useSlots',
    setup:`type TocNode = { export?: string; text?: string; props?: Record<string, any>; children?: TocNode[] }
const tocRoot = computed(() => props.fixture as TocNode | undefined)
const tocChildren = (node?: TocNode) => node?.children ?? []
const tocText = (node?: TocNode): string => node ? String(node.text ?? '') + tocChildren(node).map(tocText).join('') : ''
const tocTitle = computed(() => tocText(tocChildren(tocRoot.value).find(node => node.export === '.Title')))
const tocList = computed(() => tocChildren(tocRoot.value).find(node => node.export === '.List'))
const tocItems = computed(() => tocChildren(tocList.value).flatMap(node => node.export === '.Group' ? [node, ...tocChildren(node)] : [node]).filter(node => node.export === '.Item' || node.export === '.Group').map(node => ({href:String(node.props?.href ?? '#'),active:Boolean(node.props?.active),label:String(node.props?.label ?? tocText(node)),group:node.export === '.Group'})))
`,
    template:`<nav :aria-label="String((tocRoot?.props as any)?.['aria-label'] ?? 'Table of contents')"><p v-if="tocTitle">{{ tocTitle }}</p><ul v-if="tocItems.length"><template v-for="item in tocItems" :key="item.href"><a v-if="item.group" :href="item.href" :aria-current="item.active ? 'location' : undefined">{{ item.label }}</a><li v-else><a :href="item.href" :aria-current="item.active ? 'location' : undefined">{{ item.label }}</a></li></template></ul></nav>`
  };
}
function emitComponent(model, library) {
  const implementation = validateImplementation(model.draftImplementation);
  const hasMergeTrigger = implementation.componentRoot?.tag === 'merge-trigger';
  const contentBindingDigest = requireContentBindings(model);
  const defaults = Object.fromEntries(model.props.items.filter(p => p.default != null && !(p.name === 'checked' && toggleBinding(model, library))).map(p => [p.name,p.default]));
  const variants = [...(implementation.semanticVariants ?? [])].sort((a,b)=>b.when.length-a.when.length);
  const declaredProps = new Map(model.props.items.map(p => [p.name,p]));
  const composition = fieldCompositionControl(model, library);
  const nativeInput = nativeInputBinding(model, library);
  const loweredNativeInput = nativeInput && nativeInputSource(nativeInput, composition, model);
  const clipboardCopy = clipboardCopyBinding(model, library);
  const loweredClipboardCopy = clipboardCopy && clipboardCopySource(clipboardCopy);
  const datePicker = datePickerBinding(model, library);
  const loweredDatePicker = datePicker && datePickerSource();
  const dateRangePicker = dateRangePickerBinding(model, library);
  const loweredDateRangePicker = dateRangePicker && dateRangePickerSource(dateRangePicker);
  const select = selectBinding(model, library);
  const loweredSelect = select && selectSource();
  const toastLifecycle = toastLifecycleBinding(model, library);
  const loweredToastLifecycle = toastLifecycle && toastLifecycleSource(toastLifecycle);
  const responsiveSidebar = responsiveSidebarBinding(model, library);
  const loweredResponsiveSidebar = responsiveSidebar && responsiveSidebarSource(responsiveSidebar);
  const pagination = paginationBinding(model, library);
  const loweredPagination = pagination && paginationSource();
  const menubarNavigation = menubarNavigationBinding(model, library);
  const loweredMenubarNavigation = menubarNavigation && menubarNavigationSource(menubarNavigation);
  const tabsNavigation = tabsNavigationBinding(model, library);
  const loweredTabsNavigation = tabsNavigation && tabsNavigationSource(tabsNavigation);
  const radioGroup = radioGroupBinding(model, library);
  const loweredRadioGroup = radioGroup && radioGroupSource();
  const dialogLayer = dialogLayerBinding(model, library);
  const loweredDialogLayer = dialogLayer && dialogLayerSource();
  const popoverLayer = popoverLayerBinding(model, library);
  const loweredPopoverLayer = popoverLayer && popoverLayerSource();
  const inputGroup = inputGroupBinding(model, library);
  const loweredInputGroup = inputGroup && inputGroupSource(model);
  const dropdownMenuLayer = dropdownMenuLayerBinding(model, library);
  const loweredDropdownMenuLayer = dropdownMenuLayer && dropdownMenuLayerSource(dropdownMenuLayer);
  const combobox = comboboxBinding(model, library);
  const loweredCombobox = combobox && comboboxSource();
  const autocomplete = autocompleteBinding(model, library);
  const loweredAutocomplete = autocomplete && autocompleteSource();
  const sensitiveInput = sensitiveInputBinding(model, library);
  const loweredSensitiveInput = sensitiveInput && sensitiveInputSource();
  const visualSimple = ['badge','label','link','text'].includes(model.component) ? visualContract.components[model.component] : null;
  const commandPalette = commandPaletteBinding(model, library);
  const loweredCommandPalette = commandPalette && commandPaletteSource();
  const tableOfContents = model.component === 'table-of-contents';
  const loweredTableOfContents = tableOfContents && tableOfContentsSource();
  if (toggleBinding(model, library)) declaredProps.set('defaultChecked',{name:'defaultChecked',required:false,type:'boolean'});
  if (hasMergeTrigger) declaredProps.set('asChild',{name:'asChild',required:false,type:'boolean'});
  if (datePicker) {
    declaredProps.set('ariaLabel',{name:'ariaLabel',required:false,type:'string'});
    declaredProps.set('selectedDate',{name:'selectedDate',required:false,type:'string'});
    declaredProps.set('defaultMonthDate',{name:'defaultMonthDate',required:false,type:'string'});
    declaredProps.set('disabledBeforeDate',{name:'disabledBeforeDate',required:false,type:'string'});
    declaredProps.set('disabledAfterDate',{name:'disabledAfterDate',required:false,type:'string'});
    declaredProps.set('onChange',{name:'onChange',required:false,type:'unknown'});
  }
  if (dateRangePicker) { declaredProps.set('onStartChange',{name:'onStartChange',required:false,type:'unknown'}); declaredProps.set('onEndChange',{name:'onEndChange',required:false,type:'unknown'}); }
  if (select) {
    for (const [name,type] of [['ariaLabel','string'],['placeholder','string'],['defaultValue','unknown'],['value','unknown'],['defaultOpen','boolean'],['open','boolean'],['multiple','boolean'],['onOpenChange','unknown'],['onValueChange','unknown']]) declaredProps.set(name,{name,required:false,type});
  }
  if (toastLifecycle) { declaredProps.delete('onNotify'); declaredProps.delete('onAction'); declaredProps.set('toastManager',{name:'toastManager',required:false,type:'unknown'}); declaredProps.set('variant',{name:'variant',required:false,type:'string'}); }
  if (responsiveSidebar) { declaredProps.set('onOpenChange',{name:'onOpenChange',required:false,type:'unknown'}); declaredProps.set('onWidthChange',{name:'onWidthChange',required:false,type:'unknown'}); }
  if (pagination) { declaredProps.set('fixtureMode',{name:'fixtureMode',required:false,type:'string'}); declaredProps.set('labels',{name:'labels',required:false,type:'unknown'}); declaredProps.set('setPage',{name:'setPage',required:false,type:'unknown'}); }
  if (radioGroup) { declaredProps.set('setValue',{name:'setValue',required:false,type:'unknown'}); declaredProps.set('onValueChange',{name:'onValueChange',required:false,type:'unknown'}); }
  if (combobox || autocomplete) { declaredProps.set('onOpenChange',{name:'onOpenChange',required:false,type:'unknown'}); declaredProps.set('onValueChange',{name:'onValueChange',required:false,type:'unknown'}); }
  if (dialogLayer || popoverLayer) { declaredProps.set('open',{name:'open',required:false,type:'boolean'}); declaredProps.set('onOpenChange',{name:'onOpenChange',required:false,type:'unknown'}); }
  if (dropdownMenuLayer) { declaredProps.set('open',{name:'open',required:false,type:'boolean'}); declaredProps.set('defaultOpen',{name:'defaultOpen',required:false,type:'boolean'}); declaredProps.set('onOpenChange',{name:'onOpenChange',required:false,type:'unknown'}); declaredProps.set('onSelect',{name:'onSelect',required:false,type:'unknown'}); }
  if (popoverLayer) declaredProps.set('defaultOpen',{name:'defaultOpen',required:false,type:'boolean'});
  if (tabsNavigation) declaredProps.set('onValueChange',{name:'onValueChange',required:false,type:'unknown'});
  if (menubarNavigation) { declaredProps.set('options',{name:'options',required:false,type:'unknown'}); declaredProps.set('isActive',{name:'isActive',required:false,type:'unknown'}); declaredProps.set('optionIds',{name:'optionIds',required:false,type:'boolean'}); }
  if (sensitiveInput) { declaredProps.set('onValueChange',{name:'onValueChange',required:false,type:'unknown'}); declaredProps.set('onCopy',{name:'onCopy',required:false,type:'unknown'}); }
  if (commandPalette) { declaredProps.set('onHighlightChange',{name:'onHighlightChange',required:false,type:'unknown'}); declaredProps.set('onValueChange',{name:'onValueChange',required:false,type:'unknown'}); declaredProps.set('onOpenChange',{name:'onOpenChange',required:false,type:'unknown'}); }
  for (const prop of loweredNativeInput?.props ?? []) declaredProps.set(prop.name, prop);
  if (clipboardCopy) { declaredProps.set(clipboardCopy.copySource.fallback,{name:clipboardCopy.copySource.fallback,required:false,type:'string'}); declaredProps.set(clipboardCopy.copySource.prop,{name:clipboardCopy.copySource.prop,required:false,type:'string'}); declaredProps.set('onCopy',{name:'onCopy',required:false,type:'unknown'}); }
  for (const variant of variants) for (const predicate of variant.when) if (predicate.kind === 'prop-equals' && predicate.name !== 'children' && !declaredProps.has(predicate.name)) declaredProps.set(predicate.name,{name:predicate.name,required:false,type:'unknown'});
  if (nativeInput) for (const variant of variants) for (const predicate of variant.when) if (predicate.kind === 'prop-equals' && predicate.name !== 'children' && !declaredProps.has(vuePropName(predicate.name))) declaredProps.set(vuePropName(predicate.name),{name:vuePropName(predicate.name),required:false,type:'unknown'});
  const props = [...declaredProps.values()].map(p => `  ${JSON.stringify(p.name)}${p.required && p.name !== 'children' ? '' : '?'}: ${vueType(p.type)}`).join('\n');
  // Content-keyed semantic-variant snapshots are gated behind the explicit
  // `semanticContent` escape hatch (undefined for realistic consumer mounts), mirroring
  // the svelte emitter's `__consumerContent`. Keying these predicates off the live slot
  // content (renderContent()) made vue/solid short-circuit into a lossy captured snapshot
  // — e.g. <Badge>PRO</Badge> hit an incomplete "PRO" sample and dropped the real
  // `text-kumo-badge-inverted` variant class — while svelte fell through to the faithful
  // variant expression. Gating on the escape hatch restores parity with svelte and lets
  // realistic mounts emit the real Kumo variant classes React does.
  const predicates = variants.map(v => v.when.map(x => semanticPredicate(x.kind === 'prop-equals' && x.name !== 'children' ? {...x,name:vuePropName(x.name)} : x,{props:'semanticValues',fixture:'fixture',content:'props.semanticContent',equal:'semanticEqual'})).join(' && ') || 'true');
   const meter = model.component === 'meter';
   const meterFallback = meter ? `<div class="${esc(KUMO_METER_ROOT_CLASS)}" role="meter" :aria-valuenow="props.value" :aria-valuemin="props.min ?? 0" :aria-valuemax="props.max ?? 100" :aria-valuetext="Math.round(((props.value ?? 0) - (props.min ?? 0)) / (((props.max ?? 100) - (props.min ?? 0)) || 1) * 100) + '%'"><div class="${esc(KUMO_METER_HEADER_CLASS)}"><span role="presentation" class="${esc(KUMO_METER_LABEL_CLASS)}">{{ props.label }}</span><span v-if="props.showValue !== false" aria-hidden="true" class="${esc(KUMO_METER_VALUE_CLASS)}">{{ props.customValue ?? (props.value + '%') }}</span></div><div class="${esc(KUMO_METER_TRACK_CLASS)}"><div class="${esc(KUMO_METER_FILL_CLASS)}" :style="{ 'inset-inline-start': '0', height: 'inherit', width: props.value + '%' }"></div></div><span role="presentation" style="clip-path:inset(50%);overflow:hidden;white-space:nowrap;border:0;padding:0;width:1px;height:1px;margin:-1px;position:fixed;top:0;left:0">x</span></div>` : null;
   const semantic = (select || datePicker || dateRangePicker || toastLifecycle || responsiveSidebar || nativeInput || clipboardCopy || pagination || radioGroup || tabsNavigation || menubarNavigation || dialogLayer || popoverLayer || dropdownMenuLayer || inputGroup || sensitiveInput || combobox || autocomplete || commandPalette || tableOfContents || meter) ? '' : variants.map((v,i) => `<template ${i?'v-else-if':'v-if'}="${directive(predicates[i])}">${semanticNode(v.tree)}</template>`).join('');
  const nativeButton = model.interactions?.nativeButton;
  const toggle = toggleBinding(model, library);
  const loweredToggle = toggle && toggleSource(toggle);
  const visualSimpleFallback = visualSimple ? (model.component === 'badge'
    ? `<${visualSimple.root.tag} v-bind="$attrs" :class="${directive(badgeVariantExpression('props.variant'))}"><slot /></${visualSimple.root.tag}>`
    : `<${visualSimple.root.tag} v-bind="$attrs" class="${visualSimple.root.className}"><slot /></${visualSimple.root.tag}>`) : null;
  const fallback = visualSimpleFallback ?? loweredTableOfContents?.template ?? loweredSelect?.template ?? loweredDatePicker?.template ?? loweredDateRangePicker?.template ?? loweredToastLifecycle?.template ?? loweredResponsiveSidebar?.template ?? loweredCommandPalette?.template ?? loweredAutocomplete?.template ?? loweredCombobox?.template ?? loweredSensitiveInput?.template ?? loweredInputGroup?.template ?? loweredDropdownMenuLayer?.template ?? loweredPopoverLayer?.template ?? loweredDialogLayer?.template ?? loweredMenubarNavigation?.template ?? loweredTabsNavigation?.template ?? loweredRadioGroup?.template ?? loweredPagination?.template ?? loweredClipboardCopy?.template ?? loweredToggle?.template ?? loweredNativeInput?.template ?? meterFallback ?? (nativeButton
    ? `<button v-bind="Object.assign({}, $attrs, mergeTriggerAttributes)" :class="${directive(nativeButtonVariantExpression(nativeButton, 'props.variant'))}" :style="${directive(nativeButtonEmphasisStyleExpression(nativeButton.emphasis, 'props.variant'))}" :type="($attrs.type as any) ?? 'button'" :disabled="props.disabled || props.loading"><template v-if="${directive(nativeButtonEmphasisCondition(nativeButton.emphasis, 'props.variant'))}"><span aria-hidden="true" class="${esc(nativeButton.emphasis.overlayClass)}"></span><span class="${esc(nativeButton.emphasis.wrapperClass)}"><template v-if="props.loading">${vueButtonSpinner("props.size === 'lg' ? 16 : 14")}</template><slot v-else-if="$slots.icon" name="icon" /><slot /></span></template><template v-else><template v-if="props.loading">${vueButtonSpinner("props.size === 'lg' ? 16 : 14")}</template><slot v-else-if="$slots.icon" name="icon" /><slot /></template></button>`
    : node(implementation.componentRoot));
  const composedField = composition && !composition.ownsControl
    ? `<${composition.container} class="grid gap-2 has-[input[type=checkbox]]:grid-cols-[auto_1fr] has-[input[type=checkbox]]:items-center has-[[role=switch]]:grid-cols-[auto_1fr] has-[[role=switch]]:items-center"><label :for="String((props as any).childId ?? $attrs['child-id'] ?? 'field-control')" class="${esc(KUMO_FIELD_LABEL_CLASS)}"><span class="inline-flex items-center gap-1">{{ (props as any).label ?? $attrs.label }}</span></label><slot /><p v-if="(((props as any).description ?? $attrs.description) !== undefined)" class="${esc(KUMO_FIELD_DESCRIPTION_CLASS)}">{{ (props as any).description ?? $attrs.description }}</p></${composition.container}>`
    : null;
  const template = composedField ?? (semantic ? `${semantic}<template v-else>${fallback}</template>` : fallback);
  return `<!-- @generated by src/kumo/emitters/vue/index.mjs; do not edit -->\n<script lang="ts">\n${toastLifecycle ? `import type { InjectionKey } from 'vue'\n${VUE_TOAST_TYPES}` : ''}export const modelDigest = ${JSON.stringify(model.modelDigest)}\nexport const contentBindingDigest = ${JSON.stringify(contentBindingDigest)}\n${toastLifecycle ? VUE_TOAST_MANAGER_SOURCE : ''}</script>\n\n<script setup lang="ts">\n${loweredTableOfContents?.options ?? loweredSelect?.options ?? loweredDatePicker?.options ?? loweredDateRangePicker?.options ?? loweredToastLifecycle?.options ?? loweredResponsiveSidebar?.options ?? loweredCommandPalette?.options ?? loweredAutocomplete?.options ?? loweredCombobox?.options ?? loweredSensitiveInput?.options ?? loweredInputGroup?.options ?? loweredDropdownMenuLayer?.options ?? loweredPopoverLayer?.options ?? loweredDialogLayer?.options ?? loweredMenubarNavigation?.options ?? loweredTabsNavigation?.options ?? loweredRadioGroup?.options ?? loweredToggle?.options ?? loweredNativeInput?.options ?? (nativeButton ? 'defineOptions({ inheritAttrs: false })\n' : '')}import { ${loweredTableOfContents?.imports ?? loweredSelect?.imports ?? loweredDatePicker?.imports ?? loweredDateRangePicker?.imports ?? loweredToastLifecycle?.imports ?? loweredResponsiveSidebar?.imports ?? loweredCommandPalette?.imports ?? loweredAutocomplete?.imports ?? loweredCombobox?.imports ?? loweredSensitiveInput?.imports ?? loweredInputGroup?.imports ?? loweredDropdownMenuLayer?.imports ?? loweredPopoverLayer?.imports ?? loweredDialogLayer?.imports ?? loweredMenubarNavigation?.imports ?? loweredTabsNavigation?.imports ?? loweredRadioGroup?.imports ?? loweredPagination?.imports ?? loweredClipboardCopy?.imports ?? loweredToggle?.imports ?? 'computed, useAttrs, useSlots'}${hasMergeTrigger ? ', provide' : nativeButton ? ', inject' : ''} } from 'vue'\ninterface ${model.public.symbol}Props {\n${props}\n  fixture?: unknown\n  semanticContent?: unknown\n}\nconst props = withDefaults(defineProps<${model.public.symbol}Props>(), ${JSON.stringify(defaults)})\n${hasMergeTrigger ? `provide('kumo.merge-trigger', props.asChild ? { 'data-base-ui-tooltip-trigger': '' } : undefined)\n` : nativeButton ? `const mergeTriggerAttributes = inject<Record<string, string> | undefined>('kumo.merge-trigger', undefined) ?? {}\n` : ''}${loweredTableOfContents?.setup ?? loweredSelect?.setup ?? loweredDatePicker?.setup ?? loweredDateRangePicker?.setup ?? loweredToastLifecycle?.setup ?? loweredResponsiveSidebar?.setup ?? loweredCommandPalette?.setup ?? loweredAutocomplete?.setup ?? loweredCombobox?.setup ?? loweredSensitiveInput?.setup ?? loweredInputGroup?.setup ?? loweredDropdownMenuLayer?.setup ?? loweredPopoverLayer?.setup ?? loweredDialogLayer?.setup ?? loweredMenubarNavigation?.setup ?? loweredTabsNavigation?.setup ?? loweredRadioGroup?.setup ?? loweredPagination?.setup ?? loweredClipboardCopy?.setup ?? loweredToggle?.setup ?? loweredNativeInput?.setup ?? ''}const slots = useSlots()\nconst styles: Record<string,string> = {}\nconst normalizeSlotContent = (value: any): string => Array.isArray(value) ? value.map(normalizeSlotContent).join('') : value == null || typeof value === 'boolean' ? '' : typeof value === 'string' || typeof value === 'number' ? String(value) : normalizeSlotContent(value.children)
const renderContent = () => props.semanticContent ?? normalizeSlotContent(slots.default?.())\nconst fixture = computed(() => props.fixture)\nconst semanticValues = Object.assign({}, useAttrs(), props) as Record<string, unknown>\nconst semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right)\nconst fixtureText = (value: any): string => value && typeof value === 'object' ? String(typeof value.text === 'string' ? value.text : '') + (Array.isArray(value.children) ? value.children.map(fixtureText).join('') : '') : ''\n</script>\n\n<template>\n  ${template}\n</template>\n`;
}
export function generateVueLibrary(output = path.join(root, 'generated/libraries/vue')) {
  const library = loadLibrary();
  const {models} = library;
  for (const kind of [...NODE_KINDS, ...EXPRESSION_KINDS, ...OPERATION_KINDS]) if (!kind) throw new Error('invalid algebra kind');
  fs.rmSync(output, {recursive:true, force:true}); fs.mkdirSync(path.join(output,'components'), {recursive:true});
  const entries = [];
  const compoundPaths = [];
  for (const model of models) {
    const source = emitComponent(model, library); const file = `components/${model.component}.vue`;
    fs.writeFileSync(path.join(output,file), source);
    const graph = model.composition?.compoundExports;
    const partImports = new Map();
    for (const item of graph?.paths ?? []) {
      const partName = `${model.component}.${item.path.split('.').map(segment => segment.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()).join('.')}`;
      const partFile = `components/${partName}.vue`;
      const partDeclaration = `components/${partName}.d.ts`;
      const symbol = `${id(graph.canonicalRoot)}${item.path.split('.').map(pascal).join('')}`;
      const partSource = compoundPartSource(item.path);
      fs.writeFileSync(path.join(output,partFile), partSource);
      fs.writeFileSync(path.join(output,partDeclaration), `// @generated by src/kumo/emitters/vue/index.mjs; do not edit\nimport type { DefineComponent } from 'vue';\ndeclare const component: DefineComponent<Record<string, unknown>>;\nexport default component;\n`);
      partImports.set(item.path, symbol);
      compoundPaths.push({root:graph.canonicalRoot,path:item.path,binding:`${graph.canonicalRoot}.${item.path}`,symbol,file:partFile,types:partDeclaration,sha256:sha(partSource),vectorIds:item.vectorIds});
    }
    const declaration = `// @generated by src/kumo/emitters/vue/index.mjs; do not edit\nimport type { DefineComponent } from 'vue';\nexport interface ${model.public.symbol}Props { [key: string]: unknown }\ndeclare const component: DefineComponent<${model.public.symbol}Props>;\nexport default component;\nexport declare const modelDigest: ${JSON.stringify(model.modelDigest)};\n`;
    fs.writeFileSync(path.join(output,`components/${model.component}.d.ts`), declaration);
    entries.push({component:model.component,symbol:model.public.symbol,subpath:model.public.subpath,file,modelDigest:model.modelDigest,contentBindingDigest:model.contentBindings.capabilityDigest,semanticVariants:(model.draftImplementation.semanticVariants ?? []).map(({id,expectationDigest}) => ({id,expectationDigest})),unresolvedSemanticOperations:model.unresolvedSemanticOperations ?? [],sha256:sha(source),exports:model.public.exports,compoundExports:graph ? {canonicalRoot:graph.canonicalRoot,tree:graph.tree,paths:graph.paths.map(item => item.path)} : undefined,partImports});
  }
  const indexLines = [];
  const declarationLines = [];
  for (const entry of entries) {
    if (entry.component === 'toasty') {
      const line = `export { default as ${id(entry.symbol)}, default as ToastProvider, Toast, createKumoToastManager, useKumoToastManager } from './${entry.file}'`;
      indexLines.push(line);
      declarationLines.push(line);
      continue;
    }
    if (!entry.compoundExports) {
      indexLines.push(`export { default as ${id(entry.symbol)} } from './${entry.file}'`);
      declarationLines.push(`export { default as ${id(entry.symbol)} } from './${entry.file}'`);
      continue;
    }
    indexLines.push(`import Root${id(entry.symbol)} from './${entry.file}'`);
    declarationLines.push(`import Root${id(entry.symbol)} from './${entry.file}'`);
    for (const [partPath, symbol] of entry.partImports) {
      const part = compoundPaths.find(item => item.root === entry.compoundExports.canonicalRoot && item.path === partPath);
      indexLines.push(`import ${symbol} from './${part.file}'`);
      declarationLines.push(`import ${symbol} from './${part.file}'`);
    }
    const bindingGraph = {...entry.compoundExports, paths:entry.compoundExports.paths.map(path => ({path}))};
    const binding = compoundBindingSource(bindingGraph, entry.partImports).replace('RootComponent', `Root${id(entry.symbol)}`);
    indexLines.push(binding);
    declarationLines.push(binding);
  }
  fs.writeFileSync(path.join(output,'index.ts'),'// @generated by src/kumo/emitters/vue/index.mjs; do not edit\n'+indexLines.join('\n')+'\n');
  fs.writeFileSync(path.join(output,'index.d.ts'),'// @generated by src/kumo/emitters/vue/index.mjs; do not edit\n'+declarationLines.join('\n')+'\n');
  const exports = Object.fromEntries(entries.map(e => [`./components/${e.component}`,{vue:`./${e.file}`,types:`./components/${e.component}.d.ts`,canonicalSubpath:e.subpath}])) ;
  for (const part of compoundPaths) exports[`./${part.file.slice(0,-4)}`] = {vue:`./${part.file}`,types:`./${part.types}`,binding:part.binding};
  const components = entries.map(({partImports,compoundExports,...entry}) => ({...entry,...(compoundExports ? {compoundExports} : {})}));
  const manifest = {schemaVersion:'kumo.vue-library/v1',algebraVersion:'kumo.component-algebra/v1',candidate:true,count:entries.length,components,compoundPaths,exports:{'.':{vue:'./index.ts',types:'./index.d.ts'},...exports}};
  fs.writeFileSync(path.join(output,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  return manifest;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) process.stdout.write(canonicalJSON(generateVueLibrary())+'\n');
