<script lang="ts">
  import type { Snippet } from 'svelte';
   const browser = typeof document !== 'undefined';

  export const modelDigest = "70db6933357de8ee3d47759cd14f5ca8cab2cc88427a19740a54a5f4d65377b3";
  export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
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

<button class={cx(styles["root"])}></button>
