<script lang="ts">
  import type { Snippet } from 'svelte';
   const browser = typeof document !== 'undefined';

  export const modelDigest = "9d4b8d811da622ddf7ca92cd6b3f7e4f76e0d35094bab50ce0d03c2e4bde88ba";
  export type Props = {
  children?: Snippet;
  className?: unknown;
  layout?: unknown;
  styles?: Record<string, string>;
  [key: string]: unknown;
};

  let {
    className = undefined,
    layout = "auto",
    children,
    styles = {},
    ...rest
  }: Props = $props();
  
  const props: Record<string, unknown> = { "children": children, "className": className, "layout": layout };
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

<table class={cx(styles["root"])}>
  {#if children}{@render children()}{/if}
</table>
