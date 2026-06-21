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
  styles?: Record<string, string>;
}
export declare const Dialog: (props: DialogProps) => JSX.Element;
export default Dialog;
