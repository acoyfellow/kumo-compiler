<script lang="ts">
  export let label;
  export let value;
  export let onChange;
  export let options;
</script>

<label
  >{label}<select
    {value}
    on:change={(event) => {
      onChange(event.target.value);
    }}
  >
    {#each options as option}
      <option value={option}>{option}</option>
    {/each}
  </select></label
>