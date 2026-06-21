import type { JSX } from "solid-js";
export interface TextProps {
  "as"?: unknown;
  "bold"?: unknown;
  "children"?: unknown;
  "DANGEROUS_className"?: unknown;
  "DANGEROUS_style"?: unknown;
  "size"?: unknown;
  "truncate"?: unknown;
  "variant"?: unknown;
  "DANGEROUS_className"?: JSX.Element;
  "DANGEROUS_style"?: JSX.Element;
  children?: JSX.Element;
  fixture?: unknown;
  styles?: Record<string, string>;
}
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export declare const Text: ((props: TextProps) => JSX.Element);
export default Text;
