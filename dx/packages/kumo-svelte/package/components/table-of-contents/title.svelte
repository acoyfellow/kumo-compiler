<script lang="ts">
  import type { Snippet } from 'svelte';

  export const modelDigest = "81f51f73fcb15fac9412c9a30a06ea03f1e2fa2292ec5b6197d72c106554a466";
  export type Props = { children?: Snippet; [key: string]: unknown };
  let { children, ...rest }: Props = $props();
</script>

<section data-kumo-part="Title" {...rest}>
  {#if children}{@render children()}{/if}
</section>
