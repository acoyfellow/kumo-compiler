// Real Kumo utility classes for native controls, copied verbatim from the installed
// @cloudflare/kumo 2.6.0 package sources (node_modules/@cloudflare/kumo/dist/chunks/*).
// These are the SAME design-token utilities React Kumo renders — not invented BEM, not
// lookalikes, not inline hex. Emitting them at the native fallback gives generated
// Vue/Svelte/Solid the same class fidelity the local-fidelity harness checks against
// canonical React. Each constant lists the real `*kumo-*` tokens React emits for it.

// Expand canonical named exports that share a contract but have distinct component
// algebra. The source model remains one-to-one with its observable contract; emitters
// receive one concrete model per independently renderable public symbol.
export function expandNamedExportModels(models) {
  return models.flatMap(model => {
    const definitions = model.namedExportImplementations;
    if (!definitions) return [model];
    const exported = new Set(model.public.exports);
    const primary = {...model, public:{...model.public, exports:[model.public.symbol]}};
    const variants = Object.entries(definitions).map(([symbol, definition]) => {
      if (!exported.has(symbol)) throw new Error(`${model.component}: named implementation ${symbol} is not public`);
      if (!definition?.component || !definition?.subpath || !definition?.draftImplementation) throw new Error(`${model.component}: incomplete named implementation ${symbol}`);
      return {
        ...model,
        component: definition.component,
        public: {...model.public, symbol, exports:[symbol], subpath:definition.subpath},
        draftImplementation: definition.draftImplementation,
        semanticRender: undefined,
        unresolvedSemanticOperations: []
      };
    });
    return [primary, ...variants];
  });
}

// Component-specific compound parts that diverge from the generic emitter fallback.
// Values are canonical @cloudflare/kumo 2.6.0 SSR markup. Unlisted parts must retain
// each framework's existing generic tag and data-kumo-part attribute.
export const COMPOUND_PART_OVERRIDES = Object.freeze({
  'layer-card': Object.freeze({
    Secondary: Object.freeze({tag:'div', className:'-my-2 flex items-center gap-2 bg-kumo-elevated p-4 text-base font-medium text-kumo-subtle'}),
    Primary: Object.freeze({tag:'div', className:'relative flex flex-col gap-2 overflow-hidden rounded-lg bg-kumo-base p-4 pr-3 text-inherit no-underline ring ring-kumo-fill'}),
  }),
  // Table is a REAL semantic HTML table (verified against @cloudflare/kumo
  // 2.6.0's own type declarations: Header=HTMLTableSectionElement/<thead>,
  // Head=HTMLTableCellElement/<th>, Row=HTMLTableRowElement/<tr>,
  // Body=HTMLTableSectionElement/<tbody>, Cell=TdHTMLAttributes/<td>). The
  // generic compound-part fallback (a <section data-kumo-part>) was emitting
  // 8 extra <section> elements per homepage render instead of real table
  // markup -- found via route-cascade's structural diff (Tier A) after
  // dogfooding semantic-diff's rankByLeverage() on the real nested tree.
  // Golden's live DOM confirms zero classes on any of these sub-elements
  // (all styling lives on the outer <table> via its own Tailwind classes).
  table: Object.freeze({
    Header: Object.freeze({tag:'thead', className:'group/header'}),
    Head: Object.freeze({tag:'th', className:'group relative'}),
    Row: Object.freeze({tag:'tr', className:''}),
    Body: Object.freeze({tag:'tbody', className:''}),
    Cell: Object.freeze({tag:'td', className:''}),
  }),
});
export const compoundPartOverride = (component, partPath) => COMPOUND_PART_OVERRIDES[component]?.[partPath];

// Input — inputVariants base + focus ring + size=base (chunks/input-*.js).
// React kumo: bg-kumo-control, text-kumo-default, ring-kumo-line, kumo-input-placeholder,
// disabled:text-kumo-disabled, focus:ring-kumo-focus/50.
export const KUMO_INPUT_CLASS = 'border-0 bg-kumo-control text-kumo-default ring ring-kumo-line outline-none focus:outline-none kumo-input-placeholder disabled:text-kumo-disabled focus:ring-kumo-focus/50 focus:ring-[1.5px] h-9 gap-1.5 rounded-lg px-3 text-base';
// error=true (or deprecated variant="error", still supported by canonical) swaps the
// ring-line/focus-ring classes for the danger ring, verified via
// renderToStaticMarkup(<Input variant="error" .../>) against @cloudflare/kumo 2.6.0.
export const KUMO_INPUT_ERROR_CLASS = 'border-0 bg-kumo-control text-kumo-default ring ring-kumo-line outline-none focus:outline-none kumo-input-placeholder disabled:text-kumo-disabled h-9 gap-1.5 rounded-lg px-3 text-base !ring-kumo-danger focus:ring-kumo-danger/50 focus:ring-[1.5px]';

