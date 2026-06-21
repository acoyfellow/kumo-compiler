<script lang="ts">
  import type { Snippet } from 'svelte';
   const browser = typeof document !== 'undefined';

  export const modelDigest = "1cb602a165516ca01de95379b40403eb61ab498fa6557f44ddeb0f0f5d0d9e4f";
  export type Props = {
  children?: Snippet;
  className?: unknown;
  size?: unknown;
  styles?: Record<string, string>;
  [key: string]: unknown;
};

  let {
    className = undefined,
    size = "base",
    children,
    styles = {},
    ...rest
  }: Props = $props();
  
  const props: Record<string, unknown> = { "children": children, "className": className, "size": size };
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

<nav aria-label={"Breadcrumbs"} class={cx(styles["root"])}>
  {#if children}{@render children()}{/if}
</nav>
