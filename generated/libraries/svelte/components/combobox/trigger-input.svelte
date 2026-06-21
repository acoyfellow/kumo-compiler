<script lang="ts">
  import type { Snippet } from 'svelte';

  export const modelDigest = "e632de38d37be35b83ed3e093ba4e52fbd67247aa10eff83bf2ac59fb1398a41";
  export type Props = { children?: Snippet; [key: string]: unknown };
  let { children, ...rest }: Props = $props();
</script>

<section data-kumo-part="TriggerInput" {...rest}>
  {#if children}{@render children()}{/if}
</section>
