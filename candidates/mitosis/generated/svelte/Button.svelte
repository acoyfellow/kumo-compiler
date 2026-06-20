<script lang="ts">
  export let disabled;
  export let onClick;
</script>

<button
  type="button"
  {disabled}
  on:click={(event) => {
    onClick();
  }}><slot /></button
>