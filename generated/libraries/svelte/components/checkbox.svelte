<script lang="ts">
  import type { Snippet } from 'svelte';
   const browser = typeof document !== 'undefined';

  export const modelDigest = "9bed87c38c3dc76bca19c327b60bc4264efc797aacdce1a4e06e08b722ca4c65";
  export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
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

<input class={cx(styles["root"])}>
