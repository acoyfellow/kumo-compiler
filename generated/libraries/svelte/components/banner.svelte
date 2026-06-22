<script lang="ts">
  import type { Snippet } from 'svelte';
   const browser = typeof document !== 'undefined';

  export const modelDigest = "e57b4fc419d2b1310d0ea4963a5181380a89060415280931c0e7698f1cd2ede2";
  export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
  export type Props = {
  action?: Snippet;
  children?: Snippet;
  className?: unknown;
  description?: Snippet;
  icon?: Snippet;
  text?: unknown;
  title?: unknown;
  variant?: unknown;
  styles?: Record<string, string>;
  [key: string]: unknown;
};

  let {
    action = undefined,
    className = undefined,
    description = undefined,
    icon = undefined,
    text = undefined,
    title = undefined,
    variant = "default",
    children,
    styles = {},
    ...rest
  }: Props = $props();
  
  const props: Record<string, unknown> = { "action": action, "children": children, "className": className, "description": description, "icon": icon, "text": text, "title": title, "variant": variant };
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

<section class={cx(styles["root"])}>
  {#if icon}{@render icon()}{/if}
  {props["title"]}
  {#if description}{@render description()}{/if}
  {#if action}{@render action()}{/if}
  {#if children}{@render children()}{/if}
</section>
