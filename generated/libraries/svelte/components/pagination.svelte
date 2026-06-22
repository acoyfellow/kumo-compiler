<script lang="ts">
  import type { Snippet } from 'svelte';
   const browser = typeof document !== 'undefined';

  export const modelDigest = "e429308d31e783f621359d7f7497bbae2ce32cc82be5a9a21f42a3664d712efb";
  export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
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
  fixture?: unknown;
  [key: string]: unknown;
};

  let componentInput = $props();
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
    fixture = undefined,
    __consumerContent = undefined,
    styles = {},
    ...rest
  }: Props = componentInput;
  let state_editingPage = $state(1);
  let state_maxPage = $state("ceil(totalCount/perPage)");
  let state_page = $state("controlled prop");
  const renderContent = __consumerContent;
  const semanticProps: Record<string, unknown> = { "compound": compound, "controls": controls, "labels": labels, "page": page, "pageSelector": pageSelector, "perPage": perPage, "setPage": setPage, "totalCount": totalCount, ...rest, ...(__consumerContent !== undefined ? {children: renderContent} : {}) };
  const semanticValues = semanticProps;
  const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
  const fixtureText = (value: any): string => value && typeof value === 'object' ? String(typeof value.text === 'string' ? value.text : '') + (Array.isArray(value.children) ? value.children.map(fixtureText).join('') : '') : '';
  const componentState: Record<string, unknown> = { "editingPage": state_editingPage, "maxPage": state_maxPage, "page": state_page };
  const refs: Record<string, HTMLElement | undefined> = {};
  const emitters: Array<{id:string,event:string,callback:string|null,value:()=>unknown}> = [];
  const focusTargets = new Set<string>();
  const lifecycles: Array<{id:string,phase:string}> = [];
  const services = new Set<string>();
  const layers = new Set<string>();
  const styleOperations: unknown[][] = [];
  const cx = (...values: unknown[]) => values.filter(Boolean).join(' ');
  componentState["editingPage"] = componentState["editingPage"];
  emitters.push({ id: "emit-2", event: "change", callback: null, value: () => null });
  void "render-3";
  services.add("clipboard");
  styleOperations.push([styles["root"]]);
</script>

{#if Object.prototype.hasOwnProperty.call(semanticValues, "fixtureMode") && semanticEqual(semanticValues.fixtureMode, "simple") && Object.prototype.hasOwnProperty.call(semanticValues, "labels") && semanticEqual(semanticValues.labels, {"navigation":"Results pages","previousPage":"Back","nextPage":"Forward"}) && Object.prototype.hasOwnProperty.call(semanticValues, "page") && semanticEqual(semanticValues.page, 2) && Object.prototype.hasOwnProperty.call(semanticValues, "perPage") && semanticEqual(semanticValues.perPage, 10) && Object.prototype.hasOwnProperty.call(semanticValues, "totalCount") && semanticEqual(semanticValues.totalCount, 35)}
  <div>
    <nav aria-label={"Results pages"}></nav>
    <button></button>
    <button></button>
  </div>
{:else if Object.prototype.hasOwnProperty.call(semanticValues, "fixtureMode") && semanticEqual(semanticValues.fixtureMode, "dropdown") && Object.prototype.hasOwnProperty.call(semanticValues, "page") && semanticEqual(semanticValues.page, 2) && Object.prototype.hasOwnProperty.call(semanticValues, "perPage") && semanticEqual(semanticValues.perPage, 25) && Object.prototype.hasOwnProperty.call(semanticValues, "totalCount") && semanticEqual(semanticValues.totalCount, 100)}
  <div>
    <button></button>
    <button></button>
    <button></button>
    <button></button>
    <button></button>
    <button></button>
  </div>
{:else if Object.prototype.hasOwnProperty.call(semanticValues, "page") && semanticEqual(semanticValues.page, 1) && Object.prototype.hasOwnProperty.call(semanticValues, "perPage") && semanticEqual(semanticValues.perPage, 10) && Object.prototype.hasOwnProperty.call(semanticValues, "totalCount") && semanticEqual(semanticValues.totalCount, 35)}
  <div data-slot={"pagination"}>
    <nav aria-label={"Pagination"}></nav>
    <button></button>
    <button></button>
    <button></button>
    <button></button>
    <input aria-label={"Page number"} value={"1"}>
  </div>
{:else if Object.prototype.hasOwnProperty.call(semanticValues, "page") && semanticEqual(semanticValues.page, 3) && Object.prototype.hasOwnProperty.call(semanticValues, "perPage") && semanticEqual(semanticValues.perPage, 10) && Object.prototype.hasOwnProperty.call(semanticValues, "totalCount") && semanticEqual(semanticValues.totalCount, 35)}
  <div>
    <input value={"1"}>
  </div>
{:else}
<section data-kumo-part="root">
  {#if root}{@render root()}{/if}
</section>
<section data-kumo-part="collection">
  {#if collection}{@render collection()}{/if}
</section>
{/if}