// Field label + description (chunks/field-*.js).
// React kumo: text-kumo-default (label), text-kumo-subtle (description).
// React canonical description <p> also carries `col-span-full` (Field.Root is a grid;
// the description spans all grid columns). Verified verbatim against
// renderToStaticMarkup(@cloudflare/kumo Field) 2.6.0. Prior value dropped col-span-full,
// leaving a class-mismatch vs canonical (inert while the container is block flow, but
// required once the Field.Root grid container lands — E/S2 lane owns that container).
export const KUMO_FIELD_LABEL_CLASS = 'm-0 select-none text-base font-medium text-kumo-default';
export const KUMO_FIELD_DESCRIPTION_CLASS = 'text-sm leading-snug text-kumo-subtle col-span-full';

// Input-area <textarea> (chunks/input-*.js — InputArea, NOT Input). React canonical
// textarea diverges from the single-line Input: it drops the fixed `h-9` and adds
// `h-auto py-2` (content-height + 8px vertical padding). Verified verbatim against
// renderToStaticMarkup(@cloudflare/kumo InputArea) 2.6.0:
//   border-0 bg-kumo-control text-kumo-default ring ring-kumo-line outline-none
//   focus:outline-none kumo-input-placeholder disabled:text-kumo-disabled gap-1.5
//   rounded-lg px-3 text-base focus:ring-kumo-focus/50 focus:ring-[1.5px] h-auto py-2
// The single-line Input (KUMO_INPUT_CLASS) keeps `h-9` and no py — so the textarea path
// MUST use this dedicated constant instead of KUMO_INPUT_CLASS. Emitters currently reuse
// KUMO_INPUT_CLASS for both input+textarea; the E-{svelte,vue,solid} lanes must switch the
// textarea (non-`input` field.root) branch to KUMO_INPUTAREA_CLASS to clear input-area B-gate.
export const KUMO_INPUTAREA_CLASS = 'border-0 bg-kumo-control text-kumo-default ring ring-kumo-line outline-none focus:outline-none kumo-input-placeholder disabled:text-kumo-disabled gap-1.5 rounded-lg px-3 text-base focus:ring-kumo-focus/50 focus:ring-[1.5px] h-auto py-2';
// error=true (or deprecated variant="error") equivalent for InputArea, verified via
// renderToStaticMarkup(<InputArea variant="error" .../>) against @cloudflare/kumo 2.6.0.
export const KUMO_INPUTAREA_ERROR_CLASS = 'border-0 bg-kumo-control text-kumo-default ring ring-kumo-line outline-none focus:outline-none kumo-input-placeholder disabled:text-kumo-disabled gap-1.5 rounded-lg px-3 text-base !ring-kumo-danger focus:ring-kumo-danger/50 focus:ring-[1.5px] h-auto py-2';

// Checkbox box span (chunks/checkbox-*.js), assembled VERBATIM as React canonical does:
//   i("relative flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border-0 bg-kumo-base
//     ring focus:outline-none after:absolute after:-inset-x-3 after:-inset-y-2",
//     a && "mt-0.5",                                   // label present (runtime-appended)
//     status==="error" ? "ring-kumo-danger" : "ring-kumo-hairline",
//     !disabled && "hover:ring-kumo-hairline focus:ring-kumo-focus focus:ring-2 focus-visible:ring-2 focus-visible:ring-kumo-brand",
//     "data-[checked]:bg-kumo-contrast data-[checked]:ring-kumo-contrast data-[indeterminate]:bg-kumo-contrast data-[indeterminate]:ring-kumo-contrast")
// The prior value folded text-kumo-inverse onto the box (React puts it on the INDICATOR,
// not the box — color delta) and dropped after:* (hit-area / border delta). Corrected to
// the exact default-state box string; identical to KUMO_CHECKBOX_BOX_CLASS below.
export const KUMO_CHECKBOX_CLASS = 'relative flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border-0 bg-kumo-base ring focus:outline-none after:absolute after:-inset-x-3 after:-inset-y-2 ring-kumo-hairline hover:ring-kumo-hairline focus:ring-kumo-focus focus:ring-2 focus-visible:ring-2 focus-visible:ring-kumo-brand data-[checked]:bg-kumo-contrast data-[checked]:ring-kumo-contrast data-[indeterminate]:bg-kumo-contrast data-[indeterminate]:ring-kumo-contrast text-kumo-inverse';

