<script lang="ts">
  import type { Snippet } from 'svelte';
   const browser = typeof document !== 'undefined';

  export const modelDigest = "4aabec222bec5b00f25388a2bb017b36c91349e55fa3ba6cb97fdc3d0afee0c0";
  export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
  export type Props = {
  compound?: Snippet;
  Dialog?: Snippet;
  Input?: Snippet;
  Panel?: Snippet;
  Root?: Snippet;
  collection?: Snippet;
  root?: Snippet;
  children?: Snippet;
  styles?: Record<string, string>;
  [key: string]: unknown;
};

  let {
    compound = undefined,
    Dialog = undefined,
    Input = undefined,
    Panel = undefined,
    Root = undefined,
    collection = undefined,
    root = undefined,
    children,
    styles = {},
    ...rest
  }: Props = $props();
  let state_highlight = $state("first result auto-highlighted always and kept as results change");
  let state_modal = $state(true);
  let state_open = $state("required controlled boolean");
  let state_query = $state("controlled value or empty");
  const props: Record<string, unknown> = { "compound": compound, "Dialog": Dialog, "Input": Input, "Panel": Panel, "Root": Root };
  const state: Record<string, unknown> = { "highlight": state_highlight, "modal": state_modal, "open": state_open, "query": state_query };
  const refs: Record<string, HTMLElement | undefined> = {};
  const emitters: Array<{id:string,event:string,callback:string|null,value:()=>unknown}> = [];
  const focusTargets = new Set<string>();
  const lifecycles: Array<{id:string,phase:string}> = [];
  const services = new Set<string>();
  const layers = new Set<string>();
  const styleOperations: unknown[][] = [];
  const cx = (...values: unknown[]) => values.filter(Boolean).join(' ');
  void "render-1";
  state["modal"] = state["modal"];
  emitters.push({ id: "emit-3", event: "change", callback: null, value: () => null });
  focusTargets.add("root");
  layers.add("command-palette");
  lifecycles.push({ id: "lifecycle-6", phase: "mounted" });
  refs["root"] ??= undefined;
  styleOperations.push([styles["root"]]);
</script>

<section data-kumo-part="root">
  {#if root}{@render root()}{/if}
</section>
<section data-kumo-part="collection">
  {#if collection}{@render collection()}{/if}
</section>
