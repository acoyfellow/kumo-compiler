<script lang="ts">
  import type { Snippet } from 'svelte';

  export const modelDigest = "4aabec222bec5b00f25388a2bb017b36c91349e55fa3ba6cb97fdc3d0afee0c0";
  export type Props = { children?: Snippet; [key: string]: unknown };
  let { children, ...rest }: Props = $props();
</script>

<section data-kumo-part="HighlightedText" {...rest}>
  {#if children}{@render children()}{/if}
</section>
