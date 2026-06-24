<script>
  let { state = 'default', disabled = false, loading = false, viewport = 390, dispatch = () => {} } = $props();
  const base = 'group flex w-max shrink-0 items-center font-medium select-none border-0 shadow-xs focus:outline-none focus:ring-kumo-focus/50 focus-visible:ring-2 focus-visible:ring-kumo-brand disabled:cursor-not-allowed disabled:text-kumo-subtle bg-kumo-base !text-kumo-default ring not-disabled:hover:bg-kumo-tint disabled:bg-kumo-base/50 disabled:!text-kumo-default/70 ring-kumo-line data-[state=open]:bg-kumo-base h-9 gap-1.5 rounded-lg px-3 text-base';
  let busy = $derived(loading || state === 'loading');
  let inactive = $derived(disabled || state === 'disabled' || busy);
</script>
<main data-component="button" data-state={state} data-part="root" class="p-8">
  <button data-kumo-component="Button" class={`${base}${state === 'default' ? ' cursor-pointer' : ''}${state === 'disabled' ? ' cursor-not-allowed opacity-50' : ''}`} type="button" data-part="control" disabled={inactive} onclick={() => dispatch('click')}>
    {#if busy}<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" style="height:14px;width:14px" role="status" aria-label="Loading"><circle cx="12" cy="12" r="9.5" fill="none" stroke-width="2" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="2s" repeatCount="indefinite"/><animate attributeName="stroke-dasharray" values="0 150;42 150;42 150" keyTimes="0;0.5;1" dur="1.5s" repeatCount="indefinite"/><animate attributeName="stroke-dashoffset" values="0;-16;-59" keyTimes="0;0.5;1" dur="1.5s" repeatCount="indefinite"/></circle><circle cx="12" cy="12" r="9.5" fill="none" opacity="0.1" stroke-width="2" stroke-linecap="round"/></svg>{/if}
    <span class="contents">{busy ? 'Loading' : 'Continue'}</span>
  </button>
</main>
