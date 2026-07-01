// Real Kumo utility classes for native controls, copied verbatim from the installed
// @cloudflare/kumo 2.6.0 package sources (node_modules/@cloudflare/kumo/dist/chunks/*).
// These are the SAME design-token utilities React Kumo renders — not invented BEM, not
// lookalikes, not inline hex. Emitting them at the native fallback gives generated
// Vue/Svelte/Solid the same class fidelity the local-fidelity harness checks against
// canonical React. Each constant lists the real `*kumo-*` tokens React emits for it.

// Input — inputVariants base + focus ring + size=base (chunks/input-*.js).
// React kumo: bg-kumo-control, text-kumo-default, ring-kumo-line, kumo-input-placeholder,
// disabled:text-kumo-disabled, focus:ring-kumo-focus/50.
export const KUMO_INPUT_CLASS = 'border-0 bg-kumo-control text-kumo-default ring ring-kumo-line outline-none focus:outline-none kumo-input-placeholder disabled:text-kumo-disabled focus:ring-kumo-focus/50 focus:ring-[1.5px] h-9 gap-1.5 rounded-lg px-3 text-base';

// Field label + description (chunks/field-*.js).
// React kumo: text-kumo-default (label), text-kumo-subtle (description).
export const KUMO_FIELD_LABEL_CLASS = 'm-0 select-none text-base font-medium text-kumo-default';
export const KUMO_FIELD_DESCRIPTION_CLASS = 'text-sm leading-snug text-kumo-subtle';

// Checkbox box span (chunks/checkbox-*.js).
// React kumo: bg-kumo-base, ring-kumo-hairline, hover:ring-kumo-hairline, focus:ring-kumo-focus,
// focus-visible:ring-kumo-brand, data-[checked]:bg-kumo-contrast, data-[checked]:ring-kumo-contrast,
// data-[indeterminate]:bg-kumo-contrast, data-[indeterminate]:ring-kumo-contrast, text-kumo-inverse.
export const KUMO_CHECKBOX_CLASS = 'relative flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border-0 bg-kumo-base ring ring-kumo-hairline hover:ring-kumo-hairline focus:outline-none focus:ring-kumo-focus focus:ring-2 focus-visible:ring-2 focus-visible:ring-kumo-brand data-[checked]:bg-kumo-contrast data-[checked]:ring-kumo-contrast data-[indeterminate]:bg-kumo-contrast data-[indeterminate]:ring-kumo-contrast text-kumo-inverse';

// Switch track button + thumb span (chunks/switch-*.js).
// React kumo: focus-visible:ring-kumo-brand (track), bg-kumo-base (thumb), shadow-[…kumo-shadow…] (thumb).
export const KUMO_SWITCH_TRACK_CLASS = 'relative inline-flex items-center h-4 w-8 rounded-[5px] ring ring-kumo-hairline cursor-pointer border-none p-0 focus:outline-none focus:ring-kumo-focus/50 focus-visible:ring-2 focus-visible:ring-kumo-brand transition-colors duration-150 ease-out';
export const KUMO_SWITCH_THUMB_CLASS = 'absolute top-0.5 left-0.5 h-3 w-3 rounded-[4px] bg-kumo-base shadow-[0_0_1px_0.5px_var(--color-kumo-shadow-edge),0_1px_2px_var(--color-kumo-shadow-drop)] transition-all duration-150 ease-out';

// Tabs list + trigger, segmented default variant (chunks/tabs-*.js).
// React kumo: kumo-tabs-list, bg-kumo-recessed, ring-kumo-hairline/70 (list);
// text-kumo-subtle, hover:text-kumo-default, aria-selected:text-kumo-default, bg-kumo-base,
// ring-kumo-line, focus:ring-kumo-focus/50, focus-visible:ring-kumo-brand (trigger).
export const KUMO_TABS_LIST_CLASS = 'kumo-tabs-list relative inline-flex items-center gap-0.5 rounded-lg p-0.5 ring ring-kumo-hairline/70 bg-kumo-recessed';
export const KUMO_TABS_TRIGGER_CLASS = 'relative my-0.5 rounded-md px-2.5 py-1 text-base text-kumo-subtle hover:text-kumo-default aria-selected:text-kumo-default aria-selected:bg-kumo-base aria-selected:ring aria-selected:ring-kumo-line aria-selected:font-medium focus:outline-none focus:ring-kumo-focus/50 focus-visible:ring-2 focus-visible:ring-kumo-brand';

// Meter (chunks/meter-*.js).
// React kumo: text-kumo-subtle (label), text-kumo-default (value), bg-kumo-fill (track),
// from-kumo-brand via-kumo-brand to-kumo-brand (fill).
export const KUMO_METER_ROOT_CLASS = 'flex w-full flex-col gap-2';
export const KUMO_METER_HEADER_CLASS = 'flex items-center justify-between gap-4';
export const KUMO_METER_LABEL_CLASS = 'text-xs text-kumo-subtle';
export const KUMO_METER_VALUE_CLASS = 'text-sm font-medium text-kumo-default tabular-nums';
export const KUMO_METER_TRACK_CLASS = 'relative h-2 w-full overflow-hidden rounded-full bg-kumo-fill';
export const KUMO_METER_FILL_CLASS = 'absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-kumo-brand via-kumo-brand to-kumo-brand transition-[width] duration-300 ease-out';
