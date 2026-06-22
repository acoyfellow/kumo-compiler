<script lang="ts">
  import type { Snippet } from 'svelte';

  export const modelDigest = "6680d3b6e5ef5e85c4340fd8369a05f55c9a388c2bfb7ada7da9eeb0eccd29f3";
  export type Props = { children?: Snippet; [key: string]: unknown };
  let { children, ...rest }: Props = $props();
</script>

<section data-kumo-part="NativeInput" {...rest}>
  {#if children}{@render children()}{/if}
</section>
