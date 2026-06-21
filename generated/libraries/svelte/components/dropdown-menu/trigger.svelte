<script lang="ts">
  import type { Snippet } from 'svelte';

  export const modelDigest = "4af0c8a7d7b8b60e856eaff59dc37b9cf13972ebeb4a5efd3e6776a353898221";
  export type Props = { children?: Snippet; [key: string]: unknown };
  let { children, ...rest }: Props = $props();
</script>

<section data-kumo-part="Trigger" {...rest}>
  {#if children}{@render children()}{/if}
</section>
