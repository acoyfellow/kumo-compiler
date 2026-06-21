<script lang="ts">
  import type { Snippet } from 'svelte';
   const browser = typeof document !== 'undefined';

  export const modelDigest = "d09e3c2183930eb35b4c558193926c71ea15e98aba97c8e6179a1afdf7c60d63";
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

<svelte:options customElement="kumo-field" />
<field class={cx(styles["root"])}></field>
