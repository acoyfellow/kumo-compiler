<script lang="ts">
  import type { Snippet } from 'svelte';
   const browser = typeof document !== 'undefined';

  export const modelDigest = "e632de38d37be35b83ed3e093ba4e52fbd67247aa10eff83bf2ac59fb1398a41";
  export type Props = {
  compound?: Snippet;
  Content?: Snippet;
  root?: Snippet;
  TriggerInput?: Snippet;
  TriggerMultipleWithInput?: Snippet;
  variants?: unknown;
  collection?: Snippet;
  children?: Snippet;
  styles?: Record<string, string>;
  [key: string]: unknown;
};

  let {
    compound = undefined,
    Content = undefined,
    root = undefined,
    TriggerInput = undefined,
    TriggerMultipleWithInput = undefined,
    variants = undefined,
    collection = undefined,
    children,
    styles = {},
    ...rest
  }: Props = $props();
  let state_inputSide = $state("right");
  let state_multiple = $state("false unless set");
  let state_open = $state("closed unless controlled/default-open");
  let state_selection = $state("value/defaultValue according to Base UI controlled mode");
  const props: Record<string, unknown> = { "compound": compound, "Content": Content, "root": root, "TriggerInput": TriggerInput, "TriggerMultipleWithInput": TriggerMultipleWithInput, "variants": variants };
  const state: Record<string, unknown> = { "inputSide": state_inputSide, "multiple": state_multiple, "open": state_open, "selection": state_selection };
  const refs: Record<string, HTMLElement | undefined> = {};
  const emitters: Array<{id:string,event:string,callback:string|null,value:()=>unknown}> = [];
  const focusTargets = new Set<string>();
  const lifecycles: Array<{id:string,phase:string}> = [];
  const services = new Set<string>();
  const layers = new Set<string>();
  const styleOperations: unknown[][] = [];
  const cx = (...values: unknown[]) => values.filter(Boolean).join(' ');
  void "render-1";
  state["multiple"] = state["multiple"];
  emitters.push({ id: "emit-3", event: "change", callback: null, value: () => null });
  refs["root"] ??= undefined;
  focusTargets.add("root");
  styleOperations.push([styles["root"]]);
</script>

<section data-kumo-part="root">
  {#if root}{@render root()}{/if}
</section>
<section data-kumo-part="collection">
  {#if collection}{@render collection()}{/if}
</section>
