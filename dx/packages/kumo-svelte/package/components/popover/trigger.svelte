<script lang="ts">
  import type { Snippet } from 'svelte';

  export const modelDigest = "34d7ee992f8f6e187cd36b1471f571733ec206033242ce3ffd4aab7a353a5f8b";
  export type Props = { children?: Snippet; [key: string]: unknown };
  let { children, ...rest }: Props = $props();
</script>

<section data-kumo-part="Trigger" {...rest}>
  {#if children}{@render children()}{/if}
</section>
