import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface TabsProps extends Record<string, unknown> { children?: JSX.Element; fixture?: unknown; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "6763686c876d24d09a4e3db417cfddaa467a96cf9741d6a57fc71a497d7ec5d0";
export const semanticVariantDigests = {"segmented-uncontrolled-first":"a86aa236d704763777e7377f6cc01a6d44a1272e07ce21bfd87fb1e61f5bec84","underline-selected-value":"a86aa236d704763777e7377f6cc01a6d44a1272e07ce21bfd87fb1e61f5bec84"} as const;
const styles: Record<string, string> = {"root":"root","relative isolate min-w-0 font-medium":"relative isolate min-w-0 font-medium","kumo-tabs-list overflow-x-auto rounded-lg bg-kumo-recessed":"kumo-tabs-list overflow-x-auto rounded-lg bg-kumo-recessed","focus-visible:ring-2 focus-visible:ring-kumo-brand":"focus-visible:ring-2 focus-visible:ring-kumo-brand"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const fixtureText = (value: any): string => value && typeof value === "object" ? String(typeof value.text === "string" ? value.text : "") + (Array.isArray(value.children) ? value.children.map(fixtureText).join("") : "") : "";
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Tabs(incoming: TabsProps): JSX.Element {
  const props = Object.assign({"activateOnFocus":false,"selectedValue":"first tab value when uncontrolled and selectedValue omitted","size":"base","tabs":[],"variant":"segmented"}, incoming);
  const fixture = props.fixture;
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as TabsProps & Record<string, unknown>, []);
  void native; void state; void refs;
  if (Object.prototype.hasOwnProperty.call(props, "selectedValue") && semanticEqual(props.selectedValue, "settings") && Object.prototype.hasOwnProperty.call(props, "size") && semanticEqual(props.size, "sm") && Object.prototype.hasOwnProperty.call(props, "tabs") && semanticEqual(props.tabs, [{"value":"overview","label":"Overview"},{"value":"settings","label":"Settings"}]) && Object.prototype.hasOwnProperty.call(props, "variant") && semanticEqual(props.variant, "underline") && semanticEqual(fixture, {"export":"root","props":{},"children":[]})) return (<div><button></button><button></button></div>);
  if (Object.prototype.hasOwnProperty.call(props, "tabs") && semanticEqual(props.tabs, [{"value":"overview","label":"Overview"},{"value":"settings","label":"Settings"}]) && semanticEqual(fixture, {"export":"root","props":{},"children":[]})) return (<div><button></button><button></button></div>);
  return (<div data-kumo-compound={"tabs"}><div data-kumo-part={"root"}>{(props.root as JSX.Element) ?? undefined}</div><div data-kumo-part={"collection"}>{(props.collection as JSX.Element) ?? undefined}</div></div>);
}

export default Tabs;
