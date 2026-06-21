import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface SidebarProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export const modelDigest = "82a1db07c782ac79373452b65cf7a972c8a0ea464dda72ff3fb69e7091df72c5";
const styles: Record<string, string> = {"root":"root","group/sidebar-wrapper relative isolate flex w-full":"group/sidebar-wrapper relative isolate flex w-full","group/sidebar relative h-full shrink-0 grow-0":"group/sidebar relative h-full shrink-0 grow-0","transition-[width] duration-(--sidebar-animation-duration)":"transition-[width] duration-(--sidebar-animation-duration)","motion-reduce:transition-none":"motion-reduce:transition-none"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Sidebar(incoming: SidebarProps): JSX.Element {
  const props = Object.assign({}, incoming);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as SidebarProps & Record<string, unknown>, []);
  void native; void state; void refs;
  return (<div data-kumo-compound={"sidebar"}><div data-kumo-part={"root"}>{props.root ?? undefined}</div><div data-kumo-part={"collection"}>{props.collection ?? undefined}</div></div>);
}

export default Sidebar;
