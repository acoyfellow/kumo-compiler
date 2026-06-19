<script>
export let label=''; export let disabled=false; export let value=''; export let placeholder=''; export let error=''; export let description='';
</script>
<label class="kumo-label">{label}<select class="kumo-control" {disabled} bind:value>{#if placeholder}<option disabled>{placeholder}</option>{/if}<option>Apple</option><option>Banana</option><option>Cherry</option></select>{#if error}<span class="kumo-error">{error}</span>{:else if description}<span class="kumo-description">{description}</span>{/if}</label>
