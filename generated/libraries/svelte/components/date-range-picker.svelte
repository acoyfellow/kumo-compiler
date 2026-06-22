<script lang="ts">
  import type { Snippet } from 'svelte';
   const browser = typeof document !== 'undefined';

  export const modelDigest = "3cfb56490eb493fd3a522a1fdf7ba0b041d91576a3c454046059939ae2aae977";
  export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
  export type Props = {
  className?: unknown;
  onEndDateChange?: unknown;
  onStartDateChange?: unknown;
  size?: unknown;
  timezone?: unknown;
  variant?: unknown;
  "date-range-picker"?: Snippet;
  onEndDateChange?: (value: unknown) => void;
  onStartDateChange?: (value: unknown) => void;
  children?: Snippet;
  styles?: Record<string, string>;
  [key: string]: unknown;
};

  let {
    className = undefined,
    onEndDateChange = undefined,
    onStartDateChange = undefined,
    size = "base",
    timezone = "New York, NY, USA (GMT-4)",
    variant = "default",
    date_range_picker = undefined,
    children,
    styles = {},
    ...rest
  }: Props = $props();
  let state_endDate = $state(null);
  let state_months = $state("current and next month");
  let state_startDate = $state(null);
  const props: Record<string, unknown> = { "className": className, "onEndDateChange": onEndDateChange, "onStartDateChange": onStartDateChange, "size": size, "timezone": timezone, "variant": variant };
  const state: Record<string, unknown> = { "endDate": state_endDate, "months": state_months, "startDate": state_startDate };
  const refs: Record<string, HTMLElement | undefined> = {};
  const emitters: Array<{id:string,event:string,callback:string|null,value:()=>unknown}> = [];
  const focusTargets = new Set<string>();
  const lifecycles: Array<{id:string,phase:string}> = [];
  const services = new Set<string>();
  const layers = new Set<string>();
  const styleOperations: unknown[][] = [];
  const cx = (...values: unknown[]) => values.filter(Boolean).join(' ');
  void "render-1";
  state["months"] = state["months"];
  emitters.push({ id: "emit-3", event: "change", callback: null, value: () => null });
  styleOperations.push([styles["root"]]);
</script>

{#if browser}
  <div data-kumo-portal-target={"document-body"} data-kumo-layer="date-range-picker">
    <section data-kumo-part="date-range-picker">
      {#if date_range_picker}{@render date_range_picker()}{/if}
    </section>
  </div>
{/if}
