import type { JSX } from "solid-js";
export interface EmptyProps {
  "className"?: unknown;
  "commandLine"?: unknown;
  "contents"?: unknown;
  "description"?: unknown;
  "icon"?: unknown;
  "size"?: unknown;
  "title": unknown;
  children?: JSX.Element;
  fixture?: unknown;
  styles?: Record<string, string>;
}
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export declare const Empty: ((props: EmptyProps) => JSX.Element);
export default Empty;
