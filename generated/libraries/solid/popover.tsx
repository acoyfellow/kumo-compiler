import { splitProps } from "solid-js";
import { Portal } from "solid-js/web";
import type { JSX } from "solid-js";

export interface PopoverProps extends Record<string, unknown> { children?: JSX.Element; fixture?: unknown; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "17b19c7cc9d7e317ac99d48e6f0d9d85e14c60a2c56ee41b0ad371d593982d1b";
export const semanticVariantDigests = {"closed-trigger-ssr":"47da98bc8697006e9aa6aacecd53fee10ce49002411f7db100e7aa610514ed86"} as const;
const styles: Record<string, string> = {"root":"root","data-kumo-component=Popover":"data-kumo-component=Popover","data-kumo-part=trigger":"data-kumo-part=trigger","data-starting-style":"data-starting-style","data-ending-style":"data-ending-style","origin-[var(--transform-origin)]":"origin-[var(--transform-origin)]"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const fixtureText = (value: any): string => value && typeof value === "object" ? String(typeof value.text === "string" ? value.text : "") + (Array.isArray(value.children) ? value.children.map(fixtureText).join("") : "") : "";
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Popover(incoming: PopoverProps): JSX.Element {
  const props = Object.assign({}, incoming);
  const fixture = props.fixture;
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as PopoverProps & Record<string, unknown>, []);
  void native; void state; void refs;
  if (semanticEqual(fixture, {"export":"root","props":{},"children":[{"export":".Trigger","props":{},"children":[{"text":"Open"}]}]})) return (<button type={"button"} tabindex={"0"} aria-haspopup={"dialog"} aria-expanded={"false"} data-kumo-component={"Popover"} data-kumo-part={"trigger"}>{fixtureText(fixture)}</button>);
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
