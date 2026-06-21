import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface InputAreaProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "59711469ba9cb63d7177a2ef83d87ae8fdd8835dab30e06846284b0d7497f1c1";
const styles: Record<string, string> = {"root":"root"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function InputArea(incoming: InputAreaProps): JSX.Element {
  const props = Object.assign({}, incoming);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as InputAreaProps & Record<string, unknown>, ["observable"]);
  void native; void state; void refs;
  return (<textarea class={mergeStyles(styles.root)}></textarea>);
}

export default InputArea;
