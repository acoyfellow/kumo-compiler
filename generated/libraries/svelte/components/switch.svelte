<script lang="ts">
  import type { Snippet } from 'svelte';
   const browser = typeof document !== 'undefined';

  export const modelDigest = "ed2dc968d94168f193e43c4ace0c4c5a0eef92e88c8bbe1a3e168bf1f2b424b9";
  export type Props = {
  checked?: boolean;
  disabled?: boolean;
  group?: unknown;
  label?: unknown;
  onCheckedChange?: unknown;
  size?: unknown;
  onCheckedChange?: (value: unknown) => void;
  children?: Snippet;
  styles?: Record<string, string>;
  [key: string]: unknown;
};

  let {
    checked = false,
    disabled = false,
    group = undefined,
    label = undefined,
    onCheckedChange = undefined,
    size = "base",
    children,
    styles = {},
    ...rest
  }: Props = $props();
  let state_controlled = $state("checked");
  let state_uncontrolled = $state("absence of checked");
  const props: Record<string, unknown> = { "checked": checked, "disabled": disabled, "group": group, "label": label, "onCheckedChange": onCheckedChange, "size": size };
  const state: Record<string, unknown> = { "controlled": state_controlled, "uncontrolled": state_uncontrolled };
  const refs: Record<string, HTMLElement | undefined> = {};
  const emitters: Array<{id:string,event:string,callback:string|null,value:()=>unknown}> = [];
  const focusTargets = new Set<string>();
  const lifecycles: Array<{id:string,phase:string}> = [];
  const services = new Set<string>();
  const layers = new Set<string>();
  const styleOperations: unknown[][] = [];
  const cx = (...values: unknown[]) => values.filter(Boolean).join(' ');
  state["controlled"] = state["controlled"];
  emitters.push({ id: "emit-2", event: "change", callback: null, value: () => null });
  void "render-3";
  styleOperations.push([styles["root"]]);
</script>

<svelte:options customElement="kumo-switch" />
<button class={cx(styles["root"])}></button>
