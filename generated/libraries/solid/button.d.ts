import type { JSX } from "solid-js";
export interface ButtonProps {
  "disabled"?: unknown;
  "icon"?: unknown;
  "loading"?: unknown;
  "native"?: unknown;
  "shape"?: unknown;
  "size"?: unknown;
  "variant"?: unknown;
  children?: JSX.Element;
  styles?: Record<string, string>;
}
export declare const Button: (props: ButtonProps) => JSX.Element;
export default Button;
