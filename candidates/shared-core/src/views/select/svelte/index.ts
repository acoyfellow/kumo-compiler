export { default as Root } from './SelectRoot.svelte';
export { default as Option } from './SelectOption.svelte';
export { default as SelectRoot } from './SelectRoot.svelte';
export { default as SelectOption } from './SelectOption.svelte';
export type { SelectViewContext } from './context.js';

/** Framework-local boundary metadata; LOC is checked by the fixture test. */
export const boundary = {
  contractVersion: '1.0.0',
  nativeFiles: ['SelectRoot.svelte', 'SelectOption.svelte', 'context.ts'],
  owns: ['context', 'bindings', 'option-lifecycle', 'effects', 'events', 'prop-sync', 'ssr-hydration'],
  escapeHatches: []
} as const;
