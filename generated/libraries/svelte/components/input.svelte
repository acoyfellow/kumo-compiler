<script lang="ts">
  import type { Snippet } from 'svelte';
   const browser = typeof document !== 'undefined';

  export const modelDigest = "ccce2fdcca8c5218c94732f83446c137e03d4b7dd9548ffde312605374734e2f";
  export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
  export type Props = {
  observable?: unknown;
  children?: Snippet;
  styles?: Record<string, string>;
  [key: string]: unknown;
};

  let {
    observable = undefined,
    children,
    styles = {},
    ...rest
  }: Props = $props();
  let state_source = $state("props/native state");
  const props: Record<string, unknown> = { "observable": observable };
  const state: Record<string, unknown> = { "source": state_source };
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
  refs["root"] ??= undefined;
  styleOperations.push([styles["root"]]);
</script>

<input class={cx(styles["root"])}>
