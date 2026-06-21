<script lang="ts">
  import type { Snippet } from 'svelte';
   const browser = typeof document !== 'undefined';

  export const modelDigest = "24c51f801cb83e8ae05a575e5e3e012c1f46065f0d1fda618759efe36487bc38";
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
