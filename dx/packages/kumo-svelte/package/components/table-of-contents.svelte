<script lang="ts">
  import type { Snippet } from 'svelte';
   const browser = typeof document !== 'undefined';

  export const modelDigest = "e48b4239cfca5e769df53ef328dfaf3f910bf892b503c032b84e02002bb57789";
  export type Props = {
  Group?: Snippet;
  Item?: Snippet;
  List?: Snippet;
  root?: Snippet;
  Title?: Snippet;
  collection?: Snippet;
  children?: Snippet;
  styles?: Record<string, string>;
  [key: string]: unknown;
};

  let {
    Group = undefined,
    Item = undefined,
    List = undefined,
    root = undefined,
    Title = undefined,
    collection = undefined,
    children,
    styles = {},
    ...rest
  }: Props = $props();
  let state_active = $state("exactly as supplied per Item or linked Group; no internal selection state");
  const props: Record<string, unknown> = { "Group": Group, "Item": Item, "List": List, "root": root, "Title": Title };
  const state: Record<string, unknown> = { "active": state_active };
  const refs: Record<string, HTMLElement | undefined> = {};
  const emitters: Array<{id:string,event:string,callback:string|null,value:()=>unknown}> = [];
  const focusTargets = new Set<string>();
  const lifecycles: Array<{id:string,phase:string}> = [];
  const services = new Set<string>();
  const layers = new Set<string>();
  const styleOperations: unknown[][] = [];
  const cx = (...values: unknown[]) => values.filter(Boolean).join(' ');
  void "render-1";
  state["active"] = state["active"];
  emitters.push({ id: "emit-3", event: "change", callback: null, value: () => null });
  styleOperations.push([styles["root"]]);
</script>

<section data-kumo-part="root">
  {#if root}{@render root()}{/if}
</section>
<section data-kumo-part="collection">
  {#if collection}{@render collection()}{/if}
</section>
