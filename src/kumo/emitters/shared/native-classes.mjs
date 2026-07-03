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

// DropdownMenu canonical compound trigger icon. The homepage renders
// <DropdownMenu.Trigger render={<Button icon={PlusIcon}>Add</Button>} />, so this is
// the exact @phosphor-icons/react PlusIcon markup emitted by Kumo's Button icon slot.
export const KUMO_PLUS_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path></svg>';

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
