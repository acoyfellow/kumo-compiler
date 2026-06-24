<script>
  let { state = 'default', disabled = false, viewport = 390, dispatch = () => {} } = $props();
  let inactive = $derived(disabled || state === 'disabled');
</script>
<main data-component="field" data-state={state} data-part="root" class="p-8"><div class="grid gap-2 has-[input[type=checkbox]]:grid-cols-[auto_1fr] has-[input[type=checkbox]]:items-center has-[[role=switch]]:grid-cols-[auto_1fr] has-[[role=switch]]:items-center"><label id="field-label" for="field-input" class="m-0 select-none text-base font-medium text-kumo-default"><span class="inline-flex items-center gap-1">Project name</span></label><input id="field-input" data-part="control" class="h-9 rounded-lg px-3 ring ring-kumo-line" disabled={inactive} value="Kumo">{#if state === 'error'}<div id="field-message" class="text-sm leading-snug text-kumo-danger col-span-full">Required</div>{:else}<p id="field-message" class="text-sm leading-snug text-kumo-subtle col-span-full">Visible to your team.</p>{/if}</div></main>
