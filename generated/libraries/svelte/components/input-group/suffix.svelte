<script lang="ts">
  import type { Snippet } from 'svelte';

  export const modelDigest = "723d817c6c81e88062ee871968eac6318dc1176c7b9e92c407d7f7a29445d8c3";
  export type Props = { children?: Snippet; [key: string]: unknown };
  let { children, ...rest }: Props = $props();
</script>

<section data-kumo-part="Suffix" {...rest}>
  {#if children}{@render children()}{/if}
</section>
