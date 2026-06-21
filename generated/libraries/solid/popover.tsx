import { splitProps } from "solid-js";
import { Portal } from "solid-js/web";
import type { JSX } from "solid-js";

export interface PopoverProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "ad3f10680d31c621c1bc54e0a910834f60fbc9d5776de398d94abac24dc0d45d";
const styles: Record<string, string> = {"root":"root","data-kumo-component=Popover":"data-kumo-component=Popover","data-kumo-part=trigger":"data-kumo-part=trigger","data-starting-style":"data-starting-style","data-ending-style":"data-ending-style","origin-[var(--transform-origin)]":"origin-[var(--transform-origin)]"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Popover(incoming: PopoverProps): JSX.Element {
  const props = Object.assign({}, incoming);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as PopoverProps & Record<string, unknown>, []);
  void native; void state; void refs;
  return (<Portal mount={resolvePortalTarget("document-body")} children={<><div data-kumo-compound={"popover"}><div data-kumo-part={"popover"}>{(props.popover as JSX.Element) ?? undefined}</div></div></>} />);
}

export function PopoverClose(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Close">{local.children}</div>;
}

export function PopoverContent(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Content">{local.children}</div>;
}

export function PopoverDescription(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Description">{local.children}</div>;
}

export function PopoverTitle(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Title">{local.children}</div>;
}

export function PopoverTrigger(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Trigger">{local.children}</div>;
}

Object.defineProperty(Popover, "Close", {value:PopoverClose, enumerable:true});
Object.defineProperty(Popover, "Content", {value:PopoverContent, enumerable:true});
Object.defineProperty(Popover, "Description", {value:PopoverDescription, enumerable:true});
Object.defineProperty(Popover, "Title", {value:PopoverTitle, enumerable:true});
Object.defineProperty(Popover, "Trigger", {value:PopoverTrigger, enumerable:true});

export default Popover;
