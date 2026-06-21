import type { JSX } from "solid-js";
export interface CodeProps {
  "className"?: unknown;
  "code": unknown;
  "lang"?: unknown;
  "style"?: unknown;
  "values"?: unknown;
  children?: JSX.Element;
  styles?: Record<string, string>;
}
export declare const Code: (props: CodeProps) => JSX.Element;
export default Code;
