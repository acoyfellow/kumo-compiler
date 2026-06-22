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
  fixture?: unknown;
  styles?: Record<string, string>;
}
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export declare const CommandPaletteHighlightedText: (props: CompoundPartProps) => JSX.Element;
export declare const CommandPaletteInput: (props: CompoundPartProps) => JSX.Element;
export declare const CommandPaletteItem: (props: CompoundPartProps) => JSX.Element;
export declare const CommandPaletteList: (props: CompoundPartProps) => JSX.Element;
export declare const CommandPaletteRoot: (props: CompoundPartProps) => JSX.Element;
export declare const CommandPalette: ((props: CommandPaletteProps) => JSX.Element) & { "HighlightedText": typeof CommandPaletteHighlightedText; "Input": typeof CommandPaletteInput; "Item": typeof CommandPaletteItem; "List": typeof CommandPaletteList; "Root": typeof CommandPaletteRoot };
export default CommandPalette;
