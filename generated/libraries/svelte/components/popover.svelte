<script lang="ts">
  import type { Snippet } from 'svelte';
   const browser = typeof document !== 'undefined';

  export const modelDigest = "34d7ee992f8f6e187cd36b1471f571733ec206033242ce3ffd4aab7a353a5f8b";
  export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
  export type Props = {
  Close?: Snippet;
  Content?: Snippet;
  Root?: Snippet;
  "Title/Description"?: Snippet;
  Trigger?: Snippet;
  popover?: Snippet;
  children?: Snippet;
  styles?: Record<string, string>;
  [key: string]: unknown;
};

  let {
    Close = undefined,
    Content = undefined,
    Root = undefined,
    Title_Description = undefined,
    Trigger = undefined,
    popover = undefined,
    children,
    styles = {},
    ...rest
  }: Props = $props();
  let state_anchor = $state("trigger unless explicit element/ref/virtual element/resolver");
  let state_focus = $state("trigger remains focusable");
  let state_open = $state("defaultOpen or controlled open; otherwise false");
  const props: Record<string, unknown> = { "Close": Close, "Content": Content, "Root": Root, "Title/Description": Title_Description, "Trigger": Trigger };
  const state: Record<string, unknown> = { "anchor": state_anchor, "focus": state_focus, "open": state_open };
  const refs: Record<string, HTMLElement | undefined> = {};
  const emitters: Array<{id:string,event:string,callback:string|null,value:()=>unknown}> = [];
  const focusTargets = new Set<string>();
  const lifecycles: Array<{id:string,phase:string}> = [];
  const services = new Set<string>();
  const layers = new Set<string>();
  const styleOperations: unknown[][] = [];
  const cx = (...values: unknown[]) => values.filter(Boolean).join(' ');
  void "render-1";
  state["focus"] = state["focus"];
  emitters.push({ id: "emit-3", event: "change", callback: null, value: () => null });
  layers.add("popover");
  lifecycles.push({ id: "lifecycle-5", phase: "mounted" });
  services.add("environment");
  styleOperations.push([styles["root"]]);
</script>

{#if browser}
  <div data-kumo-portal-target={"document-body"} data-kumo-layer="popover">
    <section data-kumo-part="popover">
      {#if popover}{@render popover()}{/if}
    </section>
  </div>
{/if}
