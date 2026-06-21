<script lang="ts">
  import type { Snippet } from 'svelte';
   const browser = typeof document !== 'undefined';

  export const modelDigest = "12a3eb7f1d84d603ca914b803a794e948b5b62e88a1981d4ebb270f13b6bf69c";
  export type Props = {
  "aria-label/aria-labelledby"?: unknown;
  children?: Snippet;
  container?: unknown;
  hideLabel?: boolean;
  items?: unknown;
  label?: unknown;
  "labelTooltip/description/error"?: unknown;
  "placeholder/loading/disabled/required"?: unknown;
  renderValue?: unknown;
  Root?: Snippet;
  size?: unknown;
  collection?: Snippet;
  root?: Snippet;
  styles?: Record<string, string>;
  [key: string]: unknown;
};

  let {
    aria_label_aria_labelledby = undefined,
    container = undefined,
    hideLabel = undefined,
    items = undefined,
    label = undefined,
    labelTooltip_description_error = undefined,
    placeholder_loading_disabled_required = undefined,
    renderValue = undefined,
    Root = undefined,
    size = "base",
    collection = undefined,
    root = undefined,
    children,
    styles = {},
    ...rest
  }: Props = $props();
  let state_disabled = $state("from root and item descriptor/Option props");
  let state_highlightedOption = $state(null);
  let state_open = $state("controlled open, else defaultOpen, else false");
  let state_value = $state("controlled value, else defaultValue, else null or [] in multiple mode");
  const props: Record<string, unknown> = { "aria-label/aria-labelledby": aria_label_aria_labelledby, "children": children, "container": container, "hideLabel": hideLabel, "items": items, "label": label, "labelTooltip/description/error": labelTooltip_description_error, "placeholder/loading/disabled/required": placeholder_loading_disabled_required, "renderValue": renderValue, "Root": Root, "size": size };
  const state: Record<string, unknown> = { "disabled": state_disabled, "highlightedOption": state_highlightedOption, "open": state_open, "value": state_value };
  const refs: Record<string, HTMLElement | undefined> = {};
  const emitters: Array<{id:string,event:string,callback:string|null,value:()=>unknown}> = [];
  const focusTargets = new Set<string>();
  const lifecycles: Array<{id:string,phase:string}> = [];
  const services = new Set<string>();
  const layers = new Set<string>();
  const styleOperations: unknown[][] = [];
  const cx = (...values: unknown[]) => values.filter(Boolean).join(' ');
  void "render-1";
  state["highlightedOption"] = state["highlightedOption"];
  emitters.push({ id: "emit-3", event: "change", callback: null, value: () => null });
  refs["root"] ??= undefined;
  focusTargets.add("root");
  layers.add("select");
  lifecycles.push({ id: "lifecycle-7", phase: "mounted" });
  styleOperations.push([styles["root"]]);
</script>

<section data-kumo-part="root">
  {#if root}{@render root()}{/if}
</section>
<section data-kumo-part="collection">
  {#if collection}{@render collection()}{/if}
</section>
