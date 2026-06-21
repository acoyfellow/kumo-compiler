<script lang="ts">
  import type { Snippet } from 'svelte';
   const browser = typeof document !== 'undefined';

  export const modelDigest = "67f224503fcce1b354d3848ac5a55b55587789af9fe0688a4849fef4ad5c8ec5";
  export type Props = {
  appearance?: unknown;
  children: unknown;
  className?: unknown;
  variant?: unknown;
  children?: Snippet;
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

<svelte:options customElement="kumo-badge" />
<span class={cx(styles["root"])}>
  {#if children}{@render children()}{/if}
</span>
