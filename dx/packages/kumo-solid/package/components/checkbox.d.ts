import type { JSX } from "solid-js";
export interface CheckboxProps {
  "checked"?: unknown;
  "disabled"?: unknown;
  "group"?: unknown;
  "indeterminate"?: unknown;
  "label"?: unknown;
  "onCheckedChange"?: (...args: unknown[]) => void;
  children?: JSX.Element;
  styles?: Record<string, string>;
}
export declare const Checkbox: (props: CheckboxProps) => JSX.Element;
export default Checkbox;
