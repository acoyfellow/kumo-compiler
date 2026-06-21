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
  fixture?: unknown;
  styles?: Record<string, string>;
}
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export declare const ComboboxContent: (props: CompoundPartProps) => JSX.Element;
export declare const ComboboxItem: (props: CompoundPartProps) => JSX.Element;
export declare const ComboboxList: (props: CompoundPartProps) => JSX.Element;
export declare const ComboboxTriggerInput: (props: CompoundPartProps) => JSX.Element;
export declare const Combobox: ((props: ComboboxProps) => JSX.Element) & { "Content": typeof ComboboxContent; "Item": typeof ComboboxItem; "List": typeof ComboboxList; "TriggerInput": typeof ComboboxTriggerInput };
export default Combobox;
