<script lang="ts">
  import type { Snippet } from 'svelte';

  export const modelDigest = "7e72307448756ba3dce186fdd6d001623e82bf54634bcb1dd046b6ec82f31bf6";
  export type Props = { children?: Snippet; [key: string]: unknown };
  let { children, ...rest }: Props = $props();
</script>

<section data-kumo-part="Input" {...rest}>
  {#if children}{@render children()}{/if}
</section>
