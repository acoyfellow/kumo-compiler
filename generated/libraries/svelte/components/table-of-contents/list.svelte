<script lang="ts">
  import type { Snippet } from 'svelte';

  export const modelDigest = "7070aecae3ff837a6f60e90d4080694b57defbff08207b8fa4e0e8a96b892b94";
  export type Props = { children?: Snippet; [key: string]: unknown };
  let { children, ...rest }: Props = $props();
</script>

<section data-kumo-part="List" {...rest}>
  {#if children}{@render children()}{/if}
</section>
