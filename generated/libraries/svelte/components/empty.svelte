<script lang="ts">
  import type { Snippet } from 'svelte';
   const browser = typeof document !== 'undefined';

  export const modelDigest = "807df579a4b5811636f6c8ae3fbc56d8907ba572d3a57cf9b47ea9f266a81eca";
  export type Props = {
  className?: unknown;
  commandLine?: unknown;
  contents?: unknown;
  description?: unknown;
  icon?: unknown;
  size?: unknown;
  title: unknown;
  children?: Snippet;
  styles?: Record<string, string>;
  [key: string]: unknown;
};

  let {
    className = undefined,
    commandLine = undefined,
    contents = undefined,
    description = undefined,
    icon = undefined,
    size = "base",
    title = undefined,
    children,
    styles = {},
    ...rest
  }: Props = $props();
  
  const props: Record<string, unknown> = { "className": className, "commandLine": commandLine, "contents": contents, "description": description, "icon": icon, "size": size, "title": title };
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

<svelte:options customElement="kumo-empty" />
<section class={cx(styles["root"])}>
  {#if icon}{@render icon()}{/if}
  {props["title"]}
  {#if description}{@render description()}{/if}
  {#if contents}{@render contents()}{/if}
</section>
