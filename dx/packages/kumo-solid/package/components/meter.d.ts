import type { JSX } from "solid-js";
export interface MeterProps {
  "className"?: unknown;
  "customValue"?: unknown;
  "indicatorClassName"?: unknown;
  "label": unknown;
  "max"?: unknown;
  "min"?: unknown;
  "showValue"?: unknown;
  "trackClassName"?: unknown;
  "value"?: unknown;
  children?: JSX.Element;
  styles?: Record<string, string>;
}
export declare const Meter: (props: MeterProps) => JSX.Element;
export default Meter;
