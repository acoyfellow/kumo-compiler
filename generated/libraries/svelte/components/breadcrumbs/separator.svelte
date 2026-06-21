<script lang="ts">
  import type { Snippet } from 'svelte';

  export const modelDigest = "7a7f2d6ea60be21b23d218781fadea8b534345fab15d5b0896600e503857eb65";
  export type Props = { children?: Snippet; [key: string]: unknown };
  let { children, ...rest }: Props = $props();
</script>

<section data-kumo-part="Separator" {...rest}>
  {#if children}{@render children()}{/if}
</section>
