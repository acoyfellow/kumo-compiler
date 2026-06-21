import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface SelectProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export const modelDigest = "12a3eb7f1d84d603ca914b803a794e948b5b62e88a1981d4ebb270f13b6bf69c";
const styles: Record<string, string> = {"root":"root","data-kumo-component=Select":"data-kumo-component=Select","data-kumo-part=trigger":"data-kumo-part=trigger","data-placeholder":"data-placeholder","data-highlighted":"data-highlighted","data-selected":"data-selected","h-9":"h-9","rounded-lg":"rounded-lg","ring-kumo-line":"ring-kumo-line"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Select(incoming: SelectProps): JSX.Element {
  const props = Object.assign({"size":"base"}, incoming);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as SelectProps & Record<string, unknown>, []);
  void native; void state; void refs;
  return (<div data-kumo-compound={"select"}><div data-kumo-part={"root"}>{(props.root as JSX.Element) ?? undefined}</div><div data-kumo-part={"collection"}>{(props.collection as JSX.Element) ?? undefined}</div></div>);
}

export default Select;
