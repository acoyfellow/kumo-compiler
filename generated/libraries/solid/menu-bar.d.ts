import type { JSX } from "solid-js";
export interface MenuBarProps {
  "className"?: unknown;
  "isActive"?: unknown;
  "optionIds"?: unknown;
  "options"?: unknown;
  children?: JSX.Element;
  fixture?: unknown;
  styles?: Record<string, string>;
}
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export declare const MenuBar: ((props: MenuBarProps) => JSX.Element);
export default MenuBar;
