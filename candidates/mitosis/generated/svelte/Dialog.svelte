<script lang="ts">
  export let title;
  export let open;

  export let onClose;
</script>

<div role="dialog" aria-modal="true" aria-label={title} hidden={!open}>
  <slot /><button
    on:click={(event) => {
      onClose();
    }}>Close</button
  >
</div>