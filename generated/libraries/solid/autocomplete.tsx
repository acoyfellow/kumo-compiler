import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface AutocompleteProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "1f41380c0300c6ab1aa370e5a96ed529bb1bdfb6d60bfcaaa9df23cd23dd8b07";
const styles: Record<string, string> = {"root":"root","w-full":"w-full","outline-none":"outline-none","max-h-[min(var(--available-height),24rem)]":"max-h-[min(var(--available-height),24rem)]","min-w-(--anchor-width)":"min-w-(--anchor-width)","bg-kumo-control":"bg-kumo-control","rounded-lg":"rounded-lg","shadow-lg":"shadow-lg","ring-kumo-line":"ring-kumo-line","data-highlighted:bg-kumo-overlay":"data-highlighted:bg-kumo-overlay","data-selected:font-medium":"data-selected:font-medium"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Autocomplete(incoming: AutocompleteProps): JSX.Element {
  const props = Object.assign({}, incoming);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as AutocompleteProps & Record<string, unknown>, []);
  void native; void state; void refs;
  return (<div data-kumo-compound={"autocomplete"}><div data-kumo-part={"root"}>{(props.root as JSX.Element) ?? undefined}</div><div data-kumo-part={"collection"}>{(props.collection as JSX.Element) ?? undefined}</div></div>);
}

export function AutocompleteContent(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Content">{local.children}</div>;
}

export function AutocompleteInputGroup(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="InputGroup">{local.children}</div>;
}

export function AutocompleteItem(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Item">{local.children}</div>;
}

export function AutocompleteList(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="List">{local.children}</div>;
}

Object.defineProperty(Autocomplete, "Content", {value:AutocompleteContent, enumerable:true});
Object.defineProperty(Autocomplete, "InputGroup", {value:AutocompleteInputGroup, enumerable:true});
Object.defineProperty(Autocomplete, "Item", {value:AutocompleteItem, enumerable:true});
Object.defineProperty(Autocomplete, "List", {value:AutocompleteList, enumerable:true});

export default Autocomplete;
