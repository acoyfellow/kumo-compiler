import type { JSX } from "solid-js";
export interface LinkProps {
  "children"?: unknown;
  "className"?: unknown;
  "href"?: unknown;
  "render"?: unknown;
  "variant"?: unknown;
  children?: JSX.Element;
  styles?: Record<string, string>;
}
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export declare const Link: ((props: LinkProps) => JSX.Element);
export default Link;
