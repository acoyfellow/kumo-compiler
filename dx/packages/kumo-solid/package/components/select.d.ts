import type { JSX } from "solid-js";
export interface SelectProps {
  "aria-label/aria-labelledby"?: unknown;
  "children"?: unknown;
  "container"?: unknown;
  "hideLabel"?: unknown;
  "items"?: unknown;
  "label"?: unknown;
  "labelTooltip/description/error"?: unknown;
  "placeholder/loading/disabled/required"?: unknown;
  "renderValue"?: unknown;
  "Root"?: unknown;
  "size"?: unknown;
  "Root"?: JSX.Element;
  children?: JSX.Element;
  styles?: Record<string, string>;
}
export declare const Select: (props: SelectProps) => JSX.Element;
export default Select;
