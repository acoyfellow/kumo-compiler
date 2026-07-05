import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {loadLibrary, canonicalJSON} from '../../library/index.mjs';
import {requireContentBindings, semanticPredicate} from '../shared/content-adapter.mjs';
import {KUMO_INPUT_CLASS, KUMO_INPUT_ERROR_CLASS, KUMO_INPUTAREA_CLASS, KUMO_INPUTAREA_ERROR_CLASS, KUMO_FIELD_LABEL_CLASS, KUMO_FIELD_DESCRIPTION_CLASS, KUMO_CHECKBOX_CLASS, KUMO_CHECKBOX_BOX_CLASS, KUMO_CHECKBOX_INDICATOR_CLASS, KUMO_CHECKBOX_CHECK_SVG, KUMO_CHECKBOX_MINUS_SVG, KUMO_CHECKBOX_HIDDEN_INPUT_STYLE, KUMO_CHECKBOX_LABEL_WRAPPER_CLASS, KUMO_CHECKBOX_LABEL_CLASS, KUMO_CHECKBOX_LABEL_TEXT_CLASS, KUMO_RADIO_LEGEND_CLASS, KUMO_RADIO_LABEL_CLASS, KUMO_RADIO_ITEM_CLASS, KUMO_RADIO_INDICATOR_CLASS, KUMO_RADIO_DOT_CLASS, KUMO_RADIO_LABEL_TEXT_CLASS, KUMO_CLIPBOARD_ROOT_CLASS, KUMO_CLIPBOARD_TEXT_CLASS, KUMO_CLIPBOARD_BUTTON_CLASS, KUMO_CLIPBOARD_CHECK_SPAN_CLASS, KUMO_CLIPBOARD_COPY_SPAN_CLASS, KUMO_CLIPBOARD_CHECK_SVG, KUMO_CLIPBOARD_COPY_SVG, KUMO_SWITCH_TRACK_CLASS, KUMO_SWITCH_THUMB_CLASS, KUMO_TABS_LIST_CLASS, KUMO_TABS_TRIGGER_CLASS, KUMO_TABS_INDICATOR_CLASS, KUMO_METER_ROOT_CLASS, KUMO_METER_HEADER_CLASS, KUMO_METER_LABEL_CLASS, KUMO_METER_VALUE_CLASS, KUMO_METER_TRACK_CLASS, KUMO_METER_FILL_CLASS, KUMO_PLUS_ICON_SVG, KUMO_TOOLTIP_POSITIONER_CLASS, KUMO_TOOLTIP_POPUP_CLASS, KUMO_TOOLTIP_ARROW_CLASS, KUMO_TOOLTIP_ARROW_SVG, KUMO_LABEL_ROOT_CLASS, KUMO_LABEL_OPTIONAL_CLASS, KUMO_LABEL_INFO_BUTTON_CLASS, KUMO_LABEL_INFO_ICON_SVG, KUMO_BANNER_VARIANT_CLASSES, KUMO_BANNER_SIMPLE_ICON_CLASS, KUMO_BANNER_STRUCTURED_ICON_CLASS, compoundPartOverride, expandNamedExportModels} from '../shared/native-classes.mjs';

const projectRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../../..');
const visualContract=JSON.parse(fs.readFileSync(path.join(projectRoot,'generated/visual-contract.json'),'utf8'));
// Real Kumo Switch/Tabs/InputGroup classes copied verbatim from @cloudflare/kumo 2.6.0
// SSR output (renderToStaticMarkup) — NOT lookalikes. Defined locally in this emitter
// (like the Badge tokens above) so Solid switch/tabs structural + computed-style fidelity
// does not depend on the shared native-classes.mjs constants (which target the compact
// checkbox/switch shape). Track/thumb/float vary by checked/selected state exactly as React.
const KUMO_SWITCH_TRACK_BASE='relative inline-flex items-center ring cursor-pointer border-none p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand transition-colors duration-150 ease-out motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-50 h-4.5 w-9 rounded-[5px] supports-[corner-shape:squircle]:rounded-[10px] [corner-shape:squircle]';
const KUMO_SWITCH_TRACK_ON='bg-blue-500 dark:bg-blue-600 ring-blue-600 dark:ring-blue-500';
const KUMO_SWITCH_TRACK_OFF='bg-neutral-200 dark:bg-neutral-700 ring-neutral-300 dark:ring-neutral-600';
const KUMO_SWITCH_THUMB_BASE='absolute top-0 bottom-0 shadow-[0_0_1px_0.5px_var(--color-kumo-shadow-edge),0_1px_2px_var(--color-kumo-shadow-drop)] w-4.5 rounded-[5px] supports-[corner-shape:squircle]:rounded-[10px] [corner-shape:squircle] transition-all duration-150 ease-out motion-reduce:transition-none';
const KUMO_SWITCH_THUMB_ON='bg-kumo-base dark:bg-blue-300 left-4.5';
const KUMO_SWITCH_THUMB_OFF='bg-kumo-base dark:bg-neutral-850 left-0';
const KUMO_TABS_ROOT_CLASS='relative isolate min-w-0 font-medium rounded-lg ring ring-kumo-hairline/70';
const KUMO_TABS_BG_CLASS='absolute inset-x-0 top-1/2 z-0 -translate-y-1/2 rounded-lg bg-kumo-recessed h-9';
const KUMO_TABS_LIST_REAL_CLASS='relative flex min-w-0 shrink items-stretch kumo-tabs-list overflow-x-auto rounded-lg bg-kumo-recessed px-0.5 [--scroll-fade-width:3rem] scroll-px-(--scroll-fade-width) h-9';
const KUMO_TABS_TRIGGER_REAL_CLASS='relative z-2 flex items-center bg-transparent whitespace-nowrap focus:outline-none focus:ring-kumo-focus/50 focus-visible:ring-2 focus-visible:ring-kumo-brand cursor-pointer text-base my-0.5 text-kumo-subtle hover:text-kumo-default aria-selected:text-kumo-default focus-visible:ring-inset px-2.5 rounded-md';
const KUMO_TABS_FLOAT_CLASS='absolute z-1 left-0 w-(--active-tab-width) translate-x-(--active-tab-left) transition-all duration-200 data-[rendered=false]:scale-90 data-[rendered=false]:opacity-0 top-(--active-tab-top) h-(--active-tab-height) bg-kumo-base shadow-sm ring ring-kumo-line rounded-md';
const KUMO_INPUT_GROUP_LABEL_CLASS='relative w-full cursor-text border-0 bg-kumo-control text-kumo-default ring ring-kumo-line outline-none focus:outline-none kumo-input-placeholder disabled:text-kumo-disabled h-9 rounded-lg text-base focus:ring-kumo-focus/50 focus:ring-[1.5px] shadow-xs data-[disabled]:pointer-events-none data-[disabled]:opacity-50 overflow-hidden focus-within:ring-kumo-focus/50 focus-within:ring-[1.5px] has-[input[aria-invalid=true]]:ring-kumo-danger px-0 flex items-center gap-0 has-[[data-slot=input-group-suffix]]:[&_input]:[field-sizing:content] has-[[data-slot=input-group-suffix]]:[&_input]:max-w-full has-[[data-slot=input-group-suffix]]:[&_input]:grow-0 has-[[data-slot=input-group-suffix]]:[&_input]:pr-0 has-[[data-slot=input-group-addon-start]]:[&_input]:pl-2 has-[[data-slot=input-group-addon-end]]:[&_input]:pr-2 mb-0!';
// Real Kumo Select trigger classes + chevron, copied verbatim from @cloudflare/kumo
// 2.6.0 SSR (renderToStaticMarkup): a div.grid wrapping a button[role=combobox] that
// carries a value <span> + an aria-hidden chevron <span> (real <svg>/<path>, NEVER
// innerHTML) followed by the visually-hidden native <input>. Base UI portals the
// listbox at runtime, so it is absent from static markup (rendered only when open).
const KUMO_SELECT_ROOT_CLASS='grid gap-2';
// See the Svelte emitter note: golden applies the consumer className to the
// trigger button (Base UI cn()/tailwind-merge strips the default w-max when a
// width utility is supplied). Base trigger class omits w-max; it is added back
// only when no consumer class is present.
const KUMO_SELECT_TRIGGER_CLASS='group flex shrink-0 items-center select-none border-0 shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand cursor-pointer disabled:cursor-not-allowed disabled:text-kumo-subtle h-9 gap-1.5 rounded-lg px-3 text-base bg-kumo-base !text-kumo-default ring not-disabled:hover:bg-kumo-tint disabled:bg-kumo-base/50 disabled:!text-kumo-default/70 ring-kumo-line data-[state=open]:bg-kumo-base justify-between font-normal focus:opacity-100 focus:ring-kumo-focus/50 focus-visible:ring-inset *:in-focus:opacity-100';
const KUMO_SELECT_VALUE_CLASS='min-w-0 truncate data-[placeholder]:text-kumo-placeholder';
const KUMO_SELECT_ICON_CLASS='flex shrink-0 items-center text-kumo-subtle';
const KUMO_SELECT_CHEVRON_SVG='<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" class="fill-current"><path d="M181.66,170.34a8,8,0,0,1,0,11.32l-48,48a8,8,0,0,1-11.32,0l-48-48a8,8,0,0,1,11.32-11.32L128,212.69l42.34-42.35A8,8,0,0,1,181.66,170.34Zm-96-84.68L128,43.31l42.34,42.35a8,8,0,0,0,11.32-11.32l-48-48a8,8,0,0,0-11.32,0l-48,48A8,8,0,0,0,85.66,85.66Z"></path></svg>';
// Closed Combobox chrome copied verbatim from @cloudflare/kumo 2.6.0. The
// currently-open branch below intentionally retains the observable collection DOM.
const KUMO_COMBOBOX_ROOT_CLASS='relative inline-block w-full max-w-xs has-[:disabled]:opacity-50 has-[:disabled]:cursor-not-allowed';
const KUMO_COMBOBOX_INPUT_CLASS='border-0 bg-kumo-control text-kumo-default ring ring-kumo-line outline-none focus:outline-none kumo-input-placeholder disabled:text-kumo-disabled h-9 gap-1.5 rounded-lg px-3 text-base focus:ring-kumo-focus/50 focus:ring-[1.5px] w-full pr-12 disabled:cursor-not-allowed';
const KUMO_COMBOBOX_TRIGGER_CLASS='absolute top-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer text-kumo-subtle m-0 bg-transparent p-0 right-2';
const KUMO_COMBOBOX_CHEVRON_SVG='<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" class="fill-current"><path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path></svg>';
// Real Kumo Pagination classes + chevron icons, copied verbatim from @cloudflare/kumo
// 2.6.0 SSR: div.pagination > info (2 tabular-nums spans) + controls > nav > input-group
// holding First/Previous/[page input]/Next/Last Buttons, each Button carrying a real
// <svg>/<path> chevron inside a span.contents wrapper (NEVER innerHTML/text label).
const KUMO_PAGINATION_ROOT_CLASS='flex items-center gap-2 w-full';
const KUMO_PAGINATION_INFO_CLASS='grow text-sm text-kumo-subtle';
const KUMO_PAGINATION_CONTROLS_CLASS='grow flex flex-col items-end';
const KUMO_PAGINATION_GROUP_CLASS='relative w-full cursor-text border-0 bg-kumo-control text-kumo-default ring-kumo-line outline-none focus:outline-none kumo-input-placeholder disabled:text-kumo-disabled h-9 rounded-lg text-base focus:ring-kumo-focus/50 focus:ring-[1.5px] data-[disabled]:pointer-events-none data-[disabled]:opacity-50 isolate overflow-visible ring-0 shadow-none has-[input[aria-invalid=true]]:ring-kumo-danger px-0 flex items-center gap-0 has-[[data-slot=input-group-suffix]]:[&_input]:[field-sizing:content] has-[[data-slot=input-group-suffix]]:[&_input]:max-w-full has-[[data-slot=input-group-suffix]]:[&_input]:grow-0 has-[[data-slot=input-group-suffix]]:[&_input]:pr-0 has-[[data-slot=input-group-addon-start]]:[&_input]:pl-2 has-[[data-slot=input-group-addon-end]]:[&_input]:pr-2 !mb-0';
const KUMO_PAGINATION_BUTTON_CLASS='group flex w-max shrink-0 items-center font-medium select-none shadow-xs focus:outline-none focus:ring-kumo-focus/50 focus-visible:ring-kumo-brand cursor-pointer disabled:cursor-not-allowed disabled:text-kumo-subtle h-9 gap-1.5 px-3 text-base bg-kumo-base !text-kumo-default not-disabled:hover:bg-kumo-tint ring-kumo-line data-[state=open]:bg-kumo-base pointer-events-auto focus:ring-0 relative h-full! rounded-none ring-0 focus-visible:ring-0 border border-kumo-line first:rounded-l-[inherit] last:rounded-r-[inherit] not-first:-ml-px hover:z-1 focus:z-2 focus-visible:border-kumo-focus/50 disabled:bg-kumo-overlay disabled:text-kumo-inactive!';
const KUMO_PAGINATION_INPUT_CLASS='text-kumo-default ring-kumo-line outline-none focus:outline-none kumo-input-placeholder disabled:text-kumo-disabled gap-1.5 text-base focus:ring-kumo-focus/50 flex h-full min-w-0 grow items-center rounded-none bg-transparent font-sans px-3 text-ellipsis relative ring-0 focus:ring-0 border border-kumo-line first:rounded-l-[inherit] last:rounded-r-[inherit] not-first:-ml-px hover:z-1 hover:border-kumo-line focus:z-2 focus:border-kumo-focus/50 text-center';
const paginationIcon = d => `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="${d}"></path></svg>`;
const KUMO_PAGINATION_FIRST_SVG=paginationIcon('M205.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L131.31,128ZM51.31,128l74.35-74.34a8,8,0,0,0-11.32-11.32l-80,80a8,8,0,0,0,0,11.32l80,80a8,8,0,0,0,11.32-11.32Z');
const KUMO_PAGINATION_PREV_SVG=paginationIcon('M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z');
const KUMO_PAGINATION_NEXT_SVG=paginationIcon('M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z');
const KUMO_PAGINATION_LAST_SVG=paginationIcon('M141.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L124.69,128,50.34,53.66A8,8,0,0,1,61.66,42.34l80,80A8,8,0,0,1,141.66,133.66Zm80-11.32-80-80a8,8,0,0,0-11.32,11.32L204.69,128l-74.35,74.34a8,8,0,0,0,11.32,11.32l80-80A8,8,0,0,0,221.66,122.34Z');
// Real Kumo SensitiveInput classes + eye icon, copied verbatim from @cloudflare/kumo
// 2.6.0 SSR: div > div[role=button] masked-container (hidden password input + mask span
// tree with dots/reveal-text spans + eye-toggle button w/ real <svg> + copy button) +
// two sr-only spans. Real elements, no innerHTML, no lookalike divs.
const KUMO_SENSITIVE_CONTAINER_CLASS='border-0 bg-kumo-control text-kumo-default ring ring-kumo-line outline-none focus:outline-none kumo-input-placeholder disabled:text-kumo-disabled h-9 gap-1.5 rounded-lg px-3 text-base focus:ring-kumo-focus/50 focus:ring-[1.5px] focus-within:ring-kumo-focus/50 focus-within:ring-[1.5px] group/container relative flex w-full items-center focus-within:outline-2 focus-within:outline-kumo-focus cursor-pointer';
const KUMO_SENSITIVE_INPUT_CLASS='w-full border-0 bg-transparent p-0 ring-0 outline-none kumo-input-placeholder disabled:cursor-not-allowed disabled:text-kumo-subtle pr-8 pointer-events-none text-transparent';
const KUMO_SENSITIVE_MASK_CLASS='absolute inset-y-0 left-0 flex items-center overflow-hidden select-none right-8 px-3 pointer-events-auto text-kumo-default group/mask';
const KUMO_SENSITIVE_DOTS_CLASS='group-focus-within/container:invisible group-hover/mask:invisible';
const KUMO_SENSITIVE_REVEAL_CLASS='invisible absolute left-0 top-0 whitespace-nowrap text-kumo-subtle group-focus-within/container:visible group-hover/mask:visible';
const KUMO_SENSITIVE_EYE_CLASS='absolute top-1/2 -translate-y-1/2 cursor-pointer text-kumo-subtle hover:text-kumo-default focus:text-kumo-default focus:ring-kumo-focus/50 focus-visible:ring-2 focus-visible:ring-kumo-brand focus-visible:rounded-sm bg-transparent border-none shadow-none p-0 m-0 min-h-0 inline-flex items-center justify-center right-3 size-4 pointer-events-none opacity-0';
const KUMO_SENSITIVE_COPY_CLASS='absolute -top-px right-2 -translate-y-full cursor-pointer rounded-t-md bg-kumo-brand px-2 py-0.5 text-xs text-white opacity-0 transition-opacity group-focus-within/container:opacity-100 group-hover/container:opacity-100 hover:brightness-120 focus:outline-none focus:ring-kumo-focus/50 focus-visible:ring-2 focus-visible:ring-kumo-brand border-none shadow-none m-0 h-auto min-h-0';
const KUMO_SENSITIVE_EYE_SVG='<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" class="size-full"><path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"></path></svg>';
// Canonical Kumo 2.6.0 overlay chrome. Base UI normally supplies these portal,
// focus-guard and positioning nodes at runtime; native Solid SSR emits the same
// real nodes for controlled open state so its static output remains measurable.
const KUMO_OVERLAY_BUTTON_CLASS='group flex w-max shrink-0 items-center font-medium select-none border-0 shadow-xs focus:outline-none focus:ring-kumo-focus/50 focus-visible:ring-2 focus-visible:ring-kumo-brand cursor-pointer disabled:cursor-not-allowed disabled:text-kumo-subtle h-9 gap-1.5 rounded-lg px-3 text-base bg-kumo-base !text-kumo-default ring not-disabled:hover:bg-kumo-tint disabled:bg-kumo-base/50 disabled:!text-kumo-default/70 ring-kumo-line data-[state=open]:bg-kumo-base';
const KUMO_OVERLAY_GUARD_STYLE=KUMO_CHECKBOX_HIDDEN_INPUT_STYLE;
const KUMO_DIALOG_BACKDROP_CLASS='fixed inset-0 bg-kumo-recessed opacity-80 transition-all duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0';
const KUMO_DIALOG_CONTENT_CLASS='shadow-xs shadow-m ring ring-kumo-line fixed top-1/2 left-1/2 w-full sm:w-auto max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl bg-kumo-base text-kumo-default duration-150 data-ending-style:scale-90 data-ending-style:opacity-0 data-starting-style:scale-90 data-starting-style:opacity-0 sm:min-w-96';
const KUMO_DROPDOWN_CONTENT_CLASS='overflow-hidden bg-kumo-control text-kumo-default rounded-lg shadow-lg ring ring-kumo-line min-w-36 p-1.5 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95';
const KUMO_DROPDOWN_ITEM_CLASS='relative flex cursor-default items-center rounded-md px-2 py-1.5 text-base outline-hidden select-none focus:text-kumo-default focus:ring-kumo-focus/50 focus-visible:ring-2 focus-visible:ring-kumo-brand data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-kumo-overlay';
const KUMO_POPOVER_CONTENT_CLASS='flex origin-(--transform-origin) flex-col rounded-lg bg-kumo-base px-4 py-3 text-sm text-kumo-default shadow-lg shadow-kumo-tip-shadow outline outline-kumo-fill transition-[transform,scale,opacity] duration-150 data-starting-style:scale-90 data-starting-style:opacity-0 data-ending-style:scale-90 data-ending-style:opacity-0 data-instant:duration-0 kumo-popover-popup';
const KUMO_POPOVER_ARROW_CLASS='flex data-[side=bottom]:-top-2 data-[side=left]:right-[-13px] data-[side=left]:rotate-90 data-[side=right]:left-[-13px] data-[side=right]:-rotate-90 data-[side=top]:-bottom-2 data-[side=top]:rotate-180';
const KUMO_POPOVER_ARROW_SVG='<svg width="20" height="10" viewBox="0 0 20 10" fill="none"><path d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z" class="fill-kumo-base"></path><path d="M8.99542 1.85876C9.75604 1.17425 10.9106 1.17422 11.6713 1.85878L16.5281 6.22989C17.0789 6.72568 17.7938 7.00001 18.5349 7.00001L15.89 7L11.0023 2.60207C10.622 2.2598 10.0447 2.2598 9.66436 2.60207L4.77734 7L2.13171 7.00001C2.87284 7.00001 3.58774 6.72568 4.13861 6.22989L8.99542 1.85876Z" class="fill-kumo-tip-shadow"></path><path d="M10.3333 3.34539L5.47654 7.71648C4.55842 8.54279 3.36693 9 2.13172 9H0V8H2.13172C3.11989 8 4.07308 7.63423 4.80758 6.97318L9.66437 2.60207C10.0447 2.25979 10.622 2.2598 11.0023 2.60207L15.8591 6.97318C16.5936 7.63423 17.5468 8 18.5349 8H20V9H18.5349C17.2998 9 16.1083 8.54278 15.1901 7.71648L10.3333 3.34539Z" class="fill-kumo-tip-stroke"></path></svg>';
const KUMO_COMMAND_BACKDROP_CLASS='fixed inset-0 bg-kumo-overlay opacity-80 transition-all duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0';
const KUMO_COMMAND_DIALOG_CLASS='bg-kumo-base shadow-xs ring ring-kumo-line fixed top-[10vh] left-1/2 w-full max-w-2xl -translate-x-1/2 overflow-hidden rounded-lg duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0';
const KUMO_COMMAND_PANEL_CLASS='flex max-h-[60vh] flex-col overflow-hidden rounded-lg bg-kumo-elevated';
// The open canonical palette autofocuses its query, so its input group starts with this ring.
// Materialize that initial state for deterministic Solid SSR while retaining focus-within live behavior.
const KUMO_COMMAND_INPUT_GROUP_CLASS='flex items-center gap-3 bg-kumo-base px-4 py-3 ring-2 ring-kumo-brand focus-within:ring-2 focus-within:ring-kumo-brand';
const KUMO_COMMAND_INPUT_GROUP_STYLE='--tw-ring-color:var(--color-kumo-brand)';
const KUMO_COMMAND_INPUT_CLASS='flex-1 border-none bg-transparent text-base kumo-input-placeholder outline-none';
const KUMO_COMMAND_LIST_CLASS='relative min-h-0 flex-1 overflow-y-auto rounded-b-lg bg-kumo-base px-2 py-2 scroll-py-2 ring-1 ring-kumo-hairline';
const KUMO_COMMAND_ITEM_CLASS='group flex w-full items-center gap-3 px-2 py-1.5 text-left text-base transition-colors cursor-pointer data-[highlighted]:bg-kumo-overlay rounded-lg';
const KUMO_COMMAND_SEARCH_SVG='<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" class="h-4 w-4 text-kumo-subtle"><path d="M232.49,215.51,185,168a92.12,92.12,0,1,0-17,17l47.53,47.54a12,12,0,0,0,17-17ZM44,112a68,68,0,1,1,68,68A68.07,68.07,0,0,1,44,112Z"></path></svg>';
const identifier = value => /^[A-Za-z_$][\w$]*$/.test(value);
// Ternary chain selecting the real per-variant Kumo class string for a native button.
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
const bannerClassExpression = (accessor, key) => Object.entries(KUMO_BANNER_VARIANT_CLASSES).filter(([variant]) => variant !== 'default').map(([variant, classes]) => `${accessor} === ${JSON.stringify(variant)} ? ${JSON.stringify(classes[key])}`).join(' : ') + ` : ${JSON.stringify(KUMO_BANNER_VARIANT_CLASSES.default[key])}`;
// Emphasis variants (primary, destructive/danger) bind four inline CSS vars from a
// single tone via color-mix (emitted as a style object) so the
// bg-(--kumo-button-emphasis-bg)/ring-(--kumo-button-emphasis-ring) utilities resolve
// to a color, mirroring canonical React 2.6.0. Non-emphasis variants get no style.
const styleObjectLiteral = obj => `{${Object.entries(obj).map(([k,v]) => `${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(', ')}}`;
const nativeButtonEmphasisStyleExpression = (emphasis, accessor) => `${Object.entries(emphasis.variants).map(([variant, styleObj]) => `${accessor} === ${JSON.stringify(variant)} ? ${styleObjectLiteral(styleObj)}`).join(' : ')} : undefined`;
const nativeButtonEmphasisCondition = (emphasis, accessor) => Object.keys(emphasis.variants).map(v => `${accessor} === ${JSON.stringify(v)}`).join(' || ');
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
    case 'compound': return `<div data-kumo-compound={${JSON.stringify(value.name)}}>${Object.entries(value.parts).map(([name, part]) => { const override = compoundPartOverride(context.component, name); return override ? `<${override.tag}${override.className ? ` class=${JSON.stringify(override.className)}` : ''}>${node(part, context)}</${override.tag}>` : `<div data-kumo-part={${JSON.stringify(name)}}>${node(part, context)}</div>`; }).join('')}</div>`;
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
      if (value.tag === 'merge-trigger') { const fallback = value.children?.[0]; return `(${expr(value.properties.when, context)} ? (<KumoMergeTriggerContext.Provider value={{"data-base-ui-tooltip-trigger": ""}}>${(fallback.children ?? []).map(x => node(x, context)).join('')}</KumoMergeTriggerContext.Provider>) : (${node(fallback, context)}))`; }
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
// Content-keyed semantic-variant snapshots are gated behind the explicit
// `semanticContent` escape hatch (undefined for realistic consumer mounts), mirroring
// the svelte emitter's `__consumerContent`. Keying these predicates off the live child
// content (renderContent) made vue/solid short-circuit into a lossy captured snapshot —
// e.g. <Badge>PRO</Badge> hit an incomplete "PRO" sample and dropped the real
// `text-kumo-badge-inverted` variant class — while svelte fell through to the faithful
// variant expression. Gating on the escape hatch restores parity with svelte.
const predicate = value => semanticPredicate(value, {fixture:'normalizedFixture', content:'props.semanticContent'});
const safeType = type => type.replace(/ReactNode|Icon/g, 'JSX.Element').replace(/ReactElement/g, 'JSX.Element').replace(/ButtonHTMLAttributes/g, '__BUTTON_ATTRIBUTES__').replace(/HTMLAttributes/g, 'JSX.HTMLAttributes<HTMLDivElement>').replace(/__BUTTON_ATTRIBUTES__/g, 'JSX.ButtonHTMLAttributes<HTMLButtonElement>');
// Button's inline loading spinner, verbatim from @cloudflare/kumo 2.6.0's Loader.
// Size is 14px for base/sm/xs, 16px for lg.
const solidButtonSpinner = (sizeExpr) => `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" style={{height: (${sizeExpr}) + "px", width: (${sizeExpr}) + "px"}} role="status" aria-label="Loading"><circle cx="12" cy="12" r="9.5" fill="none" stroke-width="2" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="2s" repeatCount="indefinite"></animateTransform><animate attributeName="stroke-dasharray" values="0 150;42 150;42 150" keyTimes="0;0.5;1" dur="1.5s" repeatCount="indefinite"></animate><animate attributeName="stroke-dashoffset" values="0;-16;-59" keyTimes="0;0.5;1" dur="1.5s" repeatCount="indefinite"></animate></circle><circle cx="12" cy="12" r="9.5" fill="none" opacity="0.1" stroke-width="2" stroke-linecap="round"></circle></svg>`;
const SOLID_TOAST_TYPES = `export type KumoToastVariant = "default" | "success" | "error" | "warning" | "info";
export type KumoToastAction = Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & { children?: JSX.Element; onClick?: JSX.EventHandler<HTMLButtonElement, MouseEvent>; };
export interface KumoToastOptions<Data extends object = Record<string, unknown>> { id?: string; title?: JSX.Element; description?: JSX.Element; content?: JSX.Element; actions?: KumoToastAction[]; timeout?: number; priority?: "low" | "high"; variant?: KumoToastVariant; data?: Data; onClose?: () => void; onRemove?: () => void; }
export interface KumoToast<Data extends object = Record<string, unknown>> extends KumoToastOptions<Data> { id: string; }
export interface KumoToastManager<Data extends object = Record<string, unknown>> { readonly toasts: readonly KumoToast<Data>[]; add<T extends Data = Data>(options: KumoToastOptions<T>): string; close(id?: string): void; subscribe(listener: (toasts: readonly KumoToast<Data>[]) => void): () => void; }
export interface ToastyProps extends Record<string, unknown> { children?: JSX.Element; container?: Node | (() => Node); toastManager?: KumoToastManager; variant?: KumoToastVariant; onNotify?: () => void; onAction?: () => void; fixture?: unknown; styles?: Record<string, string>; }
export interface ToastProps { toast: KumoToast; defaultVariant?: KumoToastVariant; onClose?: (id: string) => void; onAction?: () => void; }
`;
const SOLID_TOAST_MANAGER_SOURCE = `const ToastManagerContext = createContext<KumoToastManager>();

export function createKumoToastManager<Data extends object = Record<string, unknown>>(): KumoToastManager<Data> {
  let nextId = 1;
  let current: KumoToast<Data>[] = [];
  const listeners = new Set<(toasts: readonly KumoToast<Data>[]) => void>();
  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  const snapshot = () => current.slice();
  const publish = () => { const value = snapshot(); for (const listener of listeners) listener(value); };
  const clearTimer = (id: string) => { const timer = timers.get(id); if (timer !== undefined) clearTimeout(timer); timers.delete(id); };
  const manager: KumoToastManager<Data> = {
    get toasts() { return snapshot(); },
    add<T extends Data = Data>(options: KumoToastOptions<T>): string {
      const id = options.id ?? "kumo-toast-" + nextId++;
      const index = current.findIndex(toast => toast.id === id);
      const toast = { ...(index >= 0 ? current[index] : {}), ...options, id } as KumoToast<Data>;
      current = index >= 0 ? current.map((item, itemIndex) => itemIndex === index ? toast : item) : [...current, toast];
      clearTimer(id);
      const timeout = toast.timeout ?? 5000;
      if (timeout !== 0) {
        const timer = setTimeout(() => manager.close(id), Math.max(0, timeout));
        (timer as ReturnType<typeof setTimeout> & { unref?: () => void }).unref?.();
        timers.set(id, timer);
      }
      publish();
      return id;
    },
    close(id?: string): void {
      const removed = id === undefined ? current : current.filter(toast => toast.id === id);
      if (removed.length === 0) return;
      for (const toast of removed) { clearTimer(toast.id); toast.onClose?.(); }
      const removedIds = new Set(removed.map(toast => toast.id));
      current = current.filter(toast => !removedIds.has(toast.id));
      publish();
      for (const toast of removed) toast.onRemove?.();
    },
    subscribe(listener: (toasts: readonly KumoToast<Data>[]) => void): () => void {
      listeners.add(listener);
      listener(snapshot());
      return () => listeners.delete(listener);
    },
  };
  return manager;
}

export function useKumoToastManager<Data extends object = Record<string, unknown>>(): KumoToastManager<Data> {
  const manager = useContext(ToastManagerContext);
  if (!manager) throw new Error("useKumoToastManager must be used within Toasty or ToastProvider");
  return manager as KumoToastManager<Data>;
}

export function Toast(props: ToastProps): JSX.Element {
  const toast = () => props.toast;
  const closeToast: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = event => {
    const close = event.currentTarget;
    setTimeout(() => { if (typeof document !== "undefined" && document.activeElement === close) close.blur(); props.onClose?.(toast().id); }, 300);
  };
  const activateAction = (action: KumoToastAction): JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> => event => {
    action.onClick?.(event);
    props.onAction?.();
    event.currentTarget.focus();
  };
  return <div role="status" data-kumo-component="Toast" aria-live={toast().priority === "high" ? "assertive" : "polite"} data-variant={toast().variant ?? props.defaultVariant ?? "default"}>{toast().content ?? <><strong data-toast-title>{toast().title}</strong><span data-toast-description>{toast().description}</span><For each={toast().actions ?? []} children={action => <button {...action} type={(action.type as JSX.ButtonHTMLAttributes<HTMLButtonElement>["type"]) ?? "button"} data-toast-action onClick={activateAction(action)}>{action.children}</button>} /></>}<button type="button" aria-label="Close" onClick={closeToast}>Close</button></div>;
}

`;
function declaration(model, toggle, nativeInput, clipboardCopy, paginationControls, menubarNavigation, dialogLayer, inputGroupComposition, sensitiveInput, comboboxCollection, autocompleteCollection, commandPalette, toastLifecycle, datePicker, dateRangePicker, popoverLayer, dropdownMenuLayer, selectCollection) {
  const nativeButton=Boolean(model.interactions?.nativeButton);
  const nativeInputElement=nativeInput?.requirements.dom?.[0];
  if (toastLifecycle) return `// @generated by src/kumo/emitters/solid/index.mjs; do not edit
import type { JSX } from "solid-js";
${SOLID_TOAST_TYPES}export declare function createKumoToastManager<Data extends object = Record<string, unknown>>(): KumoToastManager<Data>;
export declare function useKumoToastManager<Data extends object = Record<string, unknown>>(): KumoToastManager<Data>;
export declare function Toast(props: ToastProps): JSX.Element;
export declare function Toasty(props: ToastyProps): JSX.Element;
export declare const ToastProvider: typeof Toasty;
export default Toasty;
`;
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
  return `// @generated by src/kumo/emitters/solid/index.mjs; do not edit\nimport type { JSX } from "solid-js";\nexport interface ${model.public.symbol}Props${nativeButton?' extends JSX.ButtonHTMLAttributes<HTMLButtonElement>':nativeInputElement==='input'?' extends JSX.InputHTMLAttributes<HTMLInputElement>':nativeInputElement==='textarea'?' extends JSX.TextareaHTMLAttributes<HTMLTextAreaElement>':' extends Record<string, unknown>'} {\n${props}${slots ? '\n' + slots : ''}\n  children?: JSX.Element;\n  fixture?: unknown;\n  styles?: Record<string, string>;\n}\nexport interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }\n${partDeclarations}${partDeclarations ? '\n' : ''}export declare const ${model.public.symbol}: ((props: ${model.public.symbol}Props) => JSX.Element)${parts.length ? ` & ${apiType(api)}` : ''};\nexport default ${model.public.symbol};\n`;
}
function source(model, toggle, nativeInput, fieldControl, clipboardCopy, paginationControls, radioGroup, tabsNavigation, menubarNavigation, dialogLayer, inputGroupComposition, sensitiveInput, comboboxCollection, autocompleteCollection, commandPalette, toastLifecycle, datePicker, dateRangePicker, responsiveSidebar, popoverLayer, dropdownMenuLayer, selectCollection) {
  const root = model.draftImplementation.componentRoot;
  const hasMergeTrigger = root?.tag === 'merge-trigger';
  const tooltip = model.interactions?.tooltipPopup?.schemaVersion === 'kumo.tooltip-popup/v1';
  const tableOfContents = model.component === 'table-of-contents';
  const banner = model.component === 'banner';
  const collapsible = model.component === 'collapsible';
  const label = model.component === 'label';
  // Label: same composition as Svelte/Vue, verified against @cloudflare/kumo
  // 2.6.0's own chunk output + golden's live homepage DOM -- children, then an
  // optional "(optional)" span, then an optional Tooltip-wrapped info-icon
  // Button trigger (popup content never renders in this closed, hover-only
  // state).
  const labelFallback = label ? `<label for={props.htmlFor as string} class=${JSON.stringify(KUMO_LABEL_ROOT_CLASS)}>{props.children}{props.showOptional ? <span class=${JSON.stringify(KUMO_LABEL_OPTIONAL_CLASS)}>{"(optional)"}</span> : undefined}{props.tooltip !== undefined ? <button data-kumo-component="Button" class=${JSON.stringify(KUMO_LABEL_INFO_BUTTON_CLASS)} type="button" aria-label="More information" data-base-ui-tooltip-trigger=""><span class="contents">${KUMO_LABEL_INFO_ICON_SVG}</span></button> : undefined}</label>` : null;
  const surface = model.component === 'surface';
  const surfaceFallback = surface ? `<div data-surface-color={(props.color as string | undefined) ?? "primary"} data-deprecated="surface" class={mergeStyles("bg-kumo-base", "shadow-xs", "ring", "ring-kumo-line", (props.className as string | undefined) ? undefined : "overflow-visible", (props.className as string | undefined) ? undefined : "rounded-none", props.className as string | undefined)}>{props.children}</div>` : null;
  const visualSimple = ['badge','link','text'].includes(model.component) ? visualContract.components[model.component] : null;
  requireContentBindings(model);
  const variants = model.draftImplementation.semanticVariants ?? [];
  const imports = new Set(['splitProps']);
  if (hasMergeTrigger || model.interactions?.nativeButton) imports.add('createContext');
  if (tooltip) imports.add('Show');
  if (model.interactions?.nativeButton) imports.add('useContext');
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
  if(dropdownMenuLayer) { imports.add('onCleanup'); imports.add('onMount'); }
  if(toastLifecycle) { imports.add('For'); imports.add('Show'); imports.add('createContext'); imports.add('createSignal'); imports.add('mergeProps'); imports.add('onCleanup'); imports.add('onMount'); imports.add('useContext'); }
  if(datePicker || dateRangePicker) { imports.add('createSignal'); imports.add('mergeProps'); imports.add('For'); }
  if(responsiveSidebar) { imports.add('createSignal'); imports.add('mergeProps'); imports.add('For'); }
  if(comboboxCollection || autocompleteCollection) { imports.add('For'); imports.add('Show'); }
  if(inputGroupComposition || radioGroup)imports.add('createUniqueId');
  if(nativeInputElement === 'input')imports.add('createEffect');
  if(dialogLayer||popoverLayer||dropdownMenuLayer)imports.add('Show');
  if(dropdownMenuLayer||selectCollection)imports.add('For');
  if(selectCollection)imports.add('Show');
  if(radioGroup || tabsNavigation || menubarNavigation || tableOfContents)imports.add('For');
  const localNames = nativeButton ? [...new Set([...model.props.items.filter(x => !x.nativeForwarding).map(x => x.name), 'children', 'fixture', 'styles', 'onClick'])] : nativeNames;
  const toggleTag=toggle?.native.root;
  const toggleRole=toggleTag==='span'?'checkbox':'switch';
  const toggleRootClass=toggle?(toggleTag==='span'?KUMO_CHECKBOX_CLASS:KUMO_SWITCH_TRACK_CLASS):'';
  const toggleVariantArgs=toggle?.native.styleVariants.length?', '+toggle.native.styleVariants.map(variant=>`(${Object.entries(variant.when).map(([name,value])=>`props.${name} === ${JSON.stringify(value)}`).join(' && ')||'true'}) ? ${JSON.stringify(variant.classes.join(' '))} : ""`).join(', '):'';
  const toggleClass=toggle?` class={mergeStyles(${JSON.stringify(toggleRootClass)}${toggleVariantArgs})}`:'';
  // Canonical @cloudflare/kumo 2.6.0 Switch/Checkbox emit ONLY data-checked/
  // data-unchecked(/data-indeterminate) -- verified via renderToStaticMarkup, ported
  // from the already-fixed Vue (11b295bb) and Svelte (2baad4a9) emitters. No
  // data-state attribute exists on either; it was an emitter invention.
  const toggleData=toggle?` data-checked={checked() ? "" : undefined} data-unchecked={checked() ? undefined : ""} data-indeterminate={currentIndeterminate() ? "" : undefined}`:'';
  const tooltipFallback=tooltip?`<>{props.asChild ? <KumoMergeTriggerContext.Provider value={{"data-base-ui-tooltip-trigger": ""}}>{props.children}</KumoMergeTriggerContext.Provider> : <button class="inline-flex items-center bg-transparent border-none shadow-none p-0 m-0 h-auto min-h-0 leading-[0] cursor-default" type="button" data-base-ui-tooltip-trigger="">{props.children}</button>}<Show when={props.open !== undefined ? Boolean(props.open) : Boolean(props.defaultOpen)} children={typeof document !== "undefined" ? <Portal><div data-base-ui-portal="" data-base-ui-inert=""><div data-open="" data-side="top" data-align="center" role="presentation" class=${JSON.stringify(KUMO_TOOLTIP_POSITIONER_CLASS)} style="position:absolute;left:0;top:0;transform:translate(0px,-10px)"><div data-open="" data-side="top" data-align="center" tabindex="-1" data-base-ui-focusable="" class=${JSON.stringify(KUMO_TOOLTIP_POPUP_CLASS)}><div data-open="" data-side="top" data-align="center" aria-hidden="true" class=${JSON.stringify(KUMO_TOOLTIP_ARROW_CLASS)} style="position:absolute;left:12px">${KUMO_TOOLTIP_ARROW_SVG}</div>{props.content as JSX.Element}</div></div></div></Portal> : undefined} /></>`:null;
  const visualSimpleFallback=visualSimple?(model.component==='badge'?`<${visualSimple.root.tag} class={${badgeVariantExpression('props.variant')}}>{props.children}</${visualSimple.root.tag}>`:model.component==='text'?`<p color={props.color as string | undefined} class={mergeStyles("text-kumo-default", ({xs:"text-xs",sm:"text-sm",base:"text-base",lg:"text-lg"} as Record<string,string>)[props.size as string ?? "base"] ?? "text-base", props.bold ? "font-medium" : "")}>{props.children}</p>`:`<${visualSimple.root.tag}${model.component==='link'?' href={props.href as string}':''}${model.component==='label'?' for={props.for as string}':''} class=${JSON.stringify(visualSimple.root.className)}>{props.children}</${visualSimple.root.tag}>`):null;
  const bannerFallback=banner?`<div class={${bannerClassExpression('props.variant','root')}}>{props.title !== undefined || props.description !== undefined || props.action !== undefined ? <>{props.icon != null ? <span class={${JSON.stringify(KUMO_BANNER_STRUCTURED_ICON_CLASS)} + " " + (${bannerClassExpression('props.variant','text')})}>{props.icon as JSX.Element}</span> : undefined}<div class={"flex min-w-0 flex-1 items-center justify-between gap-3" + (props.title === undefined ? " pt-px" : "")}><div class="flex flex-col gap-0.5">{props.title !== undefined ? <p class="font-medium leading-snug">{props.title as JSX.Element}</p> : undefined}{props.description !== undefined ? <div class="text-sm leading-snug"><p>{props.description as JSX.Element}</p></div> : undefined}</div>{props.action !== undefined ? <div class="flex shrink-0 items-center gap-2">{props.action as JSX.Element}</div> : undefined}</div></> : <>{props.icon != null ? <span class={${JSON.stringify(KUMO_BANNER_SIMPLE_ICON_CLASS)} + " " + (${bannerClassExpression('props.variant','text')})}>{props.icon as JSX.Element}</span> : undefined}<p>{props.children ?? (props.text as JSX.Element)}</p></>}</div>`:null;
  const collapsibleFallback=collapsible?`<div data-open={props.open || props.defaultOpen ? "" : undefined} data-closed={props.open || props.defaultOpen ? undefined : ""} title={props.title as string} label={props.label as string}>{props.children}</div>`:null;
  // React canonical only structures the TOC from compound children; with plain
  // title/items props it renders a bare <nav>. Match that: emit the title <p> and
  // <ul> ONLY when fixture-derived content exists, else a bare <nav> (no extra <ul>).
  const tableOfContentsFallback=tableOfContents?`<nav aria-label={String(tocFixture()?.props?.["aria-label"] ?? "Table of contents")}><Show when={tocTitle()} children={<p>{tocTitle()}</p>} /><Show when={tocItems().length > 0} children={<ul><For each={tocItems()} children={item => item.group ? <a href={item.href} aria-current={item.active ? "location" : undefined}>{item.label}</a> : <li><a href={item.href} aria-current={item.active ? "location" : undefined}>{item.label}</a></li>} /></ul>} /></nav>`:null;
  if(tableOfContents)imports.add('Show');
  // Switch renders the SAME control-subtree React canonical does: a button[role=switch]
  // carrying a <div> thumb (React uses div, not span), followed by the visually-hidden
  // native <input type=checkbox>. Track+thumb classes are the real Kumo tokens, keyed to
  // the checked state (bg-blue-500 / bg-neutral-200 track; left-4.5 / left-0 thumb).
  // Bare (no-Fragment) sequence for embedding as siblings inside an existing element
  // (e.g. <label>...</label>, which natively accepts multiple children). Solid's JSX
  // transform rejects a Fragment nested directly under another element unless it is
  // that element's SOLE child, so the <label> branch below must NOT reuse the
  // Fragment-wrapped `toggleControl` — only the standalone (no-label) branch needs the
  // Fragment, because there it is the single top-level expression.
  const toggleControlInner=toggle?`<button class={mergeStyles(${JSON.stringify(KUMO_SWITCH_TRACK_BASE)}, checked() ? ${JSON.stringify(KUMO_SWITCH_TRACK_ON)} : ${JSON.stringify(KUMO_SWITCH_TRACK_OFF)})}${toggleData} aria-label={(props["aria-label"] as string) ?? "Switch"} type="button" role=${JSON.stringify(toggleRole)} aria-checked={checked()} disabled={Boolean(props.${toggle.disabled.prop})} onClick={toggleChecked}><div class={mergeStyles(${JSON.stringify(KUMO_SWITCH_THUMB_BASE)}, checked() ? ${JSON.stringify(KUMO_SWITCH_THUMB_ON)} : ${JSON.stringify(KUMO_SWITCH_THUMB_OFF)})} /></button><input style=${JSON.stringify(KUMO_CHECKBOX_HIDDEN_INPUT_STYLE)} tabindex="-1" type="checkbox" aria-hidden="true" attr:checked={checked() ? "" : undefined} />`:null;
  const toggleControl=toggle?`<>${toggleControlInner}</>`:null;
    const toggleFallback=toggle?`props.label !== undefined ? (<label class="inline-flex items-center gap-2 cursor-pointer select-none text-base text-kumo-default">${toggleControlInner}<span>{props.label as string}</span></label>) : (${toggleControl})`:null;
  // Checkbox renders the SAME control-subtree React canonical does: box span carrying
  // the real Kumo checkmark <svg> indicator, plus the visually-hidden native <input>,
  // wrapped (when a label is present) in React's Field.Root div + label + text span.
  const isCheckbox = toggle && toggleTag === 'span';
  // Emit the check/minus indicator as REAL <svg>+<path> JSX nodes (mirroring
  // cloudflare-logo + the svelte/vue lanes), NOT innerHTML: strict no-innerHTML bar.
  const checkboxIndicator = isCheckbox ? `<span class=${JSON.stringify(KUMO_CHECKBOX_INDICATOR_CLASS)} data-checked={checked() ? "" : undefined} data-unchecked={checked() ? undefined : ""} data-indeterminate={currentIndeterminate() ? "" : undefined}>{currentIndeterminate() ? (${KUMO_CHECKBOX_MINUS_SVG}) : (${KUMO_CHECKBOX_CHECK_SVG})}</span>` : '';
  // Checkbox's real label<->control linkage: golden's LIVE HYDRATED DOM (Base
  // UI, verified via Playwright against the actual homepage route -- NOT
  // renderToStaticMarkup, which genuinely differs here since this linkage is
  // added client-side post-hydration) has BOTH:
  //   <label id=X for=Y> <span role=checkbox aria-labelledby=X> <input id=Y>
  // A prior attempt at this was reverted based on the SSR-only signal;
  // re-verified here against the correct live-DOM ground truth, caught by
  // dogfooding @acoyfellow/semantic-diff's Tier R (id-reference-graph shape)
  // in fidelity-observatory's route-cascade.
  const checkboxLabelId = isCheckbox ? `kumo-${crypto.createHash('sha256').update(model.modelDigest).digest('hex').slice(0, 12)}-checkbox-label` : null;
  const checkboxInputId = isCheckbox ? `kumo-${crypto.createHash('sha256').update(model.modelDigest).digest('hex').slice(0, 12)}-checkbox-input` : null;
  const checkboxHiddenInput = withId => isCheckbox ? `<input${withId ? ` id=${JSON.stringify(checkboxInputId)}` : ''} style=${JSON.stringify(KUMO_CHECKBOX_HIDDEN_INPUT_STYLE)} tabindex="-1" type="checkbox" aria-hidden="true" checked={checked()} disabled={Boolean(props.${toggle?.disabled.prop}) || undefined} />` : '';
  const checkboxBox = (withMt, withLabelledby) => `<span data-kumo-component="Checkbox" class={mergeStyles(${JSON.stringify(KUMO_CHECKBOX_BOX_CLASS)}${withMt ? ' + (props.label !== undefined ? " mt-0.5" : "")' : ''}${toggleVariantArgs})}${toggleData} aria-label={${withLabelledby ? 'undefined' : 'props["aria-label"] as string'}}${withLabelledby ? ` aria-labelledby={${JSON.stringify(checkboxLabelId)}}` : ''} role="checkbox" aria-checked={currentIndeterminate() ? "mixed" : checked()} aria-disabled={Boolean(props.${toggle?.disabled.prop}) || undefined} tabIndex={props.${toggle?.disabled.prop} ? undefined : 0} onClick={toggleChecked} onKeyDown={toggleOnKeyDown}>${checkboxIndicator}</span>`;
  const checkboxFallback = isCheckbox ? `props.label !== undefined ? (<div class=${JSON.stringify(KUMO_CHECKBOX_LABEL_WRAPPER_CLASS)}><label id=${JSON.stringify(checkboxLabelId)} for=${JSON.stringify(checkboxInputId)} class={mergeStyles(${JSON.stringify(KUMO_CHECKBOX_LABEL_CLASS)}, props.${toggle?.disabled.prop} ? "cursor-not-allowed" : "cursor-pointer")}>${checkboxBox(true, true)}${checkboxHiddenInput(true)}<span class=${JSON.stringify(KUMO_CHECKBOX_LABEL_TEXT_CLASS)}>{props.label as string}</span></label></div>) : (<>${checkboxBox(false, false)}${checkboxHiddenInput(false)}</>)` : null;
  const nativeInputClassExpr = nativeInputElement === 'textarea'
    ? `(props.error || props.variant === "error") ? ${JSON.stringify(KUMO_INPUTAREA_ERROR_CLASS)} : ${JSON.stringify(KUMO_INPUTAREA_CLASS)}`
    : `(props.error || props.variant === "error") ? ${JSON.stringify(KUMO_INPUT_ERROR_CLASS)} : ${JSON.stringify(KUMO_INPUT_CLASS)}`;
  const nativeInputValueExpr = `(props.value !== undefined ? props.value : props.${nativeInput?.uncontrolled.prop}) as string | number | string[] | undefined`;
  const nativeInputValueRef = nativeInputElement === 'input' ? `ref={node => createEffect(() => { const current = incoming.value !== undefined ? incoming.value : incoming.${nativeInput?.uncontrolled.prop}; current === undefined ? node.removeAttribute("value") : node.setAttribute("value", String(current)); })}` : '';
  const nativeInputBare = nativeInputElement ? nativeInputElement === 'textarea'
    ? `<textarea {...native} class={mergeStyles(${nativeInputClassExpr}, styles.root, props.class)} disabled={Boolean(props.disabled)} onInput={nativeInputHandler}>{${nativeInputValueExpr}}</textarea>`
    : `<input {...native} class={mergeStyles(${nativeInputClassExpr}, styles.root, props.class)} value={${nativeInputValueExpr}} ${nativeInputValueRef} disabled={Boolean(props.disabled)} onInput={nativeInputHandler}></input>` : null;
  const ownedControlId = fieldControl?.ownsControl && nativeInputElement ? `kumo-${crypto.createHash('sha256').update(model.modelDigest).digest('hex').slice(0, 12)}` : null;
  const ownedLabelId = fieldControl?.ownsControl && nativeInputElement ? `kumo-${crypto.createHash('sha256').update(model.modelDigest).digest('hex').slice(0, 12)}-label` : null;
  // Composed (label-owning) branch copied verbatim from canonical @cloudflare/kumo
  // 2.6.0's real Field composition (ported from the already-fixed Vue 94ee0253 and
  // Svelte b0a0ca4a emitters): a div.grid.gap-2 wrapper (also carrying the
  // has-[input[type=checkbox]]/has-[[role=switch]] variants used by Checkbox/Switch
  // field composition elsewhere), a <label id for> containing a <span> around the
  // label text (not bare text), and the input using aria-labelledby instead of
  // aria-label.
  const nativeInputFallback = nativeInputBare && ownedControlId ? `props.label != null ? <div class="grid gap-2 has-[input[type=checkbox]]:grid-cols-[auto_1fr] has-[input[type=checkbox]]:items-center has-[[role=switch]]:grid-cols-[auto_1fr] has-[[role=switch]]:items-center"><label id=${JSON.stringify(ownedLabelId)} for=${JSON.stringify(ownedControlId)} class="m-0 select-none text-base font-medium text-kumo-default"><span class="inline-flex items-center gap-1">{props.label as JSX.Element}</span></label>${nativeInputElement === 'textarea' ? `<textarea {...native} id=${JSON.stringify(ownedControlId)} aria-labelledby=${JSON.stringify(ownedLabelId)} class={mergeStyles(${nativeInputClassExpr}, styles.root, props.class)} disabled={Boolean(props.disabled)} onInput={nativeInputHandler}>{${nativeInputValueExpr}}</textarea>` : `<input {...native} id=${JSON.stringify(ownedControlId)} aria-labelledby=${JSON.stringify(ownedLabelId)} class={mergeStyles(${nativeInputClassExpr}, styles.root, props.class)} value={${nativeInputValueExpr}} ${nativeInputValueRef} disabled={Boolean(props.disabled)} onInput={nativeInputHandler}></input>`}</div> : ${nativeInputBare}` : nativeInputBare;
  const providedFieldFallback = fieldControl && !fieldControl.ownsControl ? `<div class="grid gap-2 has-[input[type=checkbox]]:grid-cols-[auto_1fr] has-[input[type=checkbox]]:items-center has-[[role=switch]]:grid-cols-[auto_1fr] has-[[role=switch]]:items-center"><label for={props.controlId as string ?? "field-control"} class=${JSON.stringify(KUMO_FIELD_LABEL_CLASS)}><span class="inline-flex items-center gap-1">{props.label as JSX.Element}</span></label>{props.children}{(props as Record<string, unknown>).description !== undefined ? <p class=${JSON.stringify(KUMO_FIELD_DESCRIPTION_CLASS)}>{(props as Record<string, unknown>).description as JSX.Element}</p> : null}</div>` : null;
  const clipboardFallback = clipboardCopy ? `<div class=${JSON.stringify(KUMO_CLIPBOARD_ROOT_CLASS)}><span class=${JSON.stringify(KUMO_CLIPBOARD_TEXT_CLASS)}>{props.${clipboardCopy.copySource.fallback} as JSX.Element}</span><button data-kumo-component="Button" type="button" class=${JSON.stringify(KUMO_CLIPBOARD_BUTTON_CLASS)} aria-label="Copy to clipboard" onClick={copyText}><span class="contents"><span class=${JSON.stringify(KUMO_CLIPBOARD_CHECK_SPAN_CLASS)}>${KUMO_CLIPBOARD_CHECK_SVG}</span><span class=${JSON.stringify(KUMO_CLIPBOARD_COPY_SPAN_CLASS)}>${KUMO_CLIPBOARD_COPY_SVG}</span></span></button><span class="sr-only" aria-live="polite">{copyStatus()}</span></div>` : null;
  const paginationFallback = paginationControls ? `<div data-slot="pagination" class=${JSON.stringify(KUMO_PAGINATION_ROOT_CLASS)}><div aria-live="polite" aria-atomic="true" data-slot="pagination-info" class=${JSON.stringify(KUMO_PAGINATION_INFO_CLASS)}>Showing <span class="tabular-nums">{((props.page as number) - 1) * (props.perPage as number) + 1}-{Math.min((props.page as number) * (props.perPage as number), props.totalCount as number)}</span> of <span class="tabular-nums">{props.totalCount as number}</span></div><div data-slot="pagination-controls" class=${JSON.stringify(KUMO_PAGINATION_CONTROLS_CLASS)}><nav ref={navEl} aria-label={(props.labels as {navigation?: string} | undefined)?.navigation ?? "Pagination"}><div data-slot="input-group" data-focus-mode="individual" class=${JSON.stringify(KUMO_PAGINATION_GROUP_CLASS)}>{props.fixtureMode !== "simple" ? <button data-kumo-component="Button" type="button" class=${JSON.stringify(KUMO_PAGINATION_BUTTON_CLASS)} aria-label="First page" disabled={clampPage(props.page as number) === 1} onClick={() => proposePage(1)}><span class="contents">${KUMO_PAGINATION_FIRST_SVG}</span></button> : undefined}<button data-kumo-component="Button" type="button" class=${JSON.stringify(KUMO_PAGINATION_BUTTON_CLASS)} aria-label={(props.labels as {previousPage?: string} | undefined)?.previousPage ?? "Previous page"} disabled={clampPage(props.page as number) === 1} onClick={() => proposePage(currentPage() - 1)}><span class="contents">${KUMO_PAGINATION_PREV_SVG}</span></button>{props.fixtureMode !== "simple" ? <input aria-label="Page number" class=${JSON.stringify(KUMO_PAGINATION_INPUT_CLASS)} style="width:50px" attr:value={inputValue()} onInput={pageInput} onKeyDown={pageKeyDown} onBlur={pageBlur} /> : undefined}<button data-kumo-component="Button" type="button" class=${JSON.stringify(KUMO_PAGINATION_BUTTON_CLASS)} aria-label={(props.labels as {nextPage?: string} | undefined)?.nextPage ?? "Next page"} disabled={clampPage(props.page as number) === maxPage()} onClick={() => proposePage(currentPage() + 1)}><span class="contents">${KUMO_PAGINATION_NEXT_SVG}</span></button>{props.fixtureMode !== "simple" ? <button data-kumo-component="Button" type="button" class=${JSON.stringify(KUMO_PAGINATION_BUTTON_CLASS)} aria-label="Last page" disabled={clampPage(props.page as number) === maxPage()} onClick={() => proposePage(maxPage())}><span class="contents">${KUMO_PAGINATION_LAST_SVG}</span></button> : undefined}</div></nav></div></div>` : null;
  // Radio mirrors canonical hydrated Base UI structure, including label/control ids,
  // fieldset/legend linkage, roving tabindex, and the visually-hidden native input.
  const radioFallback = radioGroup ? `<div ref={radioRoot} role="radiogroup"><fieldset class="flex flex-col gap-4" aria-labelledby={radioFixture().legend ? radioLegendId : undefined}>{radioFixture().legend ? <div id={radioLegendId} class=${JSON.stringify(KUMO_RADIO_LEGEND_CLASS)}>{radioFixture().legend}</div> : undefined}<div class="flex flex-col gap-2"><For each={radioFixture().items} children={(item, index) => <label id={radioLabelId(index())} data-kumo-component="Radio" data-kumo-part="item-label" class=${JSON.stringify(KUMO_RADIO_LABEL_CLASS)}><span id={radioItemId(index())} data-kumo-component="Radio" data-kumo-part="item" class=${JSON.stringify(KUMO_RADIO_ITEM_CLASS)} role="radio" tabindex={selectedValue() === item.value && !(radioFixture().disabled || item.disabled) ? 0 : -1} aria-checked={selectedValue() === item.value} aria-labelledby={radioLabelId(index())} aria-disabled={Boolean(radioFixture().disabled || item.disabled) || undefined} data-composite-item-active={selectedValue() === item.value ? "" : undefined} data-checked={selectedValue() === item.value ? "" : undefined} data-unchecked={selectedValue() === item.value ? undefined : ""} onClick={event => { event.preventDefault(); selectRadio(item); }} onKeyDown={event => radioKeyDown(event, index())}><span class=${JSON.stringify(KUMO_RADIO_INDICATOR_CLASS)} data-checked={selectedValue() === item.value ? "" : undefined} data-unchecked={selectedValue() === item.value ? undefined : ""}><span class=${JSON.stringify(KUMO_RADIO_DOT_CLASS)} /></span></span><input id={radioInputId(index())} type="radio" tabindex="-1" aria-hidden="true" value={item.value} attr:checked={selectedValue() === item.value ? "" : undefined} disabled={Boolean(radioFixture().disabled || item.disabled) || undefined} style=${JSON.stringify(KUMO_CHECKBOX_HIDDEN_INPUT_STYLE)} onChange={() => { if (selectedValue() !== item.value) selectRadio(item); }} /><span class=${JSON.stringify(KUMO_RADIO_LABEL_TEXT_CLASS)}>{item.label}</span></label>} /></div></fieldset></div>` : null;
  // Tabs renders the SAME tree React canonical does: an outer isolate div wrapping a
  // recessed background div + the role=tablist div; the selected pill is a floating
  // sibling div[role=presentation] (React never nests an indicator span inside a tab).
  const tabsFallback = tabsNavigation ? `<div data-orientation="horizontal" class=${JSON.stringify(KUMO_TABS_ROOT_CLASS)}><div class=${JSON.stringify(KUMO_TABS_BG_CLASS)} /><div role="tablist" class=${JSON.stringify(KUMO_TABS_LIST_REAL_CLASS)}><For each={props.tabs as TabItem[]} children={(item, index) => <button ref={element => { tabElements[index()] = element; }} type="button" role="tab" data-kumo-component="Tabs" data-kumo-part="tab" class=${JSON.stringify(KUMO_TABS_TRIGGER_REAL_CLASS)} aria-selected={selectedValue() === item.value} tabindex={focusedIndex() === index() ? 0 : -1} onClick={() => commitTab(item.value)} onFocus={() => setFocusedIndex(index())} onKeyDown={event => tabKeyDown(event, index())}>{item.label}</button>} /><div role="presentation" hidden class=${JSON.stringify(KUMO_TABS_FLOAT_CLASS)} /></div></div>` : null;
  // React canonical <nav> carries the VERBATIM class string (menubar-m12wcbbucuszspw4.js):
  // "isolate flex rounded-lg ring ring-kumo-line bg-kumo-recessed pl-px shadow-xs transition-colors".
  // The shared menubarNavigation.root.classes model drops `ring pl-px shadow-xs transition-colors`
  // (pl-px is the paddingLeft/1px nav-width delta the sweep flagged); vue hardcodes the full string
  // and passes, so solid emits it verbatim too. Option buttons carry React's real option classes
  // (with the active-state pill) — no lookalike, no innerHTML.
  const menubarFallback = menubarNavigation ? `<nav class="isolate flex rounded-lg ring ring-kumo-line bg-kumo-recessed pl-px shadow-xs transition-colors"><For each={props.options as MenuBarOption[]} children={(item, index) => <button ref={element => { menuButtons[index()] = element; }} data-kumo-component="MenuBar" data-kumo-part="option" data-base-ui-tooltip-trigger="" aria-label={item.tooltip} class={props.isActive === index() ? "relative -ml-px flex h-full w-11 cursor-pointer items-center justify-center rounded-md border-none first:rounded-l-lg last:rounded-r-lg focus:z-3 focus:outline-none focus:ring-kumo-focus/50 focus-visible:z-3 focus-visible:ring-2 focus-visible:ring-kumo-brand z-2 bg-kumo-base shadow-xs transition-colors" : "relative -ml-px flex h-full w-11 cursor-pointer items-center justify-center rounded-md border-none bg-kumo-recessed first:rounded-l-lg last:rounded-r-lg transition-colors focus:z-3 focus:outline-none focus:ring-kumo-focus/50 focus-visible:z-3 focus-visible:ring-2 focus-visible:ring-kumo-brand"} onClick={() => item.onClick?.()} onKeyDown={event => menuKeyDown(event, index())}>{item.icon}</button>} /></nav>` : null;
  const dialogFallback = dialogLayer ? `<><button ref={triggerElement} type="button" data-kumo-component="Dialog" data-kumo-part="trigger" aria-haspopup="dialog" aria-expanded={dialogOpen()} class={dialogOpen() ? ${JSON.stringify(KUMO_OVERLAY_BUTTON_CLASS)} : undefined} onClick={() => setDialogOpen(true)}>{props.Trigger != null ? fixtureText(props.Trigger) : compoundFixtureText(props.fixture, ".Trigger")}</button><Show when={dialogOpen()} children={<div data-base-ui-portal=""><div role="presentation" style="position:fixed;inset:0;user-select:none"></div><div role="presentation" class=${JSON.stringify(KUMO_DIALOG_BACKDROP_CLASS)}></div><span aria-hidden="true" tabindex="0" style=${JSON.stringify(KUMO_OVERLAY_GUARD_STYLE)}></span><div ref={dialogElement} role="dialog" tabindex="-1" class=${JSON.stringify(KUMO_DIALOG_CONTENT_CLASS)} style="transition-property:scale,opacity;transition-timing-function:var(--default-transition-timing-function);--tw-shadow:0 20px 25px -5px rgb(0 0 0 / 0.03),0 8px 10px -6px rgb(0 0 0 / 0.03)" onKeyDown={dialogKeyDown}><h2>{compoundFixtureText(props.fixture, ".Title")}</h2><p>{compoundFixtureText(props.fixture, ".Description")}</p><button type="button" data-kumo-component="Dialog" data-kumo-part="close" class=${JSON.stringify(KUMO_OVERLAY_BUTTON_CLASS)} onClick={() => setDialogOpen(false)}>{compoundFixtureText(props.fixture, ".Close")}</button></div><span aria-hidden="true" tabindex="0" style=${JSON.stringify(KUMO_OVERLAY_GUARD_STYLE)}></span></div>} /></>` : null;
  const popoverFallback = popoverLayer ? `<><Show when={popoverOpen()} children={<span aria-hidden="true" tabindex="0" style=${JSON.stringify(KUMO_OVERLAY_GUARD_STYLE)}></span>} /><button ref={popoverTrigger} type="button" tabindex="0" aria-haspopup="dialog" aria-expanded={popoverOpen()} data-kumo-component="Popover" data-kumo-part="trigger" class={popoverOpen() ? ${JSON.stringify(KUMO_OVERLAY_BUTTON_CLASS)} : undefined} onClick={() => setPopoverOpen(!popoverOpen())} onKeyDown={popoverKeyDown}>{popoverTriggerText()}</button><Show when={popoverOpen()} children={<><span aria-hidden="true" tabindex="0" style=${JSON.stringify(KUMO_OVERLAY_GUARD_STYLE)}></span><div data-base-ui-portal=""><div role="presentation" style="position:absolute;left:0;top:0;transform:translate(4px,44px)"><span aria-hidden="true" tabindex="0" style=${JSON.stringify(KUMO_OVERLAY_GUARD_STYLE)}></span><div ref={popoverContent} role="dialog" data-side={popoverSide()} data-align={popoverContentProps().align as string ?? "center"} data-position-method={popoverContentProps().positionMethod as string ?? "absolute"} class=${JSON.stringify(KUMO_POPOVER_CONTENT_CLASS)} onKeyDown={popoverKeyDown}><div aria-hidden="true" data-side={popoverSide()} class=${JSON.stringify(KUMO_POPOVER_ARROW_CLASS)} style="position:absolute;left:44.5px">${KUMO_POPOVER_ARROW_SVG}</div><h2 class="m-0 text-base leading-6 font-medium">{compoundFixtureText(props.fixture, ".Title")}</h2><p class="m-0 text-base leading-6 text-kumo-subtle">{compoundFixtureText(props.fixture, ".Description")}</p></div><span aria-hidden="true" tabindex="0" style=${JSON.stringify(KUMO_OVERLAY_GUARD_STYLE)}></span></div></div><span aria-hidden="true" tabindex="0" style=${JSON.stringify(KUMO_OVERLAY_GUARD_STYLE)}></span><span style="clip-path:inset(50%);position:fixed;top:0;left:0"></span><span aria-hidden="true" tabindex="0" style=${JSON.stringify(KUMO_OVERLAY_GUARD_STYLE)}></span></>} /></>` : null;
  const selectFallback = selectCollection ? `<div class=${JSON.stringify(KUMO_SELECT_ROOT_CLASS)}><button ref={selectTrigger} type="button" tabindex="0" role="combobox" aria-expanded={selectOpen()} aria-haspopup="listbox" aria-label={props["aria-label"] as string} data-kumo-component="Select" data-kumo-part="trigger" class={[${JSON.stringify(KUMO_SELECT_TRIGGER_CLASS)}, (props.className as string | undefined) ?? "w-max"].filter(Boolean).join(" ")} onClick={() => setSelectOpen(!selectOpen())} onKeyDown={selectKeyDown}><span class=${JSON.stringify(KUMO_SELECT_VALUE_CLASS)}>{selectLabel()}</span><span aria-hidden="true" class=${JSON.stringify(KUMO_SELECT_ICON_CLASS)}>${KUMO_SELECT_CHEVRON_SVG}</span></button><input tabindex="-1" aria-hidden="true" style=${JSON.stringify(KUMO_CHECKBOX_HIDDEN_INPUT_STYLE)} attr:value={selectValue() != null ? String(selectValue()) : ""} /><Show when={selectOpen()} children={<div role="listbox"><For each={selectOptions()} children={(item, index) => <div ref={element => { selectElements[index()] = element; }} role="option" tabindex="-1" aria-disabled={item.disabled || undefined} onClick={() => selectOption(item, index())} onKeyDown={selectKeyDown}>{item.label}</div>} /></div>} /></div>` : null;
  const dropdownFallback = dropdownMenuLayer ? `<><Show when={dropdownOpen()} children={<span aria-hidden="true" tabindex="0" style=${JSON.stringify(KUMO_OVERLAY_GUARD_STYLE)}></span>} /><button ref={dropdownTrigger} id="kumo-dropdown-trigger" type="button" tabindex="0" aria-haspopup="menu" aria-expanded={false} data-kumo-component={dropdownOpen() || dropdownTriggerHasIcon() ? "Button" : undefined} class={dropdownOpen() || dropdownTriggerHasIcon() ? ${JSON.stringify(KUMO_OVERLAY_BUTTON_CLASS)} : undefined} onClick={toggleDropdownFromPointer} onKeyDown={dropdownTriggerKeyDown}>{dropdownTriggerHasIcon() ? <>${KUMO_PLUS_ICON_SVG}<span class="contents">{dropdownTriggerText()}</span></> : dropdownTriggerText()}</button><Show when={dropdownOpen() && dropdownCanonicalOverlay()} children={<><span aria-hidden="true" tabindex="0" data-base-ui-focus-guard="" style=${JSON.stringify(KUMO_OVERLAY_GUARD_STYLE)}></span><span data-type="outside" aria-hidden="true" tabindex="0" data-base-ui-focus-guard="" style=${JSON.stringify(KUMO_OVERLAY_GUARD_STYLE)}></span><span aria-owns="kumo-dropdown-menu" style="clip-path:inset(50%);position:fixed;top:0;left:0"></span><span data-type="outside" aria-hidden="true" tabindex="0" data-base-ui-focus-guard="" style=${JSON.stringify(KUMO_OVERLAY_GUARD_STYLE)}></span></>} /><Show when={dropdownOpen()} children={<><div ref={relocateDropdownPortal} id="kumo-dropdown-menu" data-base-ui-portal=""><div role="presentation" style="position:absolute;left:0;top:0;transform:translate(-19px,44px)"><span aria-hidden="true" tabindex="0" style=${JSON.stringify(KUMO_OVERLAY_GUARD_STYLE)}></span><div ref={dropdownMenu} role="menu" aria-labelledby="kumo-dropdown-trigger" class=${JSON.stringify(KUMO_DROPDOWN_CONTENT_CLASS)}><For each={dropdownItems()} children={item => <div role="menuitem" tabindex="-1" aria-disabled={item.disabled || undefined} data-kumo-component="DropdownMenu" data-kumo-part="item" data-disabled={item.disabled ? "" : undefined} class=${JSON.stringify(KUMO_DROPDOWN_ITEM_CLASS)} onClick={event => selectDropdownItem(item, event)} onKeyDown={event => dropdownItemKeyDown(event, item)}>{item.text}</div>} /></div><span aria-hidden="true" tabindex="0" style=${JSON.stringify(KUMO_OVERLAY_GUARD_STYLE)}></span></div></div></>} /></>` : null;
  // The prop-less closed state mirrors live Kumo chrome. Explicit open/defaultOpen
  // continues through the existing observable collection branch unchanged.
  const comboboxFallback = comboboxCollection ? `incoming.open === undefined && incoming.defaultOpen === undefined && !comboboxOpen() ? <><div class=${JSON.stringify(KUMO_COMBOBOX_ROOT_CLASS)}><input ref={comboboxInput} autocomplete="off" spellcheck="false" autocorrect="off" autocapitalize="none" role="combobox" aria-expanded="false" aria-haspopup="listbox" aria-autocomplete="list" type="text" placeholder={comboboxTrigger().props.placeholder as string} class=${JSON.stringify(KUMO_COMBOBOX_INPUT_CLASS)} attr:value={comboboxQuery()} onClick={openCombobox} onFocus={openCombobox} onInput={comboboxOnInput} onKeyDown={comboboxKeyDown} /><button type="button" data-placeholder="" tabindex="0" aria-expanded="false" aria-haspopup="dialog" data-kumo-component="Combobox" data-kumo-part="trigger" aria-label="Show options" class=${JSON.stringify(KUMO_COMBOBOX_TRIGGER_CLASS)} onClick={openCombobox} onKeyDown={comboboxKeyDown}><span aria-hidden="true" class="flex items-center">${KUMO_COMBOBOX_CHEVRON_SVG}</span></button></div><input style=${JSON.stringify(KUMO_CHECKBOX_HIDDEN_INPUT_STYLE)} tabindex="-1" aria-hidden="true" attr:value={comboboxQuery()} /></> : <><input ref={comboboxInput} role="combobox" aria-expanded={comboboxOpen()} aria-haspopup="listbox" aria-autocomplete="list" placeholder={comboboxTrigger().props.placeholder as string} style=${JSON.stringify(KUMO_CHECKBOX_HIDDEN_INPUT_STYLE.replace('clip-path:inset(50%);', '').replace('margin:-1px;', 'margin:0;'))} value={comboboxQuery()} onClick={openCombobox} onInput={comboboxOnInput} onKeyDown={comboboxKeyDown} /><Show when={comboboxOpen() && filteredComboboxItems().length > 0} children={<ul role="listbox"><For each={filteredComboboxItems()} children={(item, index) => <li role="option" tabindex="-1" data-value={item.value} aria-selected={highlightedIndex() === index()} aria-disabled={Boolean(item.props.disabled) || undefined} onPointerDown={event => selectComboboxItem(item, event)}>{fixtureText(item)}</li>} /></ul>} /></>` : null;
  const autocompleteFallback = autocompleteCollection ? `<><input ref={autocompleteInput} aria-hidden="true" tabindex="-1" style=${JSON.stringify(KUMO_CHECKBOX_HIDDEN_INPUT_STYLE)} value={autocompleteValue()} onInput={autocompleteOnInput} onKeyDown={autocompleteKeyDown} /><Show when={autocompleteOpen() && autocompleteItems().length > 0} children={<ul role="listbox"><For each={autocompleteItems()} children={(item, index) => <li role="option" data-value={item.value} aria-selected={autocompleteHighlightedIndex() === index()}>{fixtureText(item)}</li>} /></ul>} /></>` : null;
  const sensitiveHintId = sensitiveInput ? `kumo-${crypto.createHash('sha256').update(model.modelDigest).digest('hex').slice(0,12)}-sensitive-hint` : null;
  const sensitiveStatusId = sensitiveInput ? `kumo-${crypto.createHash('sha256').update(model.modelDigest).digest('hex').slice(0,12)}-sensitive-status` : null;
  const sensitiveInputFallback = sensitiveInput ? `<div><div role="button" data-kumo-component="SensitiveInput" data-kumo-part="masked-container" tabindex="0" class=${JSON.stringify(KUMO_SENSITIVE_CONTAINER_CLASS)} aria-label="Sensitive value, masked." aria-describedby=${JSON.stringify(`${sensitiveHintId} ${sensitiveStatusId}`)} aria-disabled="false" onClick={revealSensitive}><input ref={sensitiveInputElement} type="password" readonly tabindex="-1" aria-hidden="true" aria-label={props.label as string} class=${JSON.stringify(KUMO_SENSITIVE_INPUT_CLASS)} attr:value={sensitiveValue()} onInput={sensitiveOnInput} onKeyDown={sensitiveOnKeyDown} /><span class=${JSON.stringify(KUMO_SENSITIVE_MASK_CLASS)} aria-hidden="true"><span class="relative"><span class=${JSON.stringify(KUMO_SENSITIVE_DOTS_CLASS)}>\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022</span><span class=${JSON.stringify(KUMO_SENSITIVE_REVEAL_CLASS)}>Click to reveal</span></span></span><button type="button" data-kumo-component="SensitiveInput" data-kumo-part="toggle-visibility" aria-label="Reveal value" tabindex="-1" class=${JSON.stringify(KUMO_SENSITIVE_EYE_CLASS)} onClick={revealSensitive}>${KUMO_SENSITIVE_EYE_SVG}</button><button type="button" data-kumo-component="SensitiveInput" data-kumo-part="copy" aria-label="Copy to clipboard" class=${JSON.stringify(KUMO_SENSITIVE_COPY_CLASS)} onClick={copySensitive}>Copy</button></div><span id=${JSON.stringify(sensitiveHintId)} class="sr-only">Click or press Enter to reveal.</span><span id=${JSON.stringify(sensitiveStatusId)} class="sr-only" aria-live="polite">{sensitiveAnnouncement()}</span></div>` : null;
  // InputGroup renders React canonical's tree: a single <label data-slot="input-group">
  // acting as the focus container, with the composed children (addons/input/button/suffix)
  // inline. React SSR with only text children emits exactly this label wrapping the text —
  // reading props.fixture (absent under canonical props) is what previously threw.
  const inputGroupFallback = inputGroupComposition ? `<label data-slot="input-group" data-focus-mode="container" class=${JSON.stringify(KUMO_INPUT_GROUP_LABEL_CLASS)}>{props.children}</label>` : null;
  const datePickerFallback = datePicker ? `<div class="rdp-root select-none rounded-xl bg-kumo-base"><div class="rdp-months"><nav data-animated-nav="true" class="rdp-nav" aria-label="Navigation bar"><button type="button" class="rdp-button_previous" aria-label="Go to the Previous Month"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" class="rdp-chevron"><path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"></path></svg></button><button type="button" class="rdp-button_next" aria-label="Go to the Next Month"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" class="rdp-chevron"><path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path></svg></button></nav><div data-animated-month="true" class="rdp-month"><div data-animated-caption="true" class="rdp-month_caption"><span class="rdp-caption_label" role="status" aria-live="polite">{datePickerCaption()}</span></div><table role="grid" aria-multiselectable="false" aria-label={datePickerCaption()} class="rdp-month_grid"><thead aria-hidden="true"><tr data-animated-weekdays="true" class="rdp-weekdays"><For each={DATE_PICKER_WEEKDAYS} children={weekday => <th aria-label={weekday.full} class="rdp-weekday" scope="col">{weekday.short}</th>} /></tr></thead><tbody data-animated-weeks="true" class="rdp-weeks"><For each={datePickerWeeks()} children={week => <tr class="rdp-week"><For each={week} children={day => <td class={day.className} role="gridcell" aria-label={day.label} data-day={day.iso} data-month={day.inMonth ? undefined : day.monthStr} data-outside={day.inMonth ? undefined : "true"} data-today={day.isToday ? "true" : undefined} onClick={event => selectDate(day, event)}>{day.day}</td>} /></tr>} /></tbody></table></div></div></div>` : null;
  const dateRangePickerFallback = dateRangePicker ? `<div ref={dateRangeRoot} class="flex w-fit flex-col rounded-xl select-none bg-kumo-overlay p-4 gap-2.5"><div class="flex gap-4"><For each={rangeMonths()} children={(month, monthIndex) => <div class="relative w-[196px]">{monthIndex() === 0 ? <button type="button" aria-label="Previous month" class="absolute top-0 left-0 cursor-pointer rounded bg-kumo-interact/85 p-1.5 hover:bg-kumo-interact" onClick={() => moveRangeMonth(-1)}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"></path></svg></button> : <button type="button" aria-label="Next month" class="absolute top-0 right-0 cursor-pointer rounded bg-kumo-interact/85 p-1.5 hover:bg-kumo-interact" onClick={() => moveRangeMonth(1)}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path></svg></button>}<div><div class="mb-3 text-center"><input aria-label="Edit month and year" class="w-full rounded-md border-none bg-transparent py-1.5 text-center font-semibold text-kumo-default transition-all duration-200 focus:outline-none focus:ring-kumo-focus/50 focus:ring-[1.5px] text-sm" attr:value={month.label} /></div><div class="mt-2 grid grid-cols-7 gap-1"><For each={DATE_RANGE_WEEKDAYS} children={weekday => <div class="h-[22px] text-center text-kumo-subtle w-7 text-sm">{weekday}</div>} /></div></div><div class="grid grid-cols-7 gap-0 gap-y-0.5"><For each={month.days} children={day => <button type="button" aria-label={day.label} id={day.id} class={day.className} onClick={() => selectRangeDay(day.iso)}>{day.day}</button>} /></div></div>} /></div><div class="flex items-center gap-2 text-kumo-subtle text-sm"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm88,104a87.62,87.62,0,0,1-6.4,32.94l-44.7-27.49a15.92,15.92,0,0,0-6.24-2.23l-22.82-3.08a16.11,16.11,0,0,0-16,7.86h-8.72l-3.8-7.86a15.91,15.91,0,0,0-11-8.67l-8-1.73L96.14,104h16.71a16.06,16.06,0,0,0,7.73-2l12.25-6.76a16.62,16.62,0,0,0,3-2.14l26.91-24.34A15.93,15.93,0,0,0,166,49.1l-.36-.65A88.11,88.11,0,0,1,216,128ZM143.31,41.34,152,56.9,125.09,81.24,112.85,88H96.14a16,16,0,0,0-13.88,8l-8.73,15.23L63.38,84.19,74.32,58.32a87.87,87.87,0,0,1,69-17ZM40,128a87.53,87.53,0,0,1,8.54-37.8l11.34,30.27a16,16,0,0,0,11.62,10l21.43,4.61L96.74,143a16.09,16.09,0,0,0,14.4,9h1.48l-7.23,16.23a16,16,0,0,0,2.86,17.37l.14.14L128,205.94l-1.94,10A88.11,88.11,0,0,1,40,128Zm102.58,86.78,1.13-5.81a16.09,16.09,0,0,0-4-13.9,1.85,1.85,0,0,1-.14-.14L120,174.74,133.7,144l22.82,3.08,45.72,28.12A88.18,88.18,0,0,1,142.58,214.78Z"></path></svg><span class="flex-1">{'Timezone: '}{DATE_RANGE_TIMEZONE}</span><button type="button" class="cursor-pointer font-semibold text-kumo-default underline underline-offset-2" onClick={resetDateRange}>Reset Dates</button></div></div>` : null;
  const sidebarFallback = responsiveSidebar ? `sidebarKind() === "collapsible" ? <div></div> : <div data-sidebar-wrapper="" data-state={sidebarState()} data-side="left" data-open={sidebarOpen()} data-width={sidebarWidth()}><aside data-state={sidebarState()} data-side="left" data-collapsible="icon">{sidebarKind() === "expanded" ? <><span>{sidebarText(".Header")}</span><span>{sidebarText(".GroupLabel")}</span><ul><For each={sidebarMenuButtons()} children={item => <li><button type="button">{fixtureText(item)}</button></li>} /></ul><span>{sidebarText(".Footer")}</span><button type="button" aria-expanded={sidebarOpen()} aria-label={sidebarOpen() ? "Collapse sidebar" : "Expand sidebar"}></button></> : undefined}{sidebarKind() === "resize" ? <div ref={sidebarResizeHandle} role="separator" tabindex="0" aria-label=${JSON.stringify(responsiveSidebar.resize.label)} onKeyDown={sidebarResizeKeyDown}></div> : undefined}</aside></div>` : null;
  // NOTE: do not wrap the two expressions below in a `<>...</>` Fragment. Solid's
  // JSX transform (babel-plugin-jsx-dom-expressions) only allows a Fragment as the
  // SOLE top-level child of its parent; `.Provider` here receives it as its sole
  // `children` prop, which should be legal, but empirically the reactive ternary
  // inside that Fragment never re-ran on manager updates (confirmed: the manager's
  // subscribe callback DOES fire with the correct new toast list, but the DOM never
  // updates). Passing the two expressions as a bare adjacent JSX sequence (which
  // `.Provider`'s children prop accepts directly, same as any component) fixes
  // reactivity and avoids the ambiguous nested-Fragment case entirely.
  const toastFallback = toastLifecycle ? `<ToastManagerContext.Provider value={manager}>{props.children}<Show when={toastMounted()} children={<div tabindex="-1" role="region" aria-live="polite" aria-atomic="false" aria-relevant="additions text" aria-label="Notifications" data-kumo-component="Toasty" class="fixed top-auto right-4 bottom-4 z-1 mx-auto flex w-[calc(100%-2rem)] sm:right-8 sm:bottom-8 sm:w-[340px]"><For each={toasts()} children={toast => <Toast toast={toast} defaultVariant={props.variant as KumoToastVariant} onClose={id => manager.close(id)} onAction={props.onAction as (() => void) | undefined} />} /></div>} />` + `</ToastManagerContext.Provider>` : null;
  const commandPaletteFallback = commandPalette ? `props.text !== undefined ? <span><For each={highlightSegments()} children={segment => segment.mark ? <mark>{segment.text}</mark> : segment.text} /></span> : <Show when={paletteOpen()} fallback={<></>} children={<div data-base-ui-portal=""><div role="presentation" style="position:fixed;inset:0;user-select:none"></div><div role="presentation" class=${JSON.stringify(KUMO_COMMAND_BACKDROP_CLASS)}></div><span aria-hidden="true" tabindex="0" style=${JSON.stringify(KUMO_OVERLAY_GUARD_STYLE)}></span><div role="dialog" tabindex="-1" class=${JSON.stringify(KUMO_COMMAND_DIALOG_CLASS)} style="transition-property:scale,opacity;transition-timing-function:var(--default-transition-timing-function)"><div class=${JSON.stringify(KUMO_COMMAND_PANEL_CLASS)}><div class=${JSON.stringify(KUMO_COMMAND_INPUT_GROUP_CLASS)} style=${JSON.stringify(KUMO_COMMAND_INPUT_GROUP_STYLE)}>${KUMO_COMMAND_SEARCH_SVG}<span role="button" aria-label="Dismiss" style="clip-path:inset(50%);overflow:hidden;white-space:nowrap;border:0;padding:0;width:1px;height:1px;margin:-1px;position:absolute"></span><input ref={commandPaletteInput} autofocus role="combobox" aria-expanded="true" aria-haspopup="listbox" aria-autocomplete="list" autocomplete="off" spellcheck="false" placeholder={palettePlaceholder()} class=${JSON.stringify(KUMO_COMMAND_INPUT_CLASS)} value={paletteValue()} onInput={commandPaletteOnInput} onKeyDown={commandPaletteKeyDown} /></div><div class=${JSON.stringify(KUMO_COMMAND_LIST_CLASS)}><For each={paletteItems()} children={(item, index) => <div role="option" class=${JSON.stringify(KUMO_COMMAND_ITEM_CLASS)} data-highlighted={highlightedPaletteIndex() === index() ? "" : undefined}>{item.label}</div>} /></div><input tabindex="-1" aria-hidden="true" value={paletteValue()} style=${JSON.stringify(KUMO_OVERLAY_GUARD_STYLE)} /></div></div><span aria-hidden="true" tabindex="0" style=${JSON.stringify(KUMO_OVERLAY_GUARD_STYLE)}></span></div>} />` : null;
   const meterLabelId = model.component === 'meter' ? `kumo-${crypto.createHash('sha256').update(model.modelDigest).digest('hex').slice(0, 12)}-meter-label` : null;
   const meterFallback = model.component === 'meter' ? `<div class=${JSON.stringify(KUMO_METER_ROOT_CLASS)} role="meter" aria-valuenow={props.value as number} aria-valuemin={(props.min as number) ?? 0} aria-valuemax={(props.max as number) ?? 100} aria-valuetext={Math.round((((props.value as number) ?? 0) - ((props.min as number) ?? 0)) / (((((props.max as number) ?? 100) - ((props.min as number) ?? 0)) as number) || 1) * 100) + "%"} aria-labelledby=${JSON.stringify(meterLabelId)}><div class=${JSON.stringify(KUMO_METER_HEADER_CLASS)}><span id=${JSON.stringify(meterLabelId)} role="presentation" class=${JSON.stringify(KUMO_METER_LABEL_CLASS)}>{props.label as JSX.Element}</span>{(props.showValue as boolean) !== false ? <span class=${JSON.stringify(KUMO_METER_VALUE_CLASS)}>{(props.customValue as JSX.Element) ?? ((props.value as number) + "%")}</span> : null}</div><div class=${JSON.stringify(KUMO_METER_TRACK_CLASS)}><div class=${JSON.stringify(KUMO_METER_FILL_CLASS)} style={{ "inset-inline-start": "0", height: "inherit", width: (props.value as number) + "%" }} /></div><span role="presentation" style="clip-path:inset(50%);overflow:hidden;white-space:nowrap;border:0;padding:0;width:1px;height:1px;margin:-1px;position:fixed;top:0;left:0">x</span></div>` : null;
  const fallback = tooltipFallback ?? labelFallback ?? surfaceFallback ?? visualSimpleFallback ?? bannerFallback ?? collapsibleFallback ?? tableOfContentsFallback ?? selectFallback ?? dropdownFallback ?? popoverFallback ?? sidebarFallback ?? dateRangePickerFallback ?? datePickerFallback ?? toastFallback ?? commandPaletteFallback ?? autocompleteFallback ?? comboboxFallback ?? sensitiveInputFallback ?? inputGroupFallback ?? dialogFallback ?? menubarFallback ?? tabsFallback ?? radioFallback ?? paginationFallback ?? clipboardFallback ?? meterFallback ?? (nativeButton
    ? `<button {...mergeTriggerAttributes} id={props.id as string} class={mergeStyles(${nativeButtonVariantExpression(nativeButton, 'props.variant')}, props.class)} style={${nativeButtonEmphasisStyleExpression(nativeButton.emphasis, 'props.variant')}} name={props.name as string} attr:value={props.value as string | undefined} data-probe={props["data-probe"] as string} aria-label={props["aria-label"] as string} type={(props.type as JSX.ButtonHTMLAttributes<HTMLButtonElement>["type"]) ?? "button"} disabled={Boolean(props.disabled || props.loading)} onClick={props.onClick as JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>}>{(${nativeButtonEmphasisCondition(nativeButton.emphasis, 'props.variant')}) ? <><span aria-hidden="true" class=${JSON.stringify(nativeButton.emphasis.overlayClass)} /><span class=${JSON.stringify(nativeButton.emphasis.wrapperClass)}>{props.loading ? ${solidButtonSpinner('props.size === "lg" ? 16 : 14')} : (props.icon as JSX.Element | undefined)}{props.children}</span></> : <>{props.loading ? ${solidButtonSpinner('props.size === "lg" ? 16 : 14')} : (props.icon as JSX.Element | undefined)}{props.children != null ? <span class="contents">{props.children}</span> : undefined}</>}</button>`
    : nativeInputFallback ?? providedFieldFallback ?? checkboxFallback ?? toggleFallback ?? node(root, {component:model.component}));
  for (const op of model.draftImplementation.operations) if (!['render','emit','state','ref','focus','lifecycle','browser-service','portal','style'].includes(op.kind)) throw new Error(`${model.component}: unsupported operation ${op.kind}`);
  const parts = compoundParts(model);
  const partSources = parts.map(part => { const override = compoundPartOverride(model.component, part.path); const tag = override?.tag ?? 'div'; const attributes = override ? (override.className ? `class=${JSON.stringify(override.className)}` : '') : `data-kumo-part=${JSON.stringify(part.path)}`; return `export function ${part.symbol}(props: CompoundPartProps): JSX.Element {\n  const [local, native] = splitProps(props, ["children"]);\n  return <${tag} {...native} ${attributes}>{local.children}</${tag}>;\n}`; }).join('\n\n');
  const attachments = parts.map(part => `Object.defineProperty(${part.path.split('.').reduce((base, segment, index, all) => index === all.length - 1 ? base : `${base}.${all[index]}`, model.public.symbol)}, ${JSON.stringify(part.path.split('.').at(-1))}, {value:${part.symbol}, enumerable:true});`).join('\n');
  const intermediatePaths = [...new Set(parts.flatMap(part => { const segments = part.path.split('.'); return segments.slice(0,-1).map((_, i) => segments.slice(0,i+1).join('.')); }))].sort();
  const intermediates = intermediatePaths.map(pathValue => `Object.defineProperty(${pathValue.split('.').slice(0,-1).reduce((base, segment) => `${base}.${segment}`, model.public.symbol)}, ${JSON.stringify(pathValue.split('.').at(-1))}, {value:{}, enumerable:true});`).join('\n');
  const semantic = (tooltip || nativeInputElement || clipboardCopy || paginationControls || radioGroup || tabsNavigation || menubarNavigation || dialogLayer || popoverLayer || dropdownMenuLayer || selectCollection || inputGroupComposition || sensitiveInput || comboboxCollection || autocompleteCollection || commandPalette || toastLifecycle || datePicker || dateRangePicker || responsiveSidebar || tableOfContents || model.component === 'meter' || banner || collapsible) ? '' : [...variants].sort((a, b) => b.when.length - a.when.length).map(variant => `  if (${variant.when.map(predicate).join(' && ') || 'true'}) return (${node(variant.tree)});`).join('\n');
  return `// @generated by src/kumo/emitters/solid/index.mjs; do not edit\nimport { ${[...imports].sort().join(', ')} } from "solid-js";\n${hasPortal || dialogLayer || dropdownMenuLayer || tooltip ? 'import { Portal } from "solid-js/web";\n' : ''}import type { JSX } from "solid-js";\n\n${toastLifecycle ? SOLID_TOAST_TYPES : `export interface ${model.public.symbol}Props extends Record<string, unknown> { children?: JSX.Element; fixture?: unknown; styles?: Record<string, string>; }\n`}export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }\nexport const modelDigest = ${JSON.stringify(model.modelDigest)};\nexport const contentBindingDigest = ${JSON.stringify(model.contentBindings.capabilityDigest)};\n${hasMergeTrigger || nativeButton ? `const KumoMergeTriggerContext = ((globalThis as any)[Symbol.for("kumo.merge-trigger.context")] ??= createContext<Record<string, string> | undefined>());\n` : ''}export const semanticVariantDigests = ${JSON.stringify(Object.fromEntries(variants.map(v => [v.id, v.expectationDigest])))} as const;\nconst styles: Record<string, string> = ${JSON.stringify(Object.fromEntries(['root', ...model.dependencies.styles].map(x => [x, x])))};\nconst mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");\nconst semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);\nconst normalizeRenderContent = (value: unknown, accessors = false): string => {\n  if (value == null || value === false || value === true) return "";\n  if (typeof value === "string" || typeof value === "number") return String(value);\n  if (Array.isArray(value)) return value.map(item => normalizeRenderContent(item, accessors)).join("");\n  if (accessors && typeof value === "function") return normalizeRenderContent(value(), accessors);\n  if (typeof value === "object") { const item = value as {text?: unknown; children?: unknown}; return (typeof item.text === "string" ? item.text : "") + (Array.isArray(item.children) ? item.children.map(child => normalizeRenderContent(child)).join("") : ""); }\n  return "";\n};\nconst normalizeFixture = (value: unknown): unknown => Array.isArray(value) ? value.map(normalizeFixture) : value && typeof value === "object" ? Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalizeFixture(item)])) : value;\nconst fixtureText = (value: unknown): string => normalizeRenderContent(value);
const compoundFixtureText = (value: unknown, exported: string): string => {
  const visit = (item: unknown): string => {
    if (!item || typeof item !== "object") return "";
    const node = item as {export?: unknown; text?: unknown; children?: unknown[]};
    if (node.export === exported) return fixtureText(node);
    return Array.isArray(node.children) ? node.children.map(visit).join("") : "";
  };
  return visit(value);
};\nconst resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;\n\n${toastLifecycle ? SOLID_TOAST_MANAGER_SOURCE : ''}export function ${model.public.symbol}(incoming: ${model.public.symbol}Props): JSX.Element {\n  const props = ${(nativeButton||paginationControls||radioGroup||tabsNavigation||menubarNavigation||dialogLayer||inputGroupComposition||sensitiveInput||comboboxCollection||autocompleteCollection||commandPalette||toastLifecycle||datePicker||dateRangePicker||responsiveSidebar||popoverLayer||dropdownMenuLayer||selectCollection)?'mergeProps':'Object.assign'}(${JSON.stringify(toggle ? Object.fromEntries(Object.entries(defaults).filter(([name]) => name !== toggle.controlledProp)) : defaults)}, incoming);\n  const fixture = props.fixture;\n  const renderContent = ${toastLifecycle ? '""' : 'normalizeRenderContent(props.children, true)'};\n  const normalizedFixture = normalizeFixture(fixture);\n  const state: Record<string, () => unknown> = {};\n${tableOfContents ? `  type TocNode = {export?: string; text?: string; props?: Record<string, unknown>; children?: TocNode[]};
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
  const selectLabel = () => { const value = selectValue(); if (Array.isArray(value)) return value.map(entry => selectOptions().find(item => semanticEqual(item.value, entry))?.label ?? "").filter(Boolean).join(", ") || String(props.placeholder ?? ""); return selectOptions().find(item => semanticEqual(item.value, value))?.label ?? (value != null ? String(value) : String(props.placeholder ?? "")); };
  const highlightSelect = (index: number) => { const items=selectOptions(); if (!items.length) return; let next=Math.max(0,Math.min(items.length-1,index)); while (items[next]?.disabled && next<items.length-1) next++; while (items[next]?.disabled && next>0) next--; if (items[next]?.disabled) return; setActiveSelectIndex(next); (props.onItemHighlighted as ((value:unknown)=>void)|undefined)?.(items[next].value); queueMicrotask(() => { const element=selectElements[next]; element?.focus(); element?.scrollIntoView?.({block:"nearest"}); element?.setAttribute("data-highlight-scrolled", "true"); }); };
  const selectOption = (item: SelectOption, index: number) => { if (props.disabled || item.disabled) return; let next: unknown = item.value; if (props.multiple) { const current=Array.isArray(selectValue()) ? selectValue() as unknown[] : []; next=current.some(value=>semanticEqual(value,item.value)) ? current : [...current,item.value]; } if (!hasValue) setOwnValue(next); (props.onSelect as ((value:unknown)=>void)|undefined)?.(item.value); (props.onValueChange as ((value:unknown)=>void)|undefined)?.(next); if (!props.multiple) { setSelectOpen(false); if (hasOpen) highlightSelect(index); else queueMicrotask(()=>selectTrigger?.focus()); } };
  const selectKeyDown = (event: KeyboardEvent) => { if (props.disabled) return; const items=selectOptions(); if (event.key === "Tab") { if (selectOpen()) setSelectOpen(false); event.preventDefault(); queueMicrotask(()=>selectTrigger?.focus()); return; } if (event.key === "Escape") { event.preventDefault(); setSelectOpen(false); queueMicrotask(()=>selectTrigger?.focus()); return; } if (!selectOpen() && event.key === "ArrowDown") { event.preventDefault(); setSelectOpen(true); highlightSelect(Math.max(0, items.findIndex(item=>semanticEqual(item.value,selectValue())))); return; } if (!selectOpen()) return; let index=-1; if (event.key === "Home") index=0; else if (event.key === "End") index=items.length-1; else if (event.key === "ArrowDown") index=activeSelectIndex()+1; else if (event.key.length === 1) index=items.findIndex(item=>!item.disabled && item.label.toLowerCase().startsWith(event.key.toLowerCase())); else return; if(index>=0){event.preventDefault();highlightSelect(index);} };
` : ''}${dropdownMenuLayer ? `  type DropdownFixtureNode = {export?: string; props?: Record<string, unknown>; text?: string; children?: DropdownFixtureNode[]};
  const dropdownFixture = () => props.fixture as DropdownFixtureNode;
  const dropdownCanonicalOverlay = () => dropdownFixture()?.export === undefined;
  const findDropdownPart = (exported: string, value: DropdownFixtureNode = dropdownFixture()): DropdownFixtureNode | undefined => value?.export === exported ? value : value?.children?.map(child => findDropdownPart(exported, child)).find(Boolean);
  const dropdownTriggerText = () => fixtureText(findDropdownPart(".Trigger")) || ${JSON.stringify(dropdownMenuLayer.trigger.text)};
  const dropdownTriggerHasIcon = () => { const icon = findDropdownPart(".Trigger")?.props?.${dropdownMenuLayer.trigger.icon.fixtureProp}; return icon === ${JSON.stringify(dropdownMenuLayer.trigger.icon.export)} || (typeof icon === "object" && (icon as DropdownFixtureNode)?.export === ${JSON.stringify(dropdownMenuLayer.trigger.icon.export)}); };
  const dropdownItems = () => (findDropdownPart(".Content")?.children ?? []).map(node => node.export === ".Sub" ? findDropdownPart(".SubTrigger", node)! : node).filter(node => node?.export === ".Item" || node?.export === ".SubTrigger").map(node => ({node, text:fixtureText(node), disabled:Boolean(node.props?.disabled), submenu:node.export === ".SubTrigger"}));
  const dropdownSubItems = () => (findDropdownPart(".SubContent")?.children ?? []).filter(node => node.export === ".Item").map(node => ({text:fixtureText(node)}));
  const controlled = incoming.open !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = createSignal(Boolean(incoming.defaultOpen));
  const [submenuOpen, setSubmenuOpen] = createSignal(false);
  const dropdownOpen = () => controlled ? Boolean(props.open) : uncontrolledOpen();
  let dropdownTrigger: HTMLButtonElement | undefined;
  let dropdownMenu: HTMLDivElement | undefined;
  const relocateDropdownPortal = (node: HTMLDivElement) => {
    let disposed = false;
    // Solid invokes refs while constructing a Show branch, before the branch is
    // inserted at its marker. Relocating synchronously lets that insertion move
    // the node back inline, so defer until the branch's DOM insertion completes.
    queueMicrotask(() => { if (!disposed && typeof document !== "undefined") document.body.appendChild(node); });
    onCleanup(() => { disposed = true; node.remove(); });
  };
  const setDropdownOpen = (next: boolean) => { if (!controlled) setUncontrolledOpen(next); (props.onOpenChange as ((open: boolean) => void) | undefined)?.(next); };
  const focusFirstDropdownItem = () => queueMicrotask(() => dropdownMenu?.querySelector<HTMLElement>('[role="menuitem"]:not([data-disabled])')?.focus());
  const closeDropdown = () => { setSubmenuOpen(false); setDropdownOpen(false); queueMicrotask(() => dropdownTrigger?.focus()); };
  const toggleDropdownFromPointer = () => { const next = !dropdownOpen(); setDropdownOpen(next); if (next) focusFirstDropdownItem(); };
  const dropdownTriggerKeyDown = (event: KeyboardEvent) => { if (event.key === ${JSON.stringify(dropdownMenuLayer.keyboard.dismissKey)} && dropdownOpen()) { event.preventDefault(); closeDropdown(); return; } if (event.key !== ${JSON.stringify(dropdownMenuLayer.keyboard.openKey)}) return; event.preventDefault(); setDropdownOpen(true); focusFirstDropdownItem(); };
  const dropdownDocumentKeyDown = (event: KeyboardEvent) => { if (event.defaultPrevented || event.key !== ${JSON.stringify(dropdownMenuLayer.keyboard.dismissKey)} || !dropdownOpen()) return; event.preventDefault(); closeDropdown(); };
  onMount(() => { document.addEventListener("keydown", dropdownDocumentKeyDown); onCleanup(() => document.removeEventListener("keydown", dropdownDocumentKeyDown)); });
  const selectDropdownItem = (item: {text: string; disabled: boolean}, event: MouseEvent) => { if (item.disabled) { event.preventDefault(); return; } (props.onSelect as ((value: string) => void) | undefined)?.(item.text); setDropdownOpen(false); setDropdownOpen(false); queueMicrotask(() => (document.activeElement as HTMLElement | null)?.blur()); };
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
` : ''}${dateRangePicker ? `  type DateRangeDay = {iso: string; day: number; inMonth: boolean; className: string; label: string; id: string};
  type DateRangeMonth = {key: string; label: string; days: DateRangeDay[]};
  const DATE_RANGE_MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const DATE_RANGE_MONTH_ABBR = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const DATE_RANGE_WEEKDAY_FULL = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const DATE_RANGE_WEEKDAY_ABBR = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const DATE_RANGE_WEEKDAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];
  const DATE_RANGE_TIMEZONE = "New York, NY, USA (GMT-4)";
  const DATE_RANGE_DAY_IN = "h-[26px] w-7 text-sm cursor-pointer text-center transition-all duration-[50] leading-[26px] hover:bg-kumo-interact bg-transparent text-kumo-default";
  const DATE_RANGE_DAY_OUT = "h-[26px] w-7 text-sm cursor-pointer text-center text-kumo-default transition-all duration-[50] leading-[26px] bg-transparent !text-kumo-subtle";
  const initialRangeMonth = (() => { const today=new Date(); return today.getFullYear()+"-"+String(today.getMonth()+1).padStart(2,"0")+"-01"; })();
  const [rangeMonth, setRangeMonth] = createSignal(initialRangeMonth);
  const [rangeStart, setRangeStart] = createSignal<string | null>(null);
  const [rangeEnd, setRangeEnd] = createSignal<string | null>(null);
  let dateRangeRoot: HTMLDivElement | undefined;
  const buildRangeMonth = (value: string): DateRangeMonth => { const base=new Date(value+"T00:00:00.000Z"), year=base.getUTCFullYear(), month=base.getUTCMonth(), first=new Date(Date.UTC(year,month,1)), start=new Date(first); start.setUTCDate(1-first.getUTCDay()); const days=Array.from({length:42},(_,index)=>{const date=new Date(start);date.setUTCDate(start.getUTCDate()+index);const inMonth=date.getUTCMonth()===month, weekday=date.getUTCDay();return {iso:date.toISOString().slice(0,10),day:date.getUTCDate(),inMonth,className:inMonth?DATE_RANGE_DAY_IN:DATE_RANGE_DAY_OUT,label:DATE_RANGE_WEEKDAY_FULL[weekday]+", "+DATE_RANGE_MONTH_NAMES[date.getUTCMonth()]+" "+date.getUTCDate()+", "+date.getUTCFullYear(),id:DATE_RANGE_WEEKDAY_ABBR[weekday]+" "+DATE_RANGE_MONTH_ABBR[date.getUTCMonth()]+" "+String(date.getUTCDate()).padStart(2,"0")+" "+date.getUTCFullYear()};}); return {key:year+"-"+month,label:DATE_RANGE_MONTH_NAMES[month]+" "+year,days}; };
  const rangeMonths = () => [0,1].map(offset => { const date=new Date(rangeMonth()+"T00:00:00.000Z"); date.setUTCMonth(date.getUTCMonth()+offset); return buildRangeMonth(date.toISOString().slice(0,7)+"-01"); });
  const moveRangeMonth = (delta: number) => { const date=new Date(rangeMonth()+"T00:00:00.000Z");date.setUTCMonth(date.getUTCMonth()+delta);setRangeMonth(date.toISOString().slice(0,7)+"-01"); };
  const rangeDayInRange = (iso: string) => Boolean(rangeStart() && rangeEnd() && iso >= rangeStart()! && iso <= rangeEnd()!);
  const selectRangeDay = (iso: string) => { if (rangeStart() === null || rangeEnd() !== null || iso < rangeStart()!) { setRangeStart(iso); setRangeEnd(null); (props.onStartChange as ((value: string | null) => void) | undefined)?.(iso); (props.onStartDateChange as ((value: string | null) => void) | undefined)?.(iso); return; } setRangeEnd(iso); (props.onEndChange as ((value: string | null) => void) | undefined)?.(iso); (props.onEndDateChange as ((value: string | null) => void) | undefined)?.(iso); };
  const resetDateRange = () => { setRangeStart(null); setRangeEnd(null); (props.onStartChange as ((value: string | null) => void) | undefined)?.(null); (props.onStartDateChange as ((value: string | null) => void) | undefined)?.(null); (props.onEndChange as ((value: string | null) => void) | undefined)?.(null); (props.onEndDateChange as ((value: string | null) => void) | undefined)?.(null); dateRangeRoot?.focus(); };
