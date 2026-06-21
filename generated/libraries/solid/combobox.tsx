import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface ComboboxProps extends Record<string, unknown> { children?: JSX.Element; fixture?: unknown; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "7fb50dfaaab30232597c0d6ba4428a3f20f30896393aa536e0563fd681a91e26";
export const semanticVariantDigests = {} as const;
const styles: Record<string, string> = {"root":"root","bg-kumo-control":"bg-kumo-control","ring-kumo-line":"ring-kumo-line","data-highlighted:bg-kumo-overlay":"data-highlighted:bg-kumo-overlay","data-selected:font-medium":"data-selected:font-medium","w-full px-2 py-1 border-0 bg-inherit":"w-full px-2 py-1 border-0 bg-inherit","flex items-center flex-wrap gap-1.5 flex-1":"flex items-center flex-wrap gap-1.5 flex-1","min-w-[100px]":"min-w-[100px]"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const fixtureText = (value: any): string => value && typeof value === "object" ? String(typeof value.text === "string" ? value.text : "") + (Array.isArray(value.children) ? value.children.map(fixtureText).join("") : "") : "";
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Combobox(incoming: ComboboxProps): JSX.Element {
  const props = Object.assign({}, incoming);
  const fixture = props.fixture;
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as ComboboxProps & Record<string, unknown>, []);
  void native; void state; void refs;
  return (<div data-kumo-compound={"combobox"}><div data-kumo-part={"root"}>{(props.root as JSX.Element) ?? undefined}</div><div data-kumo-part={"collection"}>{(props.collection as JSX.Element) ?? undefined}</div></div>);
}

export function ComboboxContent(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Content">{local.children}</div>;
}

export function ComboboxItem(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Item">{local.children}</div>;
}

export function ComboboxList(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="List">{local.children}</div>;
}

export function ComboboxTriggerInput(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="TriggerInput">{local.children}</div>;
}

Object.defineProperty(Combobox, "Content", {value:ComboboxContent, enumerable:true});
Object.defineProperty(Combobox, "Item", {value:ComboboxItem, enumerable:true});
Object.defineProperty(Combobox, "List", {value:ComboboxList, enumerable:true});
Object.defineProperty(Combobox, "TriggerInput", {value:ComboboxTriggerInput, enumerable:true});

export default Combobox;
