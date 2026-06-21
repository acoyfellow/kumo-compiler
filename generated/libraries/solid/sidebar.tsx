import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface SidebarProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "4c801e32de9aeeb481f09910a3cf18fe74e2893bb998ef9d4abdf950ffda4b13";
const styles: Record<string, string> = {"root":"root","group/sidebar-wrapper relative isolate flex w-full":"group/sidebar-wrapper relative isolate flex w-full","group/sidebar relative h-full shrink-0 grow-0":"group/sidebar relative h-full shrink-0 grow-0","transition-[width] duration-(--sidebar-animation-duration)":"transition-[width] duration-(--sidebar-animation-duration)","motion-reduce:transition-none":"motion-reduce:transition-none"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Sidebar(incoming: SidebarProps): JSX.Element {
  const props = Object.assign({}, incoming);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as SidebarProps & Record<string, unknown>, []);
  void native; void state; void refs;
  return (<div data-kumo-compound={"sidebar"}><div data-kumo-part={"root"}>{(props.root as JSX.Element) ?? undefined}</div><div data-kumo-part={"collection"}>{(props.collection as JSX.Element) ?? undefined}</div></div>);
}

export function SidebarCollapsible(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Collapsible">{local.children}</div>;
}

export function SidebarCollapsibleContent(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="CollapsibleContent">{local.children}</div>;
}

export function SidebarContent(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Content">{local.children}</div>;
}

export function SidebarFooter(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Footer">{local.children}</div>;
}

export function SidebarGroup(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Group">{local.children}</div>;
}

export function SidebarGroupLabel(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="GroupLabel">{local.children}</div>;
}

export function SidebarHeader(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Header">{local.children}</div>;
}

export function SidebarMenu(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Menu">{local.children}</div>;
}

export function SidebarMenuButton(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="MenuButton">{local.children}</div>;
}

export function SidebarProvider(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Provider">{local.children}</div>;
}

export function SidebarResizeHandle(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="ResizeHandle">{local.children}</div>;
}

export function SidebarSlidingView(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="SlidingView">{local.children}</div>;
}

export function SidebarSlidingViews(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="SlidingViews">{local.children}</div>;
}

export function SidebarTrigger(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Trigger">{local.children}</div>;
}

Object.defineProperty(Sidebar, "Collapsible", {value:SidebarCollapsible, enumerable:true});
Object.defineProperty(Sidebar, "CollapsibleContent", {value:SidebarCollapsibleContent, enumerable:true});
Object.defineProperty(Sidebar, "Content", {value:SidebarContent, enumerable:true});
Object.defineProperty(Sidebar, "Footer", {value:SidebarFooter, enumerable:true});
Object.defineProperty(Sidebar, "Group", {value:SidebarGroup, enumerable:true});
Object.defineProperty(Sidebar, "GroupLabel", {value:SidebarGroupLabel, enumerable:true});
Object.defineProperty(Sidebar, "Header", {value:SidebarHeader, enumerable:true});
Object.defineProperty(Sidebar, "Menu", {value:SidebarMenu, enumerable:true});
Object.defineProperty(Sidebar, "MenuButton", {value:SidebarMenuButton, enumerable:true});
Object.defineProperty(Sidebar, "Provider", {value:SidebarProvider, enumerable:true});
Object.defineProperty(Sidebar, "ResizeHandle", {value:SidebarResizeHandle, enumerable:true});
Object.defineProperty(Sidebar, "SlidingView", {value:SidebarSlidingView, enumerable:true});
Object.defineProperty(Sidebar, "SlidingViews", {value:SidebarSlidingViews, enumerable:true});
Object.defineProperty(Sidebar, "Trigger", {value:SidebarTrigger, enumerable:true});

export default Sidebar;
