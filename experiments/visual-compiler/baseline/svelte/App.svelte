<script>
  import Button from './Button.svelte';
  import Checkbox from './Checkbox.svelte';
  import Field from './Field.svelte';
  import Popover from './Popover.svelte';
  let { component = 'button', state = 'default', viewport = 390, dispatch = () => {} } = $props();
  const components = { button: Button, checkbox: Checkbox, field: Field, popover: Popover };
  let Current = $derived(components[component]);
</script>
<Current {state} {viewport} {dispatch}/>
