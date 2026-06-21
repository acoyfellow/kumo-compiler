<script lang="ts">
  import type { Snippet } from 'svelte';
   const browser = typeof document !== 'undefined';

  export const modelDigest = "8a03b02a4e86e5ee4971e869b775b7efd73bc7e61116c5e794612f2402b7dd2d";
  export type Props = {
  compound?: Snippet;
  controls?: unknown;
  labels?: unknown;
  page?: number;
  pageSelector?: unknown;
  perPage?: number;
  setPage?: unknown;
  totalCount?: number;
  collection?: Snippet;
  root?: Snippet;
  children?: Snippet;
  styles?: Record<string, string>;
  [key: string]: unknown;
};

  let {
    compound = undefined,
    controls = "full",
    labels = "English canonical labels",
    page = 1,
    pageSelector = "input",
    perPage = undefined,
    setPage = undefined,
    totalCount = undefined,
    collection = undefined,
    root = undefined,
    children,
    styles = {},
    ...rest
  }: Props = $props();
  let state_editingPage = $state(1);
  let state_maxPage = $state("ceil(totalCount/perPage)");
  let state_page = $state("controlled prop");
  const props: Record<string, unknown> = { "compound": compound, "controls": controls, "labels": labels, "page": page, "pageSelector": pageSelector, "perPage": perPage, "setPage": setPage, "totalCount": totalCount };
  const state: Record<string, unknown> = { "editingPage": state_editingPage, "maxPage": state_maxPage, "page": state_page };
  const refs: Record<string, HTMLElement | undefined> = {};
  const emitters: Array<{id:string,event:string,callback:string|null,value:()=>unknown}> = [];
  const focusTargets = new Set<string>();
  const lifecycles: Array<{id:string,phase:string}> = [];
  const services = new Set<string>();
  const layers = new Set<string>();
  const styleOperations: unknown[][] = [];
  const cx = (...values: unknown[]) => values.filter(Boolean).join(' ');
  state["editingPage"] = state["editingPage"];
  emitters.push({ id: "emit-2", event: "change", callback: null, value: () => null });
  void "render-3";
  services.add("clipboard");
  styleOperations.push([styles["root"]]);
</script>

<section data-kumo-part="root">
  {#if root}{@render root()}{/if}
</section>
<section data-kumo-part="collection">
  {#if collection}{@render collection()}{/if}
</section>