// Checkbox box span (chunks/checkbox-*.js) rendered VERBATIM as React canonical does.
// React puts text-kumo-inverse + the after:* hit-area utilities on the box, NOT the
// class above (which folded text-kumo-inverse onto the box and dropped after:* and
// mt-0.5). This constant matches the real React Checkbox box exactly so the native
// control renders the same checkmark <svg> and the same computed box styles.
// mt-0.5 is appended at runtime only when a label is present (React: `a && "mt-0.5"`).
export const KUMO_CHECKBOX_BOX_CLASS = 'relative flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border-0 bg-kumo-base ring focus:outline-none after:absolute after:-inset-x-3 after:-inset-y-2 ring-kumo-hairline hover:ring-kumo-hairline focus:ring-kumo-focus focus:ring-2 focus-visible:ring-2 focus-visible:ring-kumo-brand data-[checked]:bg-kumo-contrast data-[checked]:ring-kumo-contrast data-[indeterminate]:bg-kumo-contrast data-[indeterminate]:ring-kumo-contrast';
// Indicator span wrapping the check/minus icon. React: Base UI CheckboxIndicator.
export const KUMO_CHECKBOX_INDICATOR_CLASS = 'flex items-center justify-center text-kumo-inverse data-[unchecked]:invisible';
// Real Kumo (phosphor) CheckIcon markup — weight="bold" size={12}. NOT a lookalike;
// this is exactly what @cloudflare/kumo CheckboxIndicator renders when checked.
export const KUMO_CHECKBOX_CHECK_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256"><path d="M232.49,80.49l-128,128a12,12,0,0,1-17,0l-56-56a12,12,0,1,1,17-17L96,183,215.51,63.51a12,12,0,0,1,17,17Z"></path></svg>';
// Real Kumo (phosphor) MinusIcon markup — rendered by React for the indeterminate state.
export const KUMO_CHECKBOX_MINUS_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256"><path d="M228,128a12,12,0,0,1-12,12H40a12,12,0,0,1,0-24H216A12,12,0,0,1,228,128Z"></path></svg>';
// Visually-hidden native <input type="checkbox"> React renders alongside the box span.
export const KUMO_CHECKBOX_HIDDEN_INPUT_STYLE = 'clip-path:inset(50%);overflow:hidden;white-space:nowrap;border:0;padding:0;width:1px;height:1px;margin:-1px;position:fixed;top:0;left:0';
// Label composition React wraps a labelled checkbox in (Field.Root div + label + text span).
export const KUMO_CHECKBOX_LABEL_WRAPPER_CLASS = 'inline-flex';
export const KUMO_CHECKBOX_LABEL_CLASS = '!m-0 !min-h-0 !text-base inline-flex items-start gap-2 flex-row';
export const KUMO_CHECKBOX_LABEL_TEXT_CLASS = 'inline-flex items-center gap-1';

// Radio group composition (chunks/radio-*.js), verified against both canonical SSR
// and the hydrated homepage. Base UI adds the id-reference links during hydration;
// native emitters render those links eagerly because their deterministic ids are stable.
export const KUMO_RADIO_LEGEND_CLASS = 'text-base font-medium text-kumo-default';
export const KUMO_RADIO_LABEL_CLASS = 'm-0 group relative inline-flex items-start gap-2 cursor-pointer';
export const KUMO_RADIO_ITEM_CLASS = 'relative mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-0 bg-kumo-base ring focus:outline-none after:absolute after:-inset-x-3 after:-inset-y-2 ring-kumo-line group-hover:ring-kumo-hairline focus:ring-kumo-focus focus:ring-2 focus-visible:ring-2 focus-visible:ring-kumo-brand focus-visible:outline-offset-3 data-[checked]:bg-kumo-contrast';
export const KUMO_RADIO_INDICATOR_CLASS = 'flex items-center justify-center';
export const KUMO_RADIO_DOT_CLASS = 'h-2 w-2 rounded-full bg-kumo-base';
export const KUMO_RADIO_LABEL_TEXT_CLASS = 'text-base text-kumo-default';

