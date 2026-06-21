import type { JSX } from "solid-js";
export interface RadioProps {
  "defaultValue"?: unknown;
  "disabled"?: unknown;
  "items"?: unknown;
  "onValueChange"?: (...args: unknown[]) => void;
  "orientation"?: unknown;
  "value"?: unknown;
  children?: JSX.Element;
  styles?: Record<string, string>;
}
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export declare const Radio: ((props: RadioProps) => JSX.Element);
export default Radio;
