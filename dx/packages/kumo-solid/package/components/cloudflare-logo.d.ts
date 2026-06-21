import type { JSX } from "solid-js";
export interface CloudflareLogoProps {
  "className"?: unknown;
  "color"?: unknown;
  "variant"?: unknown;
  children?: JSX.Element;
  styles?: Record<string, string>;
}
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export declare const CloudflareLogo: ((props: CloudflareLogoProps) => JSX.Element);
export default CloudflareLogo;
