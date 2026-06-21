<script lang="ts">
  import type { Snippet } from 'svelte';
   const browser = typeof document !== 'undefined';

  export const modelDigest = "fe575b56fa0db80a1e83a5b6976f0303f63a8f6ab45de9ba8f5abfb19d9a935f";
  export type Props = {
  checked?: boolean;
  disabled?: boolean;
  group?: unknown;
  indeterminate?: boolean;
  label?: unknown;
  onCheckedChange?: unknown;
  onCheckedChange?: (value: unknown) => void;
  children?: Snippet;
  styles?: Record<string, string>;
  [key: string]: unknown;
};

  let {
    checked = false,
    disabled = false,
    group = undefined,
    indeterminate = false,
    label = undefined,
    onCheckedChange = undefined,
    children,
    styles = {},
    ...rest
  }: Props = $props();
  let state_controlled = $state("checked");
  let state_group = $state("defaultValue/value");
  let state_uncontrolled = $state("absence of checked");
  const props: Record<string, unknown> = { "checked": checked, "disabled": disabled, "group": group, "indeterminate": indeterminate, "label": label, "onCheckedChange": onCheckedChange };
  const state: Record<string, unknown> = { "controlled": state_controlled, "group": state_group, "uncontrolled": state_uncontrolled };
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

<svelte:options customElement="kumo-checkbox" />
<input class={cx(styles["root"])}>
