import type { JSX } from "solid-js";
export interface DropdownMenuProps {
  "CheckboxItem"?: unknown;
  "Content/SubContent"?: unknown;
  "Item"?: unknown;
  "Label/Separator/Shortcut/Group"?: unknown;
  "LinkItem"?: unknown;
  "RadioGroup/RadioItem/RadioItemIndicator"?: unknown;
  "Root"?: unknown;
  "Sub/SubTrigger"?: unknown;
  "Trigger"?: unknown;
  "CheckboxItem"?: JSX.Element;
  "Content/SubContent"?: JSX.Element;
  "Item"?: JSX.Element;
  "Label/Separator/Shortcut/Group"?: JSX.Element;
  "LinkItem"?: JSX.Element;
  "RadioGroup/RadioItem/RadioItemIndicator"?: JSX.Element;
  "Root"?: JSX.Element;
  "Sub/SubTrigger"?: JSX.Element;
  "Trigger"?: JSX.Element;
  children?: JSX.Element;
  styles?: Record<string, string>;
}
export declare const DropdownMenu: (props: DropdownMenuProps) => JSX.Element;
export default DropdownMenu;
