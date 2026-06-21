import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface DropdownMenuProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "4af0c8a7d7b8b60e856eaff59dc37b9cf13972ebeb4a5efd3e6776a353898221";
const styles: Record<string, string> = {"root":"root","data-highlighted":"data-highlighted","data-disabled":"data-disabled","data-popup-open":"data-popup-open","data-starting-style":"data-starting-style","data-ending-style":"data-ending-style","text-kumo-danger":"text-kumo-danger"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function DropdownMenu(incoming: DropdownMenuProps): JSX.Element {
  const props = Object.assign({}, incoming);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as DropdownMenuProps & Record<string, unknown>, []);
  void native; void state; void refs;
  return (<div data-kumo-compound={"dropdown-menu"}><div data-kumo-part={"root"}>{(props.root as JSX.Element) ?? undefined}</div><div data-kumo-part={"collection"}>{(props.collection as JSX.Element) ?? undefined}</div></div>);
}

export function DropdownMenuContent(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Content">{local.children}</div>;
}

export function DropdownMenuItem(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Item">{local.children}</div>;
}

export function DropdownMenuSub(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Sub">{local.children}</div>;
}

export function DropdownMenuSubContent(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="SubContent">{local.children}</div>;
}

export function DropdownMenuSubTrigger(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="SubTrigger">{local.children}</div>;
}

export function DropdownMenuTrigger(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Trigger">{local.children}</div>;
}

Object.defineProperty(DropdownMenu, "Content", {value:DropdownMenuContent, enumerable:true});
Object.defineProperty(DropdownMenu, "Item", {value:DropdownMenuItem, enumerable:true});
Object.defineProperty(DropdownMenu, "Sub", {value:DropdownMenuSub, enumerable:true});
Object.defineProperty(DropdownMenu, "SubContent", {value:DropdownMenuSubContent, enumerable:true});
Object.defineProperty(DropdownMenu, "SubTrigger", {value:DropdownMenuSubTrigger, enumerable:true});
Object.defineProperty(DropdownMenu, "Trigger", {value:DropdownMenuTrigger, enumerable:true});

export default DropdownMenu;
