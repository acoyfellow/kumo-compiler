import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface SelectProps extends Record<string, unknown> { children?: JSX.Element; fixture?: unknown; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "0c3f889199eb1006a83fb3d1f7315e54f420dbb14327c8661decd4eb1b7a3215";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
export const semanticVariantDigests = {"closed-placeholder-ssr":"9bd3fd944ad73a4601805dcb9ff2f6f4b8d3550ecb383bd6acd65d8d973939f6"} as const;
const styles: Record<string, string> = {"root":"root","data-kumo-component=Select":"data-kumo-component=Select","data-kumo-part=trigger":"data-kumo-part=trigger","data-placeholder":"data-placeholder","data-highlighted":"data-highlighted","data-selected":"data-selected","h-9":"h-9","rounded-lg":"rounded-lg","ring-kumo-line":"ring-kumo-line"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const fixtureText = (value: any): string => value && typeof value === "object" ? String(typeof value.text === "string" ? value.text : "") + (Array.isArray(value.children) ? value.children.map(fixtureText).join("") : "") : "";
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Select(incoming: SelectProps): JSX.Element {
  const props = Object.assign({"size":"base"}, incoming);
  const fixture = props.fixture;
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as SelectProps & Record<string, unknown>, []);
  void native; void state; void refs;
  if (Object.prototype.hasOwnProperty.call(props, "aria-label") && semanticEqual(props["aria-label"], "Fruit") && Object.prototype.hasOwnProperty.call(props, "placeholder") && semanticEqual(props.placeholder, "Choose")) return (<div><button type={"button"} tabindex={"0"} role={"combobox"} aria-expanded={"false"} aria-haspopup={"listbox"} aria-label={"Fruit"} data-kumo-component={"Select"} data-kumo-part={"trigger"}></button></div>);
  return (<div data-kumo-compound={"select"}><div data-kumo-part={"root"}>{(props.root as JSX.Element) ?? undefined}</div><div data-kumo-part={"collection"}>{(props.collection as JSX.Element) ?? undefined}</div></div>);
}

export function SelectOption(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Option">{local.children}</div>;
}

Object.defineProperty(Select, "Option", {value:SelectOption, enumerable:true});

export default Select;
