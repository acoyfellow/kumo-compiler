<script lang="ts">
  import type { Snippet } from 'svelte';
   const browser = typeof document !== 'undefined';

  export const modelDigest = "2201de1a1ed8a66d0925c6dae8b6b3197097ad332ed86e9b694f8d7383c8c284";
  export type Props = {
  className?: unknown;
  customValue?: unknown;
  indicatorClassName?: unknown;
  label: unknown;
  max?: number;
  min?: number;
  showValue?: boolean;
  trackClassName?: unknown;
  value?: number;
  children?: Snippet;
  styles?: Record<string, string>;
  [key: string]: unknown;
};

  let {
    className = undefined,
    customValue = undefined,
    indicatorClassName = undefined,
    label = undefined,
    max = 100,
    min = 0,
    showValue = true,
    trackClassName = undefined,
    value = undefined,
    children,
    styles = {},
    ...rest
  }: Props = $props();
  
  const props: Record<string, unknown> = { "className": className, "customValue": customValue, "indicatorClassName": indicatorClassName, "label": label, "max": max, "min": min, "showValue": showValue, "trackClassName": trackClassName, "value": value };
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

<div class={cx(styles["root"])}>
  {props["label"]}
  <meter class={cx(styles["root"])}></meter>
  {#if props["showValue"]}
    {(props["customValue"] ?? props["value"])}
  {/if}
</div>
