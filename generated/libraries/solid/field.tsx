import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface FieldProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export const modelDigest = "d09e3c2183930eb35b4c558193926c71ea15e98aba97c8e6179a1afdf7c60d63";
const styles: Record<string, string> = {"root":"root"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Field(incoming: FieldProps): JSX.Element {
  const props = Object.assign({}, incoming);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as FieldProps & Record<string, unknown>, ["observable"]);
  void native; void state; void refs;
  return (<field class={mergeStyles(styles.root)}></field>);
}

export default Field;
