<script lang="ts">
  import type { Snippet } from 'svelte';
   const browser = typeof document !== 'undefined';

  export const modelDigest = "c6f0fbd6318e25df8755e6c0053fe1d74c23861e6bcc3f9256588ac62b9fa195";
  export type Props = {
  children?: Snippet;
  className?: unknown;
  href?: unknown;
  render?: unknown;
  variant?: unknown;
  styles?: Record<string, string>;
  [key: string]: unknown;
};

  let {
    className = undefined,
    href = undefined,
    render = undefined,
    variant = "inline",
    children,
    styles = {},
    ...rest
  }: Props = $props();
  
  const props: Record<string, unknown> = { "children": children, "className": className, "href": href, "render": render, "variant": variant };
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

<a href={props["href"]} class={cx(styles["root"])}>
  {#if children}{@render children()}{/if}
</a>
