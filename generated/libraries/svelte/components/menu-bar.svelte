<script lang="ts">
  import type { Snippet } from 'svelte';
   const browser = typeof document !== 'undefined';

  export const modelDigest = "188bad4486283b6daed15b228465d53415f5e138ecb140a8de65b390602a0a22";
  export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
  export type Props = {
  className?: unknown;
  isActive?: boolean;
  optionIds?: boolean;
  options?: unknown;
  collection?: Snippet;
  root?: Snippet;
  children?: Snippet;
  styles?: Record<string, string>;
  [key: string]: unknown;
};

  let {
    className = undefined,
    isActive = undefined,
    optionIds = false,
    options = undefined,
    collection = undefined,
    root = undefined,
    children,
    styles = {},
    ...rest
  }: Props = $props();
  let state_active = $state("isActive prop compared to index, or option id when optionIds=true");
  let state_focus = $state("native tab order; every option button is tabbable");
  const props: Record<string, unknown> = { "className": className, "isActive": isActive, "optionIds": optionIds, "options": options };
  const state: Record<string, unknown> = { "active": state_active, "focus": state_focus };
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
