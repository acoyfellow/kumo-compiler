import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface SensitiveInputProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "9f0862f5064e4584c2616703c9f1cd80330b5ef71dee9361752cc32841164461";
const styles: Record<string, string> = {"root":"root"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function SensitiveInput(incoming: SensitiveInputProps): JSX.Element {
  const props = Object.assign({}, incoming);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as SensitiveInputProps & Record<string, unknown>, ["observable"]);
  void native; void state; void refs;
  return (<input class={mergeStyles(styles.root)}></input>);
}

export default SensitiveInput;
