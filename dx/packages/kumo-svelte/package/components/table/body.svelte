<script lang="ts">
  import type { Snippet } from 'svelte';

  export const modelDigest = "2cdb90ceb5108dea275b1e150e3868126326b95d7efef9ed8459d14ef57345b9";
  export type Props = { children?: Snippet; [key: string]: unknown };
  let { children, ...rest }: Props = $props();
</script>

<section data-kumo-part="Body" {...rest}>
  {#if children}{@render children()}{/if}
</section>
