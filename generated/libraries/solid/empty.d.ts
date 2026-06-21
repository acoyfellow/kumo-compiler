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
  styles?: Record<string, string>;
}
export declare const Empty: (props: EmptyProps) => JSX.Element;
export default Empty;
