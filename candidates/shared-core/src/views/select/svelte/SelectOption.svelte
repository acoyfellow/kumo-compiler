<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { SelectOptionInput } from '../../../select/index.js';
  import { useSelectContext } from './context.js';

  interface Props extends SelectOptionInput {
    children?: import('svelte').Snippet;
    class?: string;
  }

  let props: Props = $props();
  const select = useSelectContext();
  let registered: SelectOptionInput | null = null;

  $effect(() => {
    const option = { id: props.id, value: props.value, label: props.label, disabled: props.disabled, order: props.order };
    select.dispatch({ type: 'register', option });
    registered = option;
  });

  onDestroy(() => {
    if (registered) select.dispatch({ type: 'unregister', id: registered.id });
  });

  const option = $derived(select.getState().options.find((item) => item.id === props.id));
  const attrs = $derived(option ? select.optionAria(option) : {
    id: select.getState().ids.option(props.id), role: 'option', 'aria-selected': false,
    ...(props.disabled ? { 'aria-disabled': true } : {})
  });
</script>

<li
  {...attrs}
  class={props.class}
  data-active={select.getState().activeId === props.id || undefined}
  onclick={() => !props.disabled && select.dispatch({ type: 'select', id: props.id })}
>
  {#if props.children}{@render props.children()}{:else}{props.label}{/if}
</li>
