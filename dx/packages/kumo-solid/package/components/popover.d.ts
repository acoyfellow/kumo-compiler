import type { JSX } from "solid-js";
export interface PopoverProps {
  "Close"?: unknown;
  "Content"?: unknown;
  "Root"?: unknown;
  "Title/Description"?: unknown;
  "Trigger"?: unknown;
  "Close"?: JSX.Element;
  "Content"?: JSX.Element;
  "Root"?: JSX.Element;
  "Title/Description"?: JSX.Element;
  "Trigger"?: JSX.Element;
  children?: JSX.Element;
  styles?: Record<string, string>;
}
export declare const Popover: (props: PopoverProps) => JSX.Element;
export default Popover;
