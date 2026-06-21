<script lang="ts">
  import type { Snippet } from 'svelte';
   const browser = typeof document !== 'undefined';

  export const modelDigest = "48798c8ab5bf8d756056311749cd7d344b6c82b50134d057656d5f6e4cad48aa";
  export type Props = {
  disabled?: boolean;
  icon?: unknown;
  loading?: boolean;
  native?: unknown;
  shape?: unknown;
  size?: unknown;
  variant?: unknown;
  children?: Snippet;
  styles?: Record<string, string>;
  [key: string]: unknown;
};

  let {
    disabled = undefined,
    icon = undefined,
    loading = false,
    native = undefined,
    shape = "base",
    size = "base",
    variant = "secondary",
    children,
    styles = {},
    ...rest
  }: Props = $props();
  let state_disabled = $state("false");
  let state_loading = $state("false");
  const props: Record<string, unknown> = { "disabled": disabled, "icon": icon, "loading": loading, "native": native, "shape": shape, "size": size, "variant": variant };
  const state: Record<string, unknown> = { "disabled": state_disabled, "loading": state_loading };
  const refs: Record<string, HTMLElement | undefined> = {};
  const emitters: Array<{id:string,event:string,callback:string|null,value:()=>unknown}> = [];
  const focusTargets = new Set<string>();
  const lifecycles: Array<{id:string,phase:string}> = [];
  const services = new Set<string>();
  const layers = new Set<string>();
  const styleOperations: unknown[][] = [];
  const cx = (...values: unknown[]) => values.filter(Boolean).join(' ');
  void "render-1";
  emitters.push({ id: "emit-2", event: "change", callback: null, value: () => null });
  styleOperations.push([styles["root"]]);
</script>

<button class={cx(styles["root"])}></button>
