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
  fixture?: unknown;
  styles?: Record<string, string>;
}
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export declare const SelectOption: (props: CompoundPartProps) => JSX.Element;
export declare const Select: ((props: SelectProps) => JSX.Element) & { "Option": typeof SelectOption };
export default Select;
