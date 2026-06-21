import type { JSX } from "solid-js";
export interface BannerProps {
  "action"?: unknown;
  "children"?: unknown;
  "className"?: unknown;
  "description"?: unknown;
  "icon"?: unknown;
  "text"?: unknown;
  "title"?: unknown;
  "variant"?: unknown;
  children?: JSX.Element;
  styles?: Record<string, string>;
}
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export declare const Banner: ((props: BannerProps) => JSX.Element);
export default Banner;
