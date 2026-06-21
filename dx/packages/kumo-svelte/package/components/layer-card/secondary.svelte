<script lang="ts">
  import type { Snippet } from 'svelte';

  export const modelDigest = "0863b724219652fb6b34a5c3bc5564e8fc766a990f62178c6a66e5f17aa8ae1f";
  export type Props = { children?: Snippet; [key: string]: unknown };
  let { children, ...rest }: Props = $props();
</script>

<section data-kumo-part="Secondary" {...rest}>
  {#if children}{@render children()}{/if}
</section>
