<script lang="ts">
  import type { Snippet } from 'svelte';
   const browser = typeof document !== 'undefined';

  export const modelDigest = "40c08fc1e03b3a7d723ec35135cb4cf3a2605d12368398588dcda6818ce453ea";
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

<svelte:options customElement="kumo-menu-bar" />
<section data-kumo-part="root">
  {#if root}{@render root()}{/if}
</section>
<section data-kumo-part="collection">
  {#if collection}{@render collection()}{/if}
</section>
