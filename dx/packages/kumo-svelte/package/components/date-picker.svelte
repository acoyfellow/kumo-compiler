<script lang="ts">
  import type { Snippet } from 'svelte';
   const browser = typeof document !== 'undefined';

  export const modelDigest = "efe6ee1704bcfdd921aefd2a33601d5193d45c82454eadc21af9261b848e1bc6";
  export type Props = {
  "aria-label"?: unknown;
  fromDate?: number;
  mode?: unknown;
  onChange?: unknown;
  reactDayPickerProps?: unknown;
  selected?: number;
  toDate?: number;
  "date-picker"?: Snippet;
  onChange?: (value: unknown) => void;
  children?: Snippet;
  styles?: Record<string, string>;
  [key: string]: unknown;
};

  let {
    aria_label = undefined,
    fromDate = undefined,
    mode = undefined,
    onChange = undefined,
    reactDayPickerProps = undefined,
    selected = undefined,
    toDate = undefined,
    date_picker = undefined,
    children,
    styles = {},
    ...rest
  }: Props = $props();
  let state_displayMonth = $state("from selected/defaultMonth/current date");
  let state_selected = $state("from selected prop");
  const props: Record<string, unknown> = { "aria-label": aria_label, "fromDate": fromDate, "mode": mode, "onChange": onChange, "reactDayPickerProps": reactDayPickerProps, "selected": selected, "toDate": toDate };
  const state: Record<string, unknown> = { "displayMonth": state_displayMonth, "selected": state_selected };
  const refs: Record<string, HTMLElement | undefined> = {};
  const emitters: Array<{id:string,event:string,callback:string|null,value:()=>unknown}> = [];
  const focusTargets = new Set<string>();
  const lifecycles: Array<{id:string,phase:string}> = [];
  const services = new Set<string>();
  const layers = new Set<string>();
  const styleOperations: unknown[][] = [];
  const cx = (...values: unknown[]) => values.filter(Boolean).join(' ');
  void "render-1";
  state["selected"] = state["selected"];
  emitters.push({ id: "emit-3", event: "change", callback: null, value: () => null });
  styleOperations.push([styles["root"]]);
</script>

{#if browser}
  <div data-kumo-portal-target={"document-body"} data-kumo-layer="date-picker">
    <section data-kumo-part="date-picker">
      {#if date_picker}{@render date_picker()}{/if}
    </section>
  </div>
{/if}