// DropdownMenu canonical compound trigger icon. The homepage renders
// <DropdownMenu.Trigger render={<Button icon={PlusIcon}>Add</Button>} />, so this is
// the exact @phosphor-icons/react PlusIcon markup emitted by Kumo's Button icon slot.
export const KUMO_PLUS_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path></svg>';

// Tooltip popup chrome and arrow, copied verbatim from @cloudflare/kumo 2.6.0.
// The three paths are Base UI's visual arrow (base, shadow, and tip stroke), not
// the icon rendered by the trigger Button.
export const KUMO_TOOLTIP_POSITIONER_CLASS = 'max-w-[var(--available-width)]';
export const KUMO_TOOLTIP_POPUP_CLASS = 'flex origin-[var(--transform-origin)] flex-col rounded-md bg-kumo-base px-2.5 py-1.5 text-sm text-kumo-default shadow-lg shadow-kumo-tip-shadow outline outline-kumo-fill transition-[transform,scale,opacity] duration-150 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[instant]:duration-0 kumo-tooltip-popup';
export const KUMO_TOOLTIP_ARROW_CLASS = 'flex data-[side=bottom]:top-[-8px] data-[side=left]:right-[-13px] data-[side=left]:rotate-90 data-[side=right]:left-[-13px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180';
export const KUMO_TOOLTIP_ARROW_SVG = '<svg width="20" height="10" viewBox="0 0 20 10" fill="none"><path d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z" class="fill-kumo-base"></path><path d="M8.99542 1.85876C9.75604 1.17425 10.9106 1.17422 11.6713 1.85878L16.5281 6.22989C17.0789 6.72568 17.7938 7.00001 18.5349 7.00001L15.89 7L11.0023 2.60207C10.622 2.2598 10.0447 2.2598 9.66436 2.60207L4.77734 7L2.13171 7.00001C2.87284 7.00001 3.58774 6.72568 4.13861 6.22989L8.99542 1.85876Z" class="fill-kumo-tip-shadow"></path><path d="M10.3333 3.34539L5.47654 7.71648C4.55842 8.54279 3.36693 9 2.13172 9H0V8H2.13172C3.11989 8 4.07308 7.63423 4.80758 6.97318L9.66437 2.60207C10.0447 2.25979 10.622 2.2598 11.0023 2.60207L15.8591 6.97318C16.5936 7.63423 17.5468 8 18.5349 8H20V9H18.5349C17.2998 9 16.1083 8.54278 15.1901 7.71648L10.3333 3.34539Z" class="fill-kumo-tip-stroke"></path></svg>';

// Label root/tooltip-icon classes and the Phosphor Info icon (regular weight,
// the default @cloudflare/kumo uses for the Label.tooltip "more information"
// affordance), copied verbatim from @cloudflare/kumo 2.6.0's real chunk output
// (not approximated) -- verified against golden's live homepage DOM.
export const KUMO_LABEL_ROOT_CLASS = 'm-0 text-base font-medium text-kumo-default inline-flex items-center gap-1';
// Grid variant/gap -> Tailwind class maps, transcribed verbatim from
// @cloudflare/kumo 2.6.0's grid.d.ts KUMO_GRID_VARIANTS. Grid has no default
// variant (plain grid emits no grid-cols-* class); gap defaults to 'base'.
export const KUMO_GRID_VARIANT_CLASSES = Object.freeze({'2up':'grid-cols-1 md:grid-cols-2','side-by-side':'grid-cols-2','2-1':'grid-cols-1 md:grid-cols-[2fr_1fr]','1-2':'grid-cols-1 md:grid-cols-[1fr_2fr]','1-3up':'grid-cols-1 lg:grid-cols-3','3up':'grid-cols-1 md:grid-cols-2 lg:grid-cols-3','4up':'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4','6up':'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6','1-2-4up':'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'});
export const KUMO_GRID_GAP_CLASSES = Object.freeze({none:'gap-0',sm:'gap-3',base:'gap-2 md:gap-6 lg:gap-8',lg:'gap-8'});
export const KUMO_LABEL_OPTIONAL_CLASS = 'font-normal text-kumo-subtle';
export const KUMO_LABEL_INFO_BUTTON_CLASS = 'group flex shrink-0 font-medium select-none border-0 focus:outline-none focus:ring-kumo-focus/50 focus-visible:ring-2 focus-visible:ring-kumo-brand disabled:cursor-not-allowed disabled:text-kumo-subtle gap-1 rounded-sm text-xs items-center justify-center p-0 size-3.5 text-kumo-default hover:bg-kumo-tint shadow-none bg-inherit cursor-default';
export const KUMO_LABEL_INFO_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" class="size-4"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z"></path></svg>';

