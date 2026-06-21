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
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export declare const PopoverClose: (props: CompoundPartProps) => JSX.Element;
export declare const PopoverContent: (props: CompoundPartProps) => JSX.Element;
export declare const PopoverDescription: (props: CompoundPartProps) => JSX.Element;
export declare const PopoverTitle: (props: CompoundPartProps) => JSX.Element;
export declare const PopoverTrigger: (props: CompoundPartProps) => JSX.Element;
export declare const Popover: ((props: PopoverProps) => JSX.Element) & { "Close": typeof PopoverClose; "Content": typeof PopoverContent; "Description": typeof PopoverDescription; "Title": typeof PopoverTitle; "Trigger": typeof PopoverTrigger };
export default Popover;
