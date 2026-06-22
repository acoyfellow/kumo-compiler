<script lang="ts">
  import type { Snippet } from 'svelte';
   const browser = typeof document !== 'undefined';

  export const modelDigest = "d61594f3236e8d7e4602671f3db5548b0873d563cfc52c9d9249597042a2cf31";
  export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
  export type Props = {
  appearance?: unknown;
  children: Snippet;
  className?: unknown;
  variant?: unknown;
  styles?: Record<string, string>;
  [key: string]: unknown;
};

  let {
    appearance = "filled",
    className = undefined,
    variant = "primary",
    children,
    styles = {},
    ...rest
  }: Props = $props();
  
  const props: Record<string, unknown> = { "appearance": appearance, "children": children, "className": className, "variant": variant };
  const state: Record<string, unknown> = {  };
  const refs: Record<string, HTMLElement | undefined> = {};
  const emitters: Array<{id:string,event:string,callback:string|null,value:()=>unknown}> = [];
  const focusTargets = new Set<string>();
  const lifecycles: Array<{id:string,phase:string}> = [];
  const services = new Set<string>();
  const layers = new Set<string>();
  const styleOperations: unknown[][] = [];
  const cx = (...values: unknown[]) => values.filter(Boolean).join(' ');
  void "render-1";
  styleOperations.push([styles["root"]]);
</script>

<span class={cx(styles["root"])}>
  {#if children}{@render children()}{/if}
</span>
