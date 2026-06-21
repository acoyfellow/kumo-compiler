import type { JSX } from "solid-js";
export interface ToastyProps {
  "children"?: unknown;
  "container"?: unknown;
  "toastManager"?: unknown;
  "variant"?: unknown;
  children?: JSX.Element;
  styles?: Record<string, string>;
}
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export declare const Toasty: ((props: ToastyProps) => JSX.Element);
export default Toasty;
