import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface InputProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export const modelDigest = "5425763a958aaba88a608179f3dd53d1f9651a0bb15a6c4d82190bf83c5f9512";
const styles: Record<string, string> = {"root":"root"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Input(incoming: InputProps): JSX.Element {
  const props = Object.assign({}, incoming);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as InputProps & Record<string, unknown>, ["observable"]);
  void native; void state; void refs;
  return (<input class={mergeStyles(styles.root)}></input>);
}

export default Input;
