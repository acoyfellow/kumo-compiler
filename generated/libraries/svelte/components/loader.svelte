<script lang="ts">
  import type { Snippet } from 'svelte';
   const browser = typeof document !== 'undefined';

  export const modelDigest = "8c761d6a326088b816393ffb81fd67e64ad97a3299d323ad3078a93acebc0730";
  export type Props = {
  "aria-label"?: unknown;
  className?: unknown;
  size?: number;
  children?: Snippet;
  styles?: Record<string, string>;
  [key: string]: unknown;
};

  let {
    aria_label = "Loading",
    className = undefined,
    size = "base",
    children,
    styles = {},
    ...rest
  }: Props = $props();
  
  const props: Record<string, unknown> = { "aria-label": aria_label, "className": className, "size": size };
  const state: Record<string, unknown> = {  };
  const refs: Record<string, HTMLElement | undefined> = {};
  const emitters: Array<{id:string,event:string,callback:string|null,value:()=>unknown}> = [];
  const focusTargets = new Set<string>();
  const lifecycles: Array<{id:string,phase:string}> = [];
  const services = new Set<string>();
  const layers = new Set<string>();
  const styleOperations: unknown[][] = [];
  const cx = (...values: unknown[]) => values.filter(Boolean).join(' ');
  void "render-1";
  styleOperations.push([styles["root"]]);
</script>

<svelte:options customElement="kumo-loader" />
<span role={"status"} aria-label={props["aria-label"]} class={cx(styles["root"])}></span>
