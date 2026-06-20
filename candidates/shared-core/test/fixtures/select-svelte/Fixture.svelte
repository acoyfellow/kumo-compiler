<script lang="ts">
  import { SelectRoot, SelectOption } from '../../../src/views/select/svelte/index.js';
  let value: string | null = $state(null);
</script>

<SelectRoot idSeed="fixture" label="Account" description="Choose an account" bind:value onValueChange={(next) => value = next}>
  <SelectOption id="personal" value="personal" label="Personal" />
  <SelectOption id="team" value="team" label="Team" />
</SelectRoot>
