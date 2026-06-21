import type { JSX } from "solid-js";
export interface FieldProps {
  "observable"?: unknown;
  children?: JSX.Element;
  styles?: Record<string, string>;
}
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export declare const FieldNativeInput: (props: CompoundPartProps) => JSX.Element;
export declare const Field: ((props: FieldProps) => JSX.Element) & { "NativeInput": typeof FieldNativeInput };
export default Field;
