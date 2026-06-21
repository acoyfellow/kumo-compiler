<script lang="ts">
  import type { Snippet } from 'svelte';

  export const modelDigest = "2a86761805e0e78f84a2b578b9b43656181ffd9f47ad91f4c17c81f6977c99c7";
  export type Props = { children?: Snippet; [key: string]: unknown };
  let { children, ...rest }: Props = $props();
</script>

<section data-kumo-part="Row" {...rest}>
  {#if children}{@render children()}{/if}
</section>
