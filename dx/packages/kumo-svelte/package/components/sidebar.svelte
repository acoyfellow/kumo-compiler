<script lang="ts">
  import type { Snippet } from 'svelte';
   const browser = typeof document !== 'undefined';

  export const modelDigest = "82a1db07c782ac79373452b65cf7a972c8a0ea464dda72ff3fb69e7091df72c5";
  export type Props = {
  Collapsible?: Snippet;
  CollapsibleTrigger?: Snippet;
  MenuButton?: Snippet;
  MenuSubButton?: Snippet;
  Provider?: Snippet;
  root?: Snippet;
  SlidingView?: Snippet;
  SlidingViews?: Snippet;
  collection?: Snippet;
  children?: Snippet;
  styles?: Record<string, string>;
  [key: string]: unknown;
};

  let {
    Collapsible = undefined,
    CollapsibleTrigger = undefined,
    MenuButton = undefined,
    MenuSubButton = undefined,
    Provider = undefined,
    root = undefined,
    SlidingView = undefined,
    SlidingViews = undefined,
    collection = undefined,
    children,
    styles = {},
    ...rest
  }: Props = $props();
  let state_isMobile = $state("false during SSR because window is absent");
  let state_isPeeking = $state(false);
  let state_isResizing = $state(false);
  let state_openMobile = $state(false);
  let state_state = $state("expanded when defaultOpen true, otherwise collapsed; peeking while transient peek is active");
  let state_width = $state("defaultWidth, clamped only when setWidth is called");
  const props: Record<string, unknown> = { "Collapsible": Collapsible, "CollapsibleTrigger": CollapsibleTrigger, "MenuButton": MenuButton, "MenuSubButton": MenuSubButton, "Provider": Provider, "root": root, "SlidingView": SlidingView, "SlidingViews": SlidingViews };
  const state: Record<string, unknown> = { "isMobile": state_isMobile, "isPeeking": state_isPeeking, "isResizing": state_isResizing, "openMobile": state_openMobile, "state": state_state, "width": state_width };
  const refs: Record<string, HTMLElement | undefined> = {};
  const emitters: Array<{id:string,event:string,callback:string|null,value:()=>unknown}> = [];
  const focusTargets = new Set<string>();
  const lifecycles: Array<{id:string,phase:string}> = [];
  const services = new Set<string>();
  const layers = new Set<string>();
  const styleOperations: unknown[][] = [];
  const cx = (...values: unknown[]) => values.filter(Boolean).join(' ');
  void "render-1";
  state["isPeeking"] = state["isPeeking"];
  emitters.push({ id: "emit-3", event: "change", callback: null, value: () => null });
  layers.add("sidebar");
  lifecycles.push({ id: "lifecycle-5", phase: "mounted" });
  focusTargets.add("root");
  refs["root"] ??= undefined;
  services.add("environment");
  styleOperations.push([styles["root"]]);
</script>

<section data-kumo-part="root">
  {#if root}{@render root()}{/if}
</section>
<section data-kumo-part="collection">
  {#if collection}{@render collection()}{/if}
</section>
