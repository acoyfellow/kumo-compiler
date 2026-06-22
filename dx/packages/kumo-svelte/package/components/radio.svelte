<script lang="ts">
  import type { Snippet } from 'svelte';
   const browser = typeof document !== 'undefined';

  export const modelDigest = "851f6bb506c384c8d6d8ec9583d3ec05a0cf060d5d9192464a29ba55e1185844";
  export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
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
  fixture?: unknown;
  [key: string]: unknown;
};

  let componentInput = $props();
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
    fixture = undefined,
    __consumerContent = undefined,
    styles = {},
    ...rest
  }: Props = componentInput;
  let state_controlled = $state("value");
  let state_uncontrolled = $state("defaultValue");
  const renderContent = __consumerContent;
  const semanticProps: Record<string, unknown> = { "defaultValue": defaultValue, "disabled": disabled, "items": items, "onValueChange": onValueChange, "orientation": orientation, "value": value, ...rest, ...(__consumerContent !== undefined ? {children: renderContent} : {}) };
  const semanticValues = semanticProps;
  const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
  const fixtureText = (value: any): string => value && typeof value === 'object' ? String(typeof value.text === 'string' ? value.text : '') + (Array.isArray(value.children) ? value.children.map(fixtureText).join('') : '') : '';
  const componentState: Record<string, unknown> = { "controlled": state_controlled, "uncontrolled": state_uncontrolled };
  const refs: Record<string, HTMLElement | undefined> = {};
  const emitters: Array<{id:string,event:string,callback:string|null,value:()=>unknown}> = [];
  const focusTargets = new Set<string>();
  const lifecycles: Array<{id:string,phase:string}> = [];
  const services = new Set<string>();
  const layers = new Set<string>();
  const styleOperations: unknown[][] = [];
  const cx = (...values: unknown[]) => values.filter(Boolean).join(' ');
  componentState["controlled"] = componentState["controlled"];
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
