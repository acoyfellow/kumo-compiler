import type { JSX } from "solid-js";
export interface CommandPaletteProps {
  "compound"?: unknown;
  "Dialog"?: unknown;
  "Input"?: unknown;
  "Panel"?: unknown;
  "Root"?: unknown;
  "Dialog"?: JSX.Element;
  "Input"?: JSX.Element;
  "Panel"?: JSX.Element;
  "Root"?: JSX.Element;
  "compound"?: JSX.Element;
  children?: JSX.Element;
  styles?: Record<string, string>;
}
export declare const CommandPalette: (props: CommandPaletteProps) => JSX.Element;
export default CommandPalette;
