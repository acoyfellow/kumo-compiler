<script lang="ts">
  export let label;

  let open = false;
</script>

<div>
  <button
    aria-expanded={open}
    on:click={(event) => {
      open = !open;
    }}>{label}</button
  >
  <div hidden={!open}><slot /></div>
</div>