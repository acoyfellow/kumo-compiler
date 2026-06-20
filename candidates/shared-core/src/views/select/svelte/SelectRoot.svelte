<script lang="ts">
  import { createSelectState, selectAria, transition, type SelectConfig, type SelectEvent, type SelectKey, type SelectState, type SelectValue } from '../../../select/index.js';
  import { provideSelectContext, runSelectEffects } from './context.js';

  interface Props extends SelectConfig {
    label: string;
    description?: string;
    error?: string;
    placeholder?: string;
    class?: string;
    onValueChange?: (value: string, optionId: string) => void;
    onOpenChange?: (open: boolean, reason: 'keyboard' | 'selection' | 'escape' | 'tab') => void;
    children?: import('svelte').Snippet;
  }

  let props: Props = $props();
  function initialProps(): Props { return props; }
  let state: SelectState = $state(createSelectState(initialProps()));
  let trigger: HTMLButtonElement | null = $state(null);
  let listbox: HTMLUListElement | null = $state(null);
  let controlledValue: SelectValue | undefined = $state(initialProps().value);
  let controlledOpen: boolean | undefined = $state(initialProps().open);
  let currentDisabled: boolean | undefined = $state(initialProps().disabled);

  const aria = $derived(selectAria(state));
  const selected = $derived(state.options.find((option) => option.value === state.value));

  function dispatch(event: SelectEvent) {
    const result = transition(state, event);
    state = result.state;
    runSelectEffects(result.effects, {
      trigger,
      listbox,
      option: (id) => document.getElementById(state.ids.option(id))
    }, {
      value: (value, optionId) => props.onValueChange?.(value, optionId),
      open: (open, reason) => props.onOpenChange?.(open, reason)
    });
  }

  function keydown(event: KeyboardEvent) {
    const keys: SelectKey[] = ['ArrowDown', 'ArrowUp', 'Home', 'End', 'PageDown', 'PageUp', 'Enter', ' ', 'Escape', 'Tab'];
    if (keys.includes(event.key as SelectKey)) {
      if (event.key !== 'Tab') event.preventDefault();
      dispatch({ type: 'key', key: event.key as SelectKey, now: performance.now() });
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      dispatch({ type: 'typeahead', text: event.key, now: performance.now() });
    }
  }

  provideSelectContext({
    getState: () => state,
    dispatch,
    optionAria: (option) => selectAria(state).option(option)
  });

  $effect(() => {
    if (props.value !== controlledValue) {
      controlledValue = props.value;
      if (props.value !== undefined) dispatch({ type: 'set-controlled-value', value: props.value });
    }
  });
  $effect(() => {
    if (props.open !== controlledOpen) {
      controlledOpen = props.open;
      if (props.open !== undefined) dispatch({ type: 'set-controlled-open', open: props.open });
    }
  });
  $effect(() => {
    if (props.disabled !== currentDisabled) {
      currentDisabled = props.disabled;
      dispatch({ type: 'set-disabled', disabled: props.disabled ?? false });
    }
  });
</script>

<div id={state.ids.root} class={props.class} data-kumo-select>
  <label {...aria.label}>{props.label}</label>
  <button
    bind:this={trigger}
    type="button"
    {...aria.trigger}
    disabled={state.disabled}
    onkeydown={keydown}
    onclick={() => dispatch({ type: 'key', key: state.open ? 'Escape' : 'Enter', now: performance.now() })}
  ><span id={state.ids.value}>{selected?.label ?? props.placeholder ?? ''}</span></button>
  {#if props.description}<div id={state.ids.description}>{props.description}</div>{/if}
  {#if props.error}<div id={state.ids.error}>{props.error}</div>{/if}
  <ul bind:this={listbox} {...aria.listbox} tabindex="-1" hidden={!state.open} onkeydown={keydown}>
    {@render props.children?.()}
  </ul>
</div>