// Banner classes copied verbatim from @cloudflare/kumo 2.6.0 SSR. Both the root
// and icon wrapper use the variant's text token; structured icon wrappers add
// vertical centering while the deprecated text/children shape stays flat.
export const KUMO_BANNER_VARIANT_CLASSES = Object.freeze({
  default: Object.freeze({root:'flex w-full items-start gap-3 rounded-lg px-4 py-3 text-base bg-kumo-banner-info text-kumo-info', text:'text-kumo-info'}),
  alert: Object.freeze({root:'flex w-full items-start gap-3 rounded-lg px-4 py-3 text-base bg-kumo-banner-warning text-kumo-warning', text:'text-kumo-warning'}),
  error: Object.freeze({root:'flex w-full items-start gap-3 rounded-lg px-4 py-3 text-base bg-kumo-danger-tint/60 text-kumo-danger', text:'text-kumo-danger'}),
  secondary: Object.freeze({root:'flex w-full items-start gap-3 rounded-lg px-4 py-3 text-base bg-kumo-contrast/5 text-kumo-subtle', text:'text-kumo-subtle'}),
});
export const KUMO_BANNER_SIMPLE_ICON_CLASS = 'shrink-0';
export const KUMO_BANNER_STRUCTURED_ICON_CLASS = 'shrink-0 flex items-center h-[1.375em]';

// Clipboard text (chunks/clipboard-text-*.js) rendered VERBATIM as React canonical.
// React composes an input-shell <div> + a truncating text <span> + a Button that
// carries BOTH the "copied" check icon and the default copy icon (real phosphor
// markup, width=1em), plus an sr-only aria-live announcement span. The old native
// fallback dropped every icon and the input chrome. These are the real Kumo classes.
export const KUMO_CLIPBOARD_ROOT_CLASS = 'border-0 text-kumo-default ring ring-kumo-line outline-none focus:outline-none kumo-input-placeholder disabled:text-kumo-disabled h-10 gap-2 rounded-lg focus:ring-kumo-focus/50 focus:ring-[1.5px] flex items-center overflow-hidden bg-kumo-base px-0 font-mono text-sm';
export const KUMO_CLIPBOARD_TEXT_CLASS = 'grow truncate ps-4 pe-2';
export const KUMO_CLIPBOARD_BUTTON_CLASS = 'group flex w-max shrink-0 items-center font-medium select-none border-0 focus:outline-none cursor-pointer disabled:cursor-not-allowed disabled:text-kumo-subtle h-10 gap-2 rounded-lg text-base text-kumo-default hover:bg-kumo-tint shadow-none bg-inherit rounded-l-none rounded-r-[inherit] border-l! border-kumo-line! px-3 relative isolate overflow-hidden transition-all duration-200 focus:ring-inset focus:ring-kumo-focus/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-kumo-brand';
// "Copied" state icon span (hidden until copy) and the default copy icon span.
export const KUMO_CLIPBOARD_CHECK_SPAN_CLASS = 'gap-1 transition-all duration-200 pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 translate-y-full';
export const KUMO_CLIPBOARD_COPY_SPAN_CLASS = 'flex items-center justify-center transition-all duration-200 translate-y-0 opacity-100';
// Real Kumo (phosphor) Check + Copy icon markup, width=1em (as React renders in the Button).
export const KUMO_CLIPBOARD_CHECK_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path></svg>';
export const KUMO_CLIPBOARD_COPY_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z"></path></svg>';

