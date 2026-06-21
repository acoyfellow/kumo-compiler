<script lang="ts">
  import type { Snippet } from 'svelte';
   const browser = typeof document !== 'undefined';

  export const modelDigest = "c9dad696330b10c952f02f411171c962c2770f5c4b53cf81713d0397ef61abf8";
  export type Props = {
  children?: Snippet;
  className?: unknown;
  render?: unknown;
  styles?: Record<string, string>;
  [key: string]: unknown;
};

  let {
    className = undefined,
    render = undefined,
    children,
    styles = {},
    ...rest
  }: Props = $props();
  
  const props: Record<string, unknown> = { "children": children, "className": className, "render": render };
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
