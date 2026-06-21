<script lang="ts">
  export let labels;

  let active = 0;
</script>

<div>
  <div role="tablist">
    {#each labels as label, index}
      <button
        role="tab"
        aria-selected={active === index}
        on:click={(event) => {
          active = index;
        }}>{label}</button
      >
    {/each}
  </div>
  <div role="tabpanel">{labels[active]}</div>
</div>