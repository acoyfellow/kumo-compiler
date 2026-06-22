import type { JSX } from "solid-js";
export interface SidebarProps {
  "Collapsible"?: unknown;
  "CollapsibleTrigger"?: unknown;
  "MenuButton"?: unknown;
  "MenuSubButton"?: unknown;
  "Provider"?: unknown;
  "root"?: unknown;
  "SlidingView"?: unknown;
  "SlidingViews"?: unknown;
  "Collapsible"?: JSX.Element;
  "CollapsibleTrigger"?: JSX.Element;
  "MenuButton"?: JSX.Element;
  "MenuSubButton"?: JSX.Element;
  "Provider"?: JSX.Element;
  "SlidingView"?: JSX.Element;
  "SlidingViews"?: JSX.Element;
  "root"?: JSX.Element;
  children?: JSX.Element;
  fixture?: unknown;
  styles?: Record<string, string>;
}
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export declare const SidebarCollapsible: (props: CompoundPartProps) => JSX.Element;
export declare const SidebarCollapsibleContent: (props: CompoundPartProps) => JSX.Element;
export declare const SidebarContent: (props: CompoundPartProps) => JSX.Element;
export declare const SidebarFooter: (props: CompoundPartProps) => JSX.Element;
export declare const SidebarGroup: (props: CompoundPartProps) => JSX.Element;
export declare const SidebarGroupLabel: (props: CompoundPartProps) => JSX.Element;
export declare const SidebarHeader: (props: CompoundPartProps) => JSX.Element;
export declare const SidebarMenu: (props: CompoundPartProps) => JSX.Element;
export declare const SidebarMenuButton: (props: CompoundPartProps) => JSX.Element;
export declare const SidebarProvider: (props: CompoundPartProps) => JSX.Element;
export declare const SidebarResizeHandle: (props: CompoundPartProps) => JSX.Element;
export declare const SidebarSlidingView: (props: CompoundPartProps) => JSX.Element;
export declare const SidebarSlidingViews: (props: CompoundPartProps) => JSX.Element;
export declare const SidebarTrigger: (props: CompoundPartProps) => JSX.Element;
export declare const Sidebar: ((props: SidebarProps) => JSX.Element) & { "Collapsible": typeof SidebarCollapsible; "CollapsibleContent": typeof SidebarCollapsibleContent; "Content": typeof SidebarContent; "Footer": typeof SidebarFooter; "Group": typeof SidebarGroup; "GroupLabel": typeof SidebarGroupLabel; "Header": typeof SidebarHeader; "Menu": typeof SidebarMenu; "MenuButton": typeof SidebarMenuButton; "Provider": typeof SidebarProvider; "ResizeHandle": typeof SidebarResizeHandle; "SlidingView": typeof SidebarSlidingView; "SlidingViews": typeof SidebarSlidingViews; "Trigger": typeof SidebarTrigger };
export default Sidebar;