` : ''}${datePicker ? `  type DatePickerDay = {iso: string; day: number; disabled: boolean; inMonth: boolean; monthStr: string; isToday: boolean; className: string; label: string};
  const DATE_PICKER_MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const DATE_PICKER_WEEKDAYS = [{short:"Su",full:"Sunday"},{short:"Mo",full:"Monday"},{short:"Tu",full:"Tuesday"},{short:"We",full:"Wednesday"},{short:"Th",full:"Thursday"},{short:"Fr",full:"Friday"},{short:"Sa",full:"Saturday"}];
  const datePickerToday = (() => { const today=new Date(); return today.getFullYear()+"-"+String(today.getMonth()+1).padStart(2,"0")+"-"+String(today.getDate()).padStart(2,"0"); })();
  const toIsoDate = (date: Date): string => date.toISOString().slice(0, 10);
  const parseIsoDate = (value: string): Date => new Date(value + "T00:00:00.000Z");
  const monthDate = parseIsoDate(String(props.defaultMonthDate ?? props.selectedDate ?? "2025-01-01"));
  const firstOfMonth = new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth(), 1));
  const gridStart = new Date(firstOfMonth); gridStart.setUTCDate(1 - firstOfMonth.getUTCDay());
  const monthEnd = new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth() + 1, 0));
  const cellCount = Math.ceil((firstOfMonth.getUTCDay() + monthEnd.getUTCDate()) / 7) * 7;
  const datePickerCaption = () => DATE_PICKER_MONTH_NAMES[monthDate.getUTCMonth()]+" "+monthDate.getUTCFullYear();
  const datePickerDays: DatePickerDay[] = Array.from({length:cellCount}, (_, index) => { const date = new Date(gridStart); date.setUTCDate(gridStart.getUTCDate() + index); const iso = toIsoDate(date), inMonth=date.getUTCMonth()===monthDate.getUTCMonth(), isToday=iso===datePickerToday; return {iso, day:date.getUTCDate(), disabled:Boolean((props.disabledBeforeDate && iso < props.disabledBeforeDate) || (props.disabledAfterDate && iso > props.disabledAfterDate)), inMonth, monthStr:iso.slice(0,7), isToday, className:"rdp-day"+(inMonth?"":" rdp-outside")+(isToday?" rdp-today":""), label:(isToday?"Today, ":"")+DATE_PICKER_WEEKDAYS[date.getUTCDay()].full+", "+DATE_PICKER_MONTH_NAMES[date.getUTCMonth()]+" "+date.getUTCDate()+", "+date.getUTCFullYear()}; });
  const datePickerWeeks = (): DatePickerDay[][] => Array.from({length:datePickerDays.length / 7}, (_, index) => datePickerDays.slice(index * 7, index * 7 + 7));
  const [uncontrolledSelectedDate, setUncontrolledSelectedDate] = createSignal<string | undefined>(incoming.selectedDate as string | undefined);
  const selectedDate = () => incoming.selectedDate !== undefined ? String(props.selectedDate) : uncontrolledSelectedDate();
  const selectDate = (day: DatePickerDay, event: MouseEvent & {currentTarget: HTMLButtonElement}) => { if (day.disabled) return; if (incoming.selectedDate === undefined) setUncontrolledSelectedDate(day.iso); (props.onChange as ((value: string) => void) | undefined)?.(day.iso); event.currentTarget.focus(); };
