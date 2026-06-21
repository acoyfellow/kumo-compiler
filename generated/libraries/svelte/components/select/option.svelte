<script lang="ts">
  import type { Snippet } from 'svelte';

  export const modelDigest = "3f2897eb8908155ffa6e7d283e13a1cb3e8fc78e30a7b8fe0b1e7bd26f839f11";
  export type Props = { children?: Snippet; [key: string]: unknown };
  let { children, ...rest }: Props = $props();
</script>

<section data-kumo-part="Option" {...rest}>
  {#if children}{@render children()}{/if}
</section>
