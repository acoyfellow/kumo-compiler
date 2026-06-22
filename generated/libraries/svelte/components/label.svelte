<script lang="ts">
  import type { Snippet } from 'svelte';
   const browser = typeof document !== 'undefined';

  export const modelDigest = "5095f41d10b4171b26a76054676cdd46240c352d0283a678dedfe13047e9ca2f";
  export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
  export type Props = {
  asContent?: boolean;
  children: Snippet;
  className?: unknown;
  htmlFor?: unknown;
  showOptional?: boolean;
  tooltip?: unknown;
  styles?: Record<string, string>;
  [key: string]: unknown;
};

  let {
    asContent = false,
    className = undefined,
    htmlFor = undefined,
    showOptional = false,
    tooltip = undefined,
    children,
    styles = {},
    ...rest
  }: Props = $props();
  
  const props: Record<string, unknown> = { "asContent": asContent, "children": children, "className": className, "htmlFor": htmlFor, "showOptional": showOptional, "tooltip": tooltip };
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
  refs["root"] ??= undefined;
  styleOperations.push([styles["root"]]);
</script>

<label class={cx(styles["root"])}>
  {#if children}{@render children()}{/if}
</label>
