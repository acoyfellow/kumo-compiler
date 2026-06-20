<script lang="ts">
  export let label;
  export let value;
  export let onChange;
</script>

<label
  >{label}<input
    type="date"
    {value}
    on:input={(event) => {
      onChange(event.target.value);
    }}
  /></label
>