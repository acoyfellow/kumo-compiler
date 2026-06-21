<script lang="ts">
  import type { Snippet } from 'svelte';
   const browser = typeof document !== 'undefined';

  export const modelDigest = "9dbbb8c1edc23a0a1b2ed65add8ac4c1a675b5b9f0afbdb9eae72871c290ace3";
  export type Props = {
  children?: Snippet;
  className?: unknown;
  gap?: unknown;
  mobileDivider?: boolean;
  variant?: unknown;
  styles?: Record<string, string>;
  [key: string]: unknown;
};

  let {
    className = undefined,
    gap = "base",
    mobileDivider = undefined,
    variant = undefined,
    children,
    styles = {},
    ...rest
  }: Props = $props();
  
  const props: Record<string, unknown> = { "children": children, "className": className, "gap": gap, "mobileDivider": mobileDivider, "variant": variant };
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
