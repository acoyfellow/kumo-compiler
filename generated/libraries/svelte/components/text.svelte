<script lang="ts">
  import type { Snippet } from 'svelte';
   const browser = typeof document !== 'undefined';

  export const modelDigest = "19772bcfdc866198d1b6f48413057aaede6eb359bfb324e0ee9f1aa353f1b630";
  export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
  export type Props = {
  as?: unknown;
  bold?: boolean;
  children?: Snippet;
  DANGEROUS_className?: Snippet;
  DANGEROUS_style?: Snippet;
  size?: unknown;
  truncate?: boolean;
  variant?: unknown;
  styles?: Record<string, string>;
  [key: string]: unknown;
};

  let {
    as = undefined,
    bold = false,
    DANGEROUS_className = undefined,
    DANGEROUS_style = undefined,
    size = "base",
    truncate = false,
    variant = "body",
    children,
    styles = {},
    ...rest
  }: Props = $props();
  
  const props: Record<string, unknown> = { "as": as, "bold": bold, "children": children, "DANGEROUS_className": DANGEROUS_className, "DANGEROUS_style": DANGEROUS_style, "size": size, "truncate": truncate, "variant": variant };
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
