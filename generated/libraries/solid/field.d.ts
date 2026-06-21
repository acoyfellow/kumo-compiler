import type { JSX } from "solid-js";
export interface FieldProps {
  "observable"?: unknown;
  children?: JSX.Element;
  styles?: Record<string, string>;
}
export declare const Field: (props: FieldProps) => JSX.Element;
export default Field;
