<script lang="ts">
  import type { Snippet } from 'svelte';

  export const modelDigest = "4c801e32de9aeeb481f09910a3cf18fe74e2893bb998ef9d4abdf950ffda4b13";
  export type Props = { children?: Snippet; [key: string]: unknown };
  let { children, ...rest }: Props = $props();
</script>

<section data-kumo-part="Provider" {...rest}>
  {#if children}{@render children()}{/if}
</section>
