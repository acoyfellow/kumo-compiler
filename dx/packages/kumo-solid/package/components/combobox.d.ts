import type { JSX } from "solid-js";
export interface ComboboxProps {
  "compound"?: unknown;
  "Content"?: unknown;
  "root"?: unknown;
  "TriggerInput"?: unknown;
  "TriggerMultipleWithInput"?: unknown;
  "variants"?: unknown;
  "Content"?: JSX.Element;
  "TriggerInput"?: JSX.Element;
  "TriggerMultipleWithInput"?: JSX.Element;
  "compound"?: JSX.Element;
  "root"?: JSX.Element;
  children?: JSX.Element;
  styles?: Record<string, string>;
}
export declare const Combobox: (props: ComboboxProps) => JSX.Element;
export default Combobox;
