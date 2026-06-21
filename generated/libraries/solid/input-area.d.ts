import type { JSX } from "solid-js";
export interface InputAreaProps {
  "observable"?: unknown;
  children?: JSX.Element;
  fixture?: unknown;
  styles?: Record<string, string>;
}
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export declare const InputArea: ((props: InputAreaProps) => JSX.Element);
export default InputArea;
