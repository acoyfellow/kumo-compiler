<script lang="ts">
  import type { Snippet } from 'svelte';

  export const modelDigest = "0c3f889199eb1006a83fb3d1f7315e54f420dbb14327c8661decd4eb1b7a3215";
  export type Props = { children?: Snippet; [key: string]: unknown };
  let { children, ...rest }: Props = $props();
</script>

<section data-kumo-part="Option" {...rest}>
  {#if children}{@render children()}{/if}
</section>
