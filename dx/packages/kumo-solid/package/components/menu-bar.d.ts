import type { JSX } from "solid-js";
export interface MenuBarProps {
  "className"?: unknown;
  "isActive"?: unknown;
  "optionIds"?: unknown;
  "options"?: unknown;
  children?: JSX.Element;
  styles?: Record<string, string>;
}
export declare const MenuBar: (props: MenuBarProps) => JSX.Element;
export default MenuBar;
