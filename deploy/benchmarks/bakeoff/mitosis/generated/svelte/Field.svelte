<script lang="ts">
  export let label;
  export let value;
  export let onInput;
</script>

<label
  >{label}<input
    {value}
    on:input={(event) => {
      onInput(event.target.value);
    }}
  /></label
>