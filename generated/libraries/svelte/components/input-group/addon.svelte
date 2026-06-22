<script lang="ts">
  import type { Snippet } from 'svelte';

  export const modelDigest = "aec5871cdfdf97c938fb06aeb6a15dedd413550ce59bca231f5fe2e61f6d347c";
  export type Props = { children?: Snippet; [key: string]: unknown };
  let { children, ...rest }: Props = $props();
</script>

<section data-kumo-part="Addon" {...rest}>
  {#if children}{@render children()}{/if}
</section>
