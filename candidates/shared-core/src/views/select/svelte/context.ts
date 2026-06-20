import { getContext, setContext } from 'svelte';
import type { SelectEffect, SelectEvent, SelectOption, SelectState } from '../../../select/index.js';

const SELECT_CONTEXT = Symbol('kumo-select');

export interface SelectViewContext {
  getState(): SelectState;
  dispatch(event: SelectEvent): void;
  optionAria(option: SelectOption): Record<string, unknown>;
}

export function provideSelectContext(context: SelectViewContext): void {
  setContext(SELECT_CONTEXT, context);
}

export function useSelectContext(): SelectViewContext {
  const context = getContext<SelectViewContext>(SELECT_CONTEXT);
  if (!context) throw new Error('Select.Option must be rendered inside Select.Root');
  return context;
}

export function runSelectEffects(
  effects: readonly SelectEffect[],
  elements: { trigger: HTMLElement | null; listbox: HTMLElement | null; option(id: string): HTMLElement | null },
  callbacks: {
    value(value: string, optionId: string): void;
    open(open: boolean, reason: Extract<SelectEffect, { type: 'open-change' }>['reason']): void;
  }
): void {
  for (const effect of effects) {
    if (effect.type === 'value-change') callbacks.value(effect.value, effect.optionId);
    else if (effect.type === 'open-change') callbacks.open(effect.open, effect.reason);
    else if (effect.type === 'focus') elements[effect.target]?.focus();
    else elements.option(effect.optionId)?.scrollIntoView({ block: effect.alignment });
  }
}