` : ''}${toastLifecycle ? `  const manager = (props.toastManager as KumoToastManager | undefined) ?? createKumoToastManager();
  const [toasts, setToasts] = createSignal<readonly KumoToast[]>(manager.toasts);
  let knownToastIds = new Set(manager.toasts.map(toast => toast.id));
  const unsubscribe = manager.subscribe(next => {
    const nextIds = new Set(next.map(toast => toast.id));
    for (const toast of next) if (!knownToastIds.has(toast.id)) (props.onNotify as (() => void) | undefined)?.();
    knownToastIds = nextIds;
    setToasts(next);
  });
  onCleanup(unsubscribe);
  const [toastMounted, setToastMounted] = createSignal(false);
  onMount(() => setToastMounted(true));
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
  const radioFixture = () => (props.fixture as RadioFixture | undefined) ?? ({legend: "", items: []} as RadioFixture);
  const radioControlled = () => radioFixture().value !== undefined;
  const [radioValue, setRadioValue] = createSignal(radioFixture().defaultValue);
  const selectedValue = () => radioControlled() ? radioFixture().value : radioValue();
  const radioIdBase = createUniqueId();
  const radioLegendId = radioIdBase + "-legend";
  const radioItemId = (index: number) => radioIdBase + "-item-" + index;
  const radioInputId = (index: number) => radioIdBase + "-input-" + index;
  const radioLabelId = (index: number) => radioInputId(index) + "-label";
  let radioRoot: HTMLDivElement | undefined;
  const selectRadio = (item: RadioItem) => {
    if (radioFixture().disabled || item.disabled) return;
    if (!radioControlled()) setRadioValue(item.value);
    (props.onValueChange as ((value: string) => void) | undefined)?.(item.value);
    if (radioRoot) { radioRoot.setAttribute('tabindex', '-1'); radioRoot.focus(); }
  };
  const radioKeyDown = (event: KeyboardEvent & {currentTarget: HTMLSpanElement}, index: number) => {
    if (event.key !== "ArrowDown" || radioFixture().disabled) return;
    const items = radioFixture().items;
    const next = items.slice(index + 1).find(item => !item.disabled);
    if (next) { event.preventDefault(); selectRadio(next); }
  };
