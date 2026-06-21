<script lang="ts">
  import type { Snippet } from 'svelte';
   const browser = typeof document !== 'undefined';

  export const modelDigest = "c5e7d6281fea509e18399d83a7768d4533db188cdb59ddc8cbf2f1bd99e0dec1";
  export type Props = {
  action?: unknown;
  children?: unknown;
  className?: unknown;
  description?: unknown;
  icon?: unknown;
  text?: unknown;
  title?: unknown;
  variant?: unknown;
  children?: Snippet;
  styles?: Record<string, string>;
  [key: string]: unknown;
};

  let {
    action = undefined,
    className = undefined,
    description = undefined,
    icon = undefined,
    text = undefined,
    title = undefined,
    variant = "default",
    children,
    styles = {},
    ...rest
  }: Props = $props();
  
  const props: Record<string, unknown> = { "action": action, "children": children, "className": className, "description": description, "icon": icon, "text": text, "title": title, "variant": variant };
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

<svelte:options customElement="kumo-banner" />
<section class={cx(styles["root"])}>
  {#if icon}{@render icon()}{/if}
  {props["title"]}
  {#if description}{@render description()}{/if}
  {#if action}{@render action()}{/if}
  {#if children}{@render children()}{/if}
</section>
