<script lang="ts">
  import type { Snippet } from 'svelte';

  export const modelDigest = "25a19cbe99e84a9f4daf06d56a4f43a039827812a3623bc39919eb4683550b77";
  export type Props = { children?: Snippet; [key: string]: unknown };
  let { children, ...rest }: Props = $props();
</script>

<section data-kumo-part="GroupLabel" {...rest}>
  {#if children}{@render children()}{/if}
</section>
