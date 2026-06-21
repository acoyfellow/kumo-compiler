<script lang="ts">
  import type { Snippet } from 'svelte';
   const browser = typeof document !== 'undefined';

  export const modelDigest = "b69b28139a711d8e96dd6ddf236811e0a1c5d9510c961808f6912e09a2d48997";
  export type Props = {
  Close?: Snippet;
  Description?: Snippet;
  Dialog?: Snippet;
  Root?: Snippet;
  Title?: Snippet;
  Trigger?: Snippet;
  dialog?: Snippet;
  children?: Snippet;
  styles?: Record<string, string>;
  [key: string]: unknown;
};

  let {
    Close = undefined,
    Description = undefined,
    Dialog = undefined,
    Root = undefined,
    Title = undefined,
    Trigger = undefined,
    dialog = undefined,
    children,
    styles = {},
    ...rest
  }: Props = $props();
  let state_open = $state("Base UI controlled/defaultOpen; default closed");
  let state_role = $state("dialog");
  let state_size = $state("base");
  const props: Record<string, unknown> = { "Close": Close, "Description": Description, "Dialog": Dialog, "Root": Root, "Title": Title, "Trigger": Trigger };
  const state: Record<string, unknown> = { "open": state_open, "role": state_role, "size": state_size };
  const refs: Record<string, HTMLElement | undefined> = {};
  const emitters: Array<{id:string,event:string,callback:string|null,value:()=>unknown}> = [];
  const focusTargets = new Set<string>();
  const lifecycles: Array<{id:string,phase:string}> = [];
  const services = new Set<string>();
  const layers = new Set<string>();
  const styleOperations: unknown[][] = [];
  const cx = (...values: unknown[]) => values.filter(Boolean).join(' ');
  void "render-1";
  state["role"] = state["role"];
  emitters.push({ id: "emit-3", event: "change", callback: null, value: () => null });
  layers.add("dialog");
  lifecycles.push({ id: "lifecycle-5", phase: "mounted" });
  focusTargets.add("root");
  refs["root"] ??= undefined;
  styleOperations.push([styles["root"]]);
</script>

{#if browser}
  <div data-kumo-portal-target={"document-body"} data-kumo-layer="dialog">
    <section data-kumo-part="dialog">
      {#if dialog}{@render dialog()}{/if}
    </section>
  </div>
{/if}
