import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface SelectProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "3f2897eb8908155ffa6e7d283e13a1cb3e8fc78e30a7b8fe0b1e7bd26f839f11";
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

export function SelectOption(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Option">{local.children}</div>;
}

Object.defineProperty(Select, "Option", {value:SelectOption, enumerable:true});

export default Select;
