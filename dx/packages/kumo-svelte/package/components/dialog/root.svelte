<script lang="ts">
  import type { Snippet } from 'svelte';

  export const modelDigest = "7f6bdd127570c71956f3e4a345c1dbc0fa7bbc62e2a653d6239a37b232cbf01f";
  export type Props = { children?: Snippet; [key: string]: unknown };
  let { children, ...rest }: Props = $props();
</script>

<section data-kumo-part="Root" {...rest}>
  {#if children}{@render children()}{/if}
</section>
