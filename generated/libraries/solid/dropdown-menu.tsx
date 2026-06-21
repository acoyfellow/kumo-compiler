import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface DropdownMenuProps extends Record<string, unknown> { children?: JSX.Element; fixture?: unknown; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "8160e7a22d2d7fc68698e72727c99e47271a36b1d0fe1bcf32b99194f77ad3bc";
export const semanticVariantDigests = {"closed-trigger-ssr":"96a51ef90c52bda16064391fbaddcdd8221a7f254583a75aa51732efd36fee89"} as const;
const styles: Record<string, string> = {"root":"root","data-highlighted":"data-highlighted","data-disabled":"data-disabled","data-popup-open":"data-popup-open","data-starting-style":"data-starting-style","data-ending-style":"data-ending-style","text-kumo-danger":"text-kumo-danger"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const fixtureText = (value: any): string => value && typeof value === "object" ? String(typeof value.text === "string" ? value.text : "") + (Array.isArray(value.children) ? value.children.map(fixtureText).join("") : "") : "";
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function DropdownMenu(incoming: DropdownMenuProps): JSX.Element {
  const props = Object.assign({}, incoming);
  const fixture = props.fixture;
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as DropdownMenuProps & Record<string, unknown>, []);
  void native; void state; void refs;
  if (semanticEqual(fixture, {"export":"root","props":{},"children":[{"export":".Trigger","props":{},"children":[{"text":"Actions"}]}]})) return (<button type={"button"} tabindex={"0"} aria-haspopup={"menu"}>{fixtureText(fixture)}</button>);
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
