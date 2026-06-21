import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface SwitchProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "ed2dc968d94168f193e43c4ace0c4c5a0eef92e88c8bbe1a3e168bf1f2b424b9";
const styles: Record<string, string> = {"root":"root","h-4 w-8":"h-4 w-8","h-4.5 w-9":"h-4.5 w-9","h-5 w-10":"h-5 w-10"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Switch(incoming: SwitchProps): JSX.Element {
  const props = Object.assign({"checked":false,"disabled":false,"size":"base"}, incoming);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as SwitchProps & Record<string, unknown>, []);
  void native; void state; void refs;
  return (<button class={mergeStyles(styles.root)}></button>);
}

export default Switch;
