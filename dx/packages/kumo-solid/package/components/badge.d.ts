import type { JSX } from "solid-js";
export interface BadgeProps {
  "appearance"?: unknown;
  "children": unknown;
  "className"?: unknown;
  "variant"?: unknown;
  children?: JSX.Element;
  fixture?: unknown;
  styles?: Record<string, string>;
}
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export declare const Badge: ((props: BadgeProps) => JSX.Element);
export default Badge;
