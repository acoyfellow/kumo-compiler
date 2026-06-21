<script lang="ts">
  import type { Snippet } from 'svelte';
   const browser = typeof document !== 'undefined';

  export const modelDigest = "96819ff5ff77c94bea48a81f92da6a4857acc3495fbbd3f4eb7703e24db317d6";
  export type Props = {
  children?: unknown;
  container?: unknown;
  toastManager?: unknown;
  variant?: unknown;
  collection?: Snippet;
  root?: Snippet;
  children?: Snippet;
  styles?: Record<string, string>;
  [key: string]: unknown;
};

  let {
    container = "provider container or document.body",
    toastManager = undefined,
    variant = "default",
    collection = undefined,
    root = undefined,
    children,
    styles = {},
    ...rest
  }: Props = $props();
  let state_toasts = $state("manager state");
  let state_viewport = $state("portaled after hydration");
  const props: Record<string, unknown> = { "children": children, "container": container, "toastManager": toastManager, "variant": variant };
  const state: Record<string, unknown> = { "toasts": state_toasts, "viewport": state_viewport };
  const refs: Record<string, HTMLElement | undefined> = {};
  const emitters: Array<{id:string,event:string,callback:string|null,value:()=>unknown}> = [];
  const focusTargets = new Set<string>();
  const lifecycles: Array<{id:string,phase:string}> = [];
  const services = new Set<string>();
  const layers = new Set<string>();
  const styleOperations: unknown[][] = [];
  const cx = (...values: unknown[]) => values.filter(Boolean).join(' ');
  void "render-1";
  state["viewport"] = state["viewport"];
  emitters.push({ id: "emit-3", event: "change", callback: null, value: () => null });
  services.add("clipboard");
  layers.add("toasty");
  lifecycles.push({ id: "lifecycle-6", phase: "mounted" });
  styleOperations.push([styles["root"]]);
</script>

<svelte:options customElement="kumo-toasty" />
<section data-kumo-part="root">
  {#if root}{@render root()}{/if}
</section>
<section data-kumo-part="collection">
  {#if collection}{@render collection()}{/if}
</section>
