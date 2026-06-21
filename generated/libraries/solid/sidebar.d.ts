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
  styles?: Record<string, string>;
}
export declare const Sidebar: (props: SidebarProps) => JSX.Element;
export default Sidebar;
