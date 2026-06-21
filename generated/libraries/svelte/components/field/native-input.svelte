<script lang="ts">
  import type { Snippet } from 'svelte';

  export const modelDigest = "c8c1c62130c1f34d0061c3ea6adadfe4728a10920f9906960684ff48e50325c7";
  export type Props = { children?: Snippet; [key: string]: unknown };
  let { children, ...rest }: Props = $props();
</script>

<section data-kumo-part="NativeInput" {...rest}>
  {#if children}{@render children()}{/if}
</section>
