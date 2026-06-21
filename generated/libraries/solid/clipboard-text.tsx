import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface ClipboardTextProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export const modelDigest = "2519ce9397d7b2de6138a9f8fe7461e138cd766c9a39f7f25d1d4c84345f0d10";
const styles: Record<string, string> = {"root":"root"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function ClipboardText(incoming: ClipboardTextProps): JSX.Element {
  const props = Object.assign({}, incoming);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as ClipboardTextProps & Record<string, unknown>, ["observable"]);
  void native; void state; void refs;
  return (<div class={mergeStyles(styles.root)} data-kumo-element={"clipboard-text"}></div>);
}

export default ClipboardText;
