<script lang="ts">
  import type { Snippet } from 'svelte';
   const browser = typeof document !== 'undefined';

  export const modelDigest = "60219ad3fa185b8a9db3e82cc4fc77b1b0683b2881bcf6b0460646bb320e67c2";
  export type Props = {
  as?: unknown;
  bold?: boolean;
  children?: unknown;
  DANGEROUS_className?: unknown;
  DANGEROUS_style?: unknown;
  size?: unknown;
  truncate?: boolean;
  variant?: unknown;
  children?: Snippet;
  styles?: Record<string, string>;
  [key: string]: unknown;
};

  let {
    as = undefined,
    bold = false,
    DANGEROUS_className = undefined,
    DANGEROUS_style = undefined,
    size = "base",
    truncate = false,
    variant = "body",
    children,
    styles = {},
    ...rest
  }: Props = $props();
  
  const props: Record<string, unknown> = { "as": as, "bold": bold, "children": children, "DANGEROUS_className": DANGEROUS_className, "DANGEROUS_style": DANGEROUS_style, "size": size, "truncate": truncate, "variant": variant };
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

<svelte:options customElement="kumo-text" />
<span class={cx(styles["root"])}>
  {#if children}{@render children()}{/if}
</span>
