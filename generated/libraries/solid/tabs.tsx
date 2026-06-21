import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface TabsProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export const modelDigest = "480d0ca0dc8311b3321bb1c078c9277118ed399fcc4ececa5b561d5b695a3336";
const styles: Record<string, string> = {"root":"root","relative isolate min-w-0 font-medium":"relative isolate min-w-0 font-medium","kumo-tabs-list overflow-x-auto rounded-lg bg-kumo-recessed":"kumo-tabs-list overflow-x-auto rounded-lg bg-kumo-recessed","focus-visible:ring-2 focus-visible:ring-kumo-brand":"focus-visible:ring-2 focus-visible:ring-kumo-brand"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Tabs(incoming: TabsProps): JSX.Element {
  const props = Object.assign({"activateOnFocus":false,"selectedValue":"first tab value when uncontrolled and selectedValue omitted","size":"base","tabs":[],"variant":"segmented"}, incoming);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as TabsProps & Record<string, unknown>, []);
  void native; void state; void refs;
  return (<div data-kumo-compound={"tabs"}><div data-kumo-part={"root"}>{(props.root as JSX.Element) ?? undefined}</div><div data-kumo-part={"collection"}>{(props.collection as JSX.Element) ?? undefined}</div></div>);
}

export default Tabs;
