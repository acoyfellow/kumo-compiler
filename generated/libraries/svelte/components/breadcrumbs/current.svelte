<script lang="ts">
  import type { Snippet } from 'svelte';

  export const modelDigest = "b6e5e0d42071bc3fa59e912c2fa0d704cc3acc039749d4c109e804bab44b4b15";
  export type Props = { children?: Snippet; [key: string]: unknown };
  let { children, ...rest }: Props = $props();
</script>

<section data-kumo-part="Current" {...rest}>
  {#if children}{@render children()}{/if}
</section>
