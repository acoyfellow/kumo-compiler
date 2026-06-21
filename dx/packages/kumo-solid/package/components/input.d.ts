import type { JSX } from "solid-js";
export interface InputProps {
  "observable"?: unknown;
  children?: JSX.Element;
  styles?: Record<string, string>;
}
export declare const Input: (props: InputProps) => JSX.Element;
export default Input;
