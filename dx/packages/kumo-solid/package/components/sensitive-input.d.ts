import type { JSX } from "solid-js";
export interface SensitiveInputProps {
  "observable"?: unknown;
  children?: JSX.Element;
  styles?: Record<string, string>;
}
export declare const SensitiveInput: (props: SensitiveInputProps) => JSX.Element;
export default SensitiveInput;