// Switch track button + thumb span (chunks/switch-*.js), default variant + size=base, unchecked.
// React composes track K = i("relative inline-flex items-center ring cursor-pointer border-none p-0",
//   "focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand",
//   "transition-colors duration-150 ease-out motion-reduce:transition-none",
//   "disabled:cursor-not-allowed disabled:opacity-50",
//   m.track /*base=h-4.5 w-9*/, p /*rounded-[5px] squircle*/, D /*default+unchecked color*/)
// and thumb M = i("absolute top-0 bottom-0 shadow-[…kumo-shadow…]", m.thumb /*base=w-4.5*/,
//   p, G /*bg-kumo-base dark:bg-neutral-850*/, "transition-all …", checked?slide:"left-0").
// Prior values were hand-approximated: wrong size (h-4 w-8 → h-4.5 w-9), a stray
// focus:ring-kumo-focus/50 React never emits, no track bg (React uses bg-neutral-200 —
// the gray pill), and a wrong thumb geometry (top-0.5 left-0.5 h-3 w-3 rounded-[4px]).
export const KUMO_SWITCH_TRACK_CLASS = 'relative inline-flex items-center ring cursor-pointer border-none p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand transition-colors duration-150 ease-out motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-50 h-4.5 w-9 rounded-[5px] supports-[corner-shape:squircle]:rounded-[10px] [corner-shape:squircle] bg-neutral-200 dark:bg-neutral-700 ring-neutral-300 dark:ring-neutral-600';
export const KUMO_SWITCH_THUMB_CLASS = 'absolute top-0 bottom-0 shadow-[0_0_1px_0.5px_var(--color-kumo-shadow-edge),0_1px_2px_var(--color-kumo-shadow-drop)] w-4.5 rounded-[5px] supports-[corner-shape:squircle]:rounded-[10px] [corner-shape:squircle] bg-kumo-base dark:bg-neutral-850 transition-all duration-150 ease-out motion-reduce:transition-none left-0';

// Tabs list + trigger, segmented default variant (chunks/tabs-*.js).
// React kumo: kumo-tabs-list, bg-kumo-recessed, ring-kumo-hairline/70 (list);
// text-kumo-subtle, hover:text-kumo-default, aria-selected:text-kumo-default, bg-kumo-base,
// ring-kumo-line, focus:ring-kumo-focus/50, focus-visible:ring-kumo-brand (trigger).
export const KUMO_TABS_LIST_CLASS = 'kumo-tabs-list relative inline-flex items-center gap-0.5 rounded-lg p-0.5 ring ring-kumo-hairline/70 bg-kumo-recessed';
export const KUMO_TABS_TRIGGER_CLASS = 'relative isolate my-0.5 rounded-md px-2.5 py-1 text-base text-kumo-subtle hover:text-kumo-default aria-selected:text-kumo-default aria-selected:font-medium focus:outline-none focus:ring-kumo-focus/50 focus-visible:ring-2 focus-visible:ring-kumo-brand';
// Selected-tab pill indicator (React renders bg-kumo-base + ring-kumo-line on the active segment).
export const KUMO_TABS_INDICATOR_CLASS = 'pointer-events-none absolute inset-0 -z-10 rounded-md bg-kumo-base ring ring-kumo-line';

// Meter (chunks/meter-*.js).
// React kumo: text-kumo-subtle (label), text-kumo-default (value), bg-kumo-fill (track),
// from-kumo-brand via-kumo-brand to-kumo-brand (fill).
export const KUMO_METER_ROOT_CLASS = 'flex w-full flex-col gap-2';
export const KUMO_METER_HEADER_CLASS = 'flex items-center justify-between gap-4';
export const KUMO_METER_LABEL_CLASS = 'text-xs text-kumo-subtle';
export const KUMO_METER_VALUE_CLASS = 'text-sm font-medium text-kumo-default tabular-nums';
export const KUMO_METER_TRACK_CLASS = 'relative h-2 w-full overflow-hidden rounded-full bg-kumo-fill';
export const KUMO_METER_FILL_CLASS = 'absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-kumo-brand via-kumo-brand to-kumo-brand transition-[width] duration-300 ease-out';
