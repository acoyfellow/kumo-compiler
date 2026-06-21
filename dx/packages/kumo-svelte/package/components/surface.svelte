<script lang="ts">
  import type { Snippet } from 'svelte';
   const browser = typeof document !== 'undefined';

  export const modelDigest = "ce6505b3ce28964f1d8bb565e8a04a6c23ab186f8a5afc3a83dc631e65c3914e";
  export type Props = {
  as?: unknown;
  children?: Snippet;
  className?: unknown;
  color?: unknown;
  render?: unknown;
  styles?: Record<string, string>;
  [key: string]: unknown;
};

  let {
    as = undefined,
    className = undefined,
    color = "primary",
    render = undefined,
    children,
    styles = {},
    ...rest
  }: Props = $props();
  
  const props: Record<string, unknown> = { "as": as, "children": children, "className": className, "color": color, "render": render };
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

<div class={cx(styles["root"])}>
  {#if children}{@render children()}{/if}
</div>
