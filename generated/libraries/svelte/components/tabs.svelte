<script lang="ts">
  import type { Snippet } from 'svelte';
   const browser = typeof document !== 'undefined';

  export const modelDigest = "480d0ca0dc8311b3321bb1c078c9277118ed399fcc4ececa5b561d5b695a3336";
  export type Props = {
  activateOnFocus?: boolean;
  className?: unknown;
  indicatorClassName?: unknown;
  listClassName?: unknown;
  onValueChange?: unknown;
  selectedValue?: unknown;
  size?: unknown;
  tabs?: unknown;
  value?: unknown;
  variant?: unknown;
  collection?: Snippet;
  root?: Snippet;
  onValueChange?: (value: unknown) => void;
  children?: Snippet;
  styles?: Record<string, string>;
  [key: string]: unknown;
};

  let {
    activateOnFocus = false,
    className = undefined,
    indicatorClassName = undefined,
    listClassName = undefined,
    onValueChange = undefined,
    selectedValue = "first tab value when uncontrolled and selectedValue omitted",
    size = "base",
    tabs = [],
    value = undefined,
    variant = "segmented",
    collection = undefined,
    root = undefined,
    children,
    styles = {},
    ...rest
  }: Props = $props();
  let state_activation = $state("manual unless activateOnFocus is true");
  let state_controlled = $state("value prop");
  let state_overflowing = $state(false);
  let state_uncontrolled = $state("selectedValue or first tab value");
  const props: Record<string, unknown> = { "activateOnFocus": activateOnFocus, "className": className, "indicatorClassName": indicatorClassName, "listClassName": listClassName, "onValueChange": onValueChange, "selectedValue": selectedValue, "size": size, "tabs": tabs, "value": value, "variant": variant };
  const state: Record<string, unknown> = { "activation": state_activation, "controlled": state_controlled, "overflowing": state_overflowing, "uncontrolled": state_uncontrolled };
  const refs: Record<string, HTMLElement | undefined> = {};
  const emitters: Array<{id:string,event:string,callback:string|null,value:()=>unknown}> = [];
  const focusTargets = new Set<string>();
  const lifecycles: Array<{id:string,phase:string}> = [];
  const services = new Set<string>();
  const layers = new Set<string>();
  const styleOperations: unknown[][] = [];
  const cx = (...values: unknown[]) => values.filter(Boolean).join(' ');
  void "render-1";
  state["controlled"] = state["controlled"];
  emitters.push({ id: "emit-3", event: "change", callback: null, value: () => null });
  focusTargets.add("root");
  refs["root"] ??= undefined;
  styleOperations.push([styles["root"]]);
</script>

<svelte:options customElement="kumo-tabs" />
<section data-kumo-part="root">
  {#if root}{@render root()}{/if}
</section>
<section data-kumo-part="collection">
  {#if collection}{@render collection()}{/if}
</section>
