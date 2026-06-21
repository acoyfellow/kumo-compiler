<script lang="ts">
  import type { Snippet } from 'svelte';
   const browser = typeof document !== 'undefined';

  export const modelDigest = "0f71542a2bd3b8e5809f5dbb979a7fe2448e19e4f007cced41a22cbc5ef4cba9";
  export type Props = {
  defaultValue?: unknown;
  disabled?: boolean;
  items?: unknown;
  onValueChange?: unknown;
  orientation?: unknown;
  value?: unknown;
  collection?: Snippet;
  root?: Snippet;
  onValueChange?: (value: unknown) => void;
  children?: Snippet;
  styles?: Record<string, string>;
  [key: string]: unknown;
};

  let {
    defaultValue = undefined,
    disabled = undefined,
    items = undefined,
    onValueChange = undefined,
    orientation = "vertical",
    value = undefined,
    collection = undefined,
    root = undefined,
    children,
    styles = {},
    ...rest
  }: Props = $props();
  let state_controlled = $state("value");
  let state_uncontrolled = $state("defaultValue");
  const props: Record<string, unknown> = { "defaultValue": defaultValue, "disabled": disabled, "items": items, "onValueChange": onValueChange, "orientation": orientation, "value": value };
  const state: Record<string, unknown> = { "controlled": state_controlled, "uncontrolled": state_uncontrolled };
  const refs: Record<string, HTMLElement | undefined> = {};
  const emitters: Array<{id:string,event:string,callback:string|null,value:()=>unknown}> = [];
  const focusTargets = new Set<string>();
  const lifecycles: Array<{id:string,phase:string}> = [];
  const services = new Set<string>();
  const layers = new Set<string>();
  const styleOperations: unknown[][] = [];
  const cx = (...values: unknown[]) => values.filter(Boolean).join(' ');
  state["controlled"] = state["controlled"];
  emitters.push({ id: "emit-2", event: "change", callback: null, value: () => null });
  void "render-3";
  focusTargets.add("root");
  refs["root"] ??= undefined;
  styleOperations.push([styles["root"]]);
</script>

<section data-kumo-part="root">
  {#if root}{@render root()}{/if}
</section>
<section data-kumo-part="collection">
  {#if collection}{@render collection()}{/if}
</section>
