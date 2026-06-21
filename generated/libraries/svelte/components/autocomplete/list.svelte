<script lang="ts">
  import type { Snippet } from 'svelte';

  export const modelDigest = "1f41380c0300c6ab1aa370e5a96ed529bb1bdfb6d60bfcaaa9df23cd23dd8b07";
  export type Props = { children?: Snippet; [key: string]: unknown };
  let { children, ...rest }: Props = $props();
</script>

<section data-kumo-part="List" {...rest}>
  {#if children}{@render children()}{/if}
</section>
