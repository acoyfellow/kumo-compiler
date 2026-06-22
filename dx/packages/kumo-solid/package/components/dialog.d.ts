import type { JSX } from "solid-js";
export interface DialogProps {
  "Close"?: unknown;
  "Description"?: unknown;
  "Dialog"?: unknown;
  "Root"?: unknown;
  "Title"?: unknown;
  "Trigger"?: unknown;
  "Close"?: JSX.Element;
  "Description"?: JSX.Element;
  "Dialog"?: JSX.Element;
  "Root"?: JSX.Element;
  "Title"?: JSX.Element;
  "Trigger"?: JSX.Element;
  children?: JSX.Element;
  fixture?: unknown;
  styles?: Record<string, string>;
}
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export declare const DialogClose: (props: CompoundPartProps) => JSX.Element;
export declare const DialogDescription: (props: CompoundPartProps) => JSX.Element;
export declare const DialogRoot: (props: CompoundPartProps) => JSX.Element;
export declare const DialogTitle: (props: CompoundPartProps) => JSX.Element;
export declare const DialogTrigger: (props: CompoundPartProps) => JSX.Element;
export declare const Dialog: ((props: DialogProps) => JSX.Element) & { "Close": typeof DialogClose; "Description": typeof DialogDescription; "Root": typeof DialogRoot; "Title": typeof DialogTitle; "Trigger": typeof DialogTrigger };
export default Dialog;
