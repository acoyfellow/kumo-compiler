<script lang="ts">
  import type { Snippet } from 'svelte';
   const browser = typeof document !== 'undefined';

  export const modelDigest = "fba8232e14f886639f5b9cf04c6dd04fc1c8b09852cd5feefd379fda9ded0e30";
  export type Props = {
  compound?: unknown;
  Content?: unknown;
  InputGroup?: unknown;
  root?: unknown;
  collection?: Snippet;
  children?: Snippet;
  styles?: Record<string, string>;
  [key: string]: unknown;
};

  let {
    compound = undefined,
    Content = undefined,
    InputGroup = undefined,
    root = undefined,
    collection = undefined,
    children,
    styles = {},
    ...rest
  }: Props = $props();
  let state_filter = $state("Base UI autocomplete filtering");
  let state_highlight = $state("none until navigation");
  let state_open = $state("controlled open or Base UI default closed");
  let state_value = $state("value, otherwise defaultValue");
  const props: Record<string, unknown> = { "compound": compound, "Content": Content, "InputGroup": InputGroup, "root": root };
  const state: Record<string, unknown> = { "filter": state_filter, "highlight": state_highlight, "open": state_open, "value": state_value };
  const refs: Record<string, HTMLElement | undefined> = {};
  const emitters: Array<{id:string,event:string,callback:string|null,value:()=>unknown}> = [];
  const focusTargets = new Set<string>();
  const lifecycles: Array<{id:string,phase:string}> = [];
  const services = new Set<string>();
  const layers = new Set<string>();
  const styleOperations: unknown[][] = [];
  const cx = (...values: unknown[]) => values.filter(Boolean).join(' ');
  void "render-1";
  state["highlight"] = state["highlight"];
  emitters.push({ id: "emit-3", event: "change", callback: null, value: () => null });
  refs["root"] ??= undefined;
  focusTargets.add("root");
  styleOperations.push([styles["root"]]);
</script>

<svelte:options customElement="kumo-autocomplete" />
<section data-kumo-part="root">
  {#if root}{@render root()}{/if}
</section>
<section data-kumo-part="collection">
  {#if collection}{@render collection()}{/if}
</section>
