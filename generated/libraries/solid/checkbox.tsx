import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface CheckboxProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export const modelDigest = "fe575b56fa0db80a1e83a5b6976f0303f63a8f6ab45de9ba8f5abfb19d9a935f";
const styles: Record<string, string> = {"root":"root","data-[checked]":"data-[checked]","data-[indeterminate]":"data-[indeterminate]"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Checkbox(incoming: CheckboxProps): JSX.Element {
  const props = Object.assign({"checked":false,"disabled":false,"indeterminate":false}, incoming);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as CheckboxProps & Record<string, unknown>, []);
  void native; void state; void refs;
  return (<input class={mergeStyles(styles.root)}></input>);
}

export default Checkbox;