` : ''}${tabsNavigation ? `  type TabItem = {value: string; label: string};
  const tabs = () => props.tabs as TabItem[];
  const controlled = () => incoming.selectedValue !== undefined;
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
  const dialogKeyDown: JSX.EventHandlerUnion<HTMLDivElement, KeyboardEvent> = event => { if (event.key === "Escape") { event.preventDefault(); setDialogOpen(false); } };
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
  const findAutocompletePart = (exported: string, value: AutocompleteFixtureNode | undefined = autocompleteFixture()): AutocompleteFixtureNode | undefined => value?.export === exported ? value : value?.children?.map(child => findAutocompletePart(exported, child)).find(Boolean);
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
  type CommandPaletteFixtureNode = {export?: string; props?: Record<string, unknown>; text?: string; children?: CommandPaletteFixtureNode[]};
  type HighlightSegment = {text: string; mark: boolean};
  const commandPaletteFixture = () => props.fixture as CommandPaletteFixtureNode | undefined;
  const findCommandPalettePart = (exported: string, value: CommandPaletteFixtureNode | undefined = commandPaletteFixture()): CommandPaletteFixtureNode | undefined => value?.export === exported ? value : value?.children?.map(child => findCommandPalettePart(exported, child)).find(Boolean);
  const paletteItems = (): CommandPaletteItem[] => { const explicit=(props.items as Array<string | {value: string; label?: string}> | undefined); if (explicit) return explicit.map(item => typeof item === "string" ? {value:item,label:item} : {value:item.value,label:item.label ?? item.value}); return (findCommandPalettePart(".List")?.children ?? []).filter(item => item.export === ".Item").map(item => ({value:String(item.props?.value ?? fixtureText(item)),label:fixtureText(item)})); };
  const palettePlaceholder = () => String(findCommandPalettePart(".Input")?.props?.placeholder ?? "");
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
  const findComboboxPart = (exported: string, value: ComboboxFixtureNode | undefined = comboboxFixture()): ComboboxFixtureNode | undefined => value?.export === exported ? value : value?.children?.map(child => findComboboxPart(exported, child)).find(Boolean);
  const comboboxTrigger = () => findComboboxPart(".TriggerInput") ?? {props:{}};
  const comboboxItems = () => {
    const list = findComboboxPart(".List");
    return (list?.children ?? []).filter(item => item.export === ".Item").map(item => ({...item, value:String(item.props.value ?? "")}));
  };
  const [uncontrolledComboboxOpen, setUncontrolledComboboxOpen] = createSignal(Boolean(incoming.defaultOpen));
  const comboboxOpen = () => incoming.open !== undefined ? Boolean(props.open) : uncontrolledComboboxOpen();
  const [uncontrolledComboboxValue, setUncontrolledComboboxValue] = createSignal(String(incoming.defaultValue ?? ""));
  const comboboxValue = () => incoming.value !== undefined ? String(props.value) : uncontrolledComboboxValue();
  const [comboboxQuery, setComboboxQuery] = createSignal(comboboxValue());
  const filteredComboboxItems = () => { const query = comboboxQuery().trim().toLocaleLowerCase(); return query ? comboboxItems().filter(item => fixtureText(item).toLocaleLowerCase().includes(query)) : comboboxItems(); };
  const [highlightedIndex, setHighlightedIndex] = createSignal(-1);
  let comboboxInput: HTMLInputElement | undefined;
  const setComboboxOpen = (next: boolean) => { if (incoming.open === undefined) setUncontrolledComboboxOpen(next); (props.onOpenChange as ((open: boolean) => void) | undefined)?.(next); };
  const openCombobox = () => { setComboboxOpen(true); comboboxInput?.focus(); };
  const selectComboboxItem = (item: ComboboxFixtureNode & {value: string}, event?: PointerEvent) => { if (item.props.disabled) { event?.preventDefault(); return; } event?.preventDefault(); if (incoming.value === undefined) setUncontrolledComboboxValue(item.value); setComboboxQuery(item.value); (props.onValueChange as ((value: string) => void) | undefined)?.(item.value); setComboboxOpen(false); queueMicrotask(() => comboboxInput?.focus()); };
  const comboboxOnInput: JSX.EventHandlerUnion<HTMLInputElement, InputEvent> = event => { setComboboxQuery(event.currentTarget.value); setHighlightedIndex(-1); if (!comboboxOpen()) setComboboxOpen(true); };
  const comboboxKeyDown: JSX.EventHandlerUnion<HTMLInputElement, KeyboardEvent> = event => {
    if (event.key === "ArrowDown") { event.preventDefault(); if (!comboboxOpen()) setComboboxOpen(true); setHighlightedIndex(index => Math.min(index + 1, filteredComboboxItems().length - 1)); }
    else if (event.key === "ArrowUp") { event.preventDefault(); setHighlightedIndex(index => Math.max(index - 1, 0)); }
    else if (event.key === "Enter" && highlightedIndex() >= 0) { event.preventDefault(); const item = filteredComboboxItems()[highlightedIndex()]; if (item) selectComboboxItem(item); }
    else if (event.key === "Escape" && comboboxOpen()) { event.preventDefault(); setComboboxOpen(false); comboboxInput?.focus(); }
  };
