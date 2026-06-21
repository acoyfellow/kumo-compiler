<script lang="ts">
  import type { Snippet } from 'svelte';

  export const modelDigest = "ad3f10680d31c621c1bc54e0a910834f60fbc9d5776de398d94abac24dc0d45d";
  export type Props = { children?: Snippet; [key: string]: unknown };
  let { children, ...rest }: Props = $props();
</script>

<section data-kumo-part="Trigger" {...rest}>
  {#if children}{@render children()}{/if}
</section>
