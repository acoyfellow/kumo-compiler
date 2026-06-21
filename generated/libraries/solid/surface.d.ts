import type { JSX } from "solid-js";
export interface SurfaceProps {
  "as"?: unknown;
  "children"?: unknown;
  "className"?: unknown;
  "color"?: unknown;
  "render"?: unknown;
  children?: JSX.Element;
  fixture?: unknown;
  styles?: Record<string, string>;
}
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export declare const Surface: ((props: SurfaceProps) => JSX.Element);
export default Surface;
