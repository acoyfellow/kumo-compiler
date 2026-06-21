import type { JSX } from "solid-js";
export interface LoaderProps {
  "aria-label"?: unknown;
  "className"?: unknown;
  "size"?: unknown;
  children?: JSX.Element;
  styles?: Record<string, string>;
}
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export declare const Loader: ((props: LoaderProps) => JSX.Element);
export default Loader;