` : ''}${nativeInputElement ? `  const nativeInputHandler: JSX.EventHandlerUnion<${nativeInputElement === 'input' ? 'HTMLInputElement' : 'HTMLTextAreaElement'}, InputEvent> = event => {\n    (props.onInput as ((value: string) => void) | undefined)?.(event.currentTarget.value);\n  };\n` : ''}  const refs: Record<string, HTMLElement | undefined> = {};\n  const [, native] = splitProps(props as ${model.public.symbol}Props & Record<string, unknown>, ${JSON.stringify(nativeInputElement ? ['class', nativeInput.uncontrolled.prop, 'value', 'error', 'variant', 'disabled', 'onInput', 'children', 'fixture', 'styles'] : localNames)});\n${nativeButton ? `  const mergeTriggerAttributes = useContext(KumoMergeTriggerContext) ?? {};\n` : ''}  void native; void state; void refs;\n${semantic ? semantic + '\n' : ''}  return (${fallback});\n}\n\n${partSources}${partSources ? '\n\n' : ''}${intermediates}${intermediates ? '\n' : ''}${attachments}${attachments ? '\n\n' : ''}${toastLifecycle ? `export const ToastProvider = ${model.public.symbol};\n\n` : ''}export default ${model.public.symbol};\n`;
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
  for (const model of expandNamedExportModels(library.models)) {
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
  const solidIndexLine = x => x.component === 'toasty' ? 'export { Toasty, ToastProvider, Toast, createKumoToastManager, useKumoToastManager } from "./toasty"; export type { ToastyProps, ToastProps, KumoToast, KumoToastOptions, KumoToastAction, KumoToastManager, KumoToastVariant } from "./toasty";' : `export { ${x.symbol} } from "./${x.component}";`;
  const solidDeclarationLine = x => x.component === 'toasty' ? solidIndexLine(x) : `export { ${x.symbol} } from "./${x.component}"; export type { ${x.symbol}Props } from "./${x.component}";`;
  fs.writeFileSync(path.join(output,'index.ts'), '// @generated by src/kumo/emitters/solid/index.mjs; do not edit\n'+components.map(solidIndexLine).join('\n')+'\n');
  fs.writeFileSync(path.join(output,'index.d.ts'), '// @generated by src/kumo/emitters/solid/index.mjs; do not edit\n'+components.map(solidDeclarationLine).join('\n')+'\n');
  const exports = Object.fromEntries([['.',{source:'./index.ts',types:'./index.d.ts'}], ...components.map(x => [x.subpath,{source:`./${x.source}`,types:`./${x.declaration}`}])]);
  fs.writeFileSync(path.join(output,'package.json'), JSON.stringify({name:'@acoyfellow/kumo-solid',version:'0.0.1',private:true,type:'module',sideEffects:false,exports},null,2)+'\n');
  fs.writeFileSync(path.join(output,'manifest.json'), JSON.stringify({schemaVersion:'kumo.solid-emitter/v1',algebraVersion:'kumo.component-algebra/v1',candidate:true,count:components.length,libraryManifestDigest:crypto.createHash('sha256').update(canonicalJSON(library.manifest)).digest('hex'),components},null,2)+'\n');
  return {output, components};
}
export {source as emitSolidComponent};
