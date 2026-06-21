import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface CommandPaletteProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "7e72307448756ba3dce186fdd6d001623e82bf54634bcb1dd046b6ec82f31bf6";
const styles: Record<string, string> = {"root":"root","fixed inset-0 bg-kumo-overlay opacity-80":"fixed inset-0 bg-kumo-overlay opacity-80","fixed top-[10vh] left-1/2 w-full max-w-2xl -translate-x-1/2":"fixed top-[10vh] left-1/2 w-full max-w-2xl -translate-x-1/2","max-h-[60vh]":"max-h-[60vh]","rounded-lg bg-kumo-elevated":"rounded-lg bg-kumo-elevated","bg-kumo-base":"bg-kumo-base","data-[highlighted]:bg-kumo-overlay":"data-[highlighted]:bg-kumo-overlay","kumo-input-placeholder":"kumo-input-placeholder"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function CommandPalette(incoming: CommandPaletteProps): JSX.Element {
  const props = Object.assign({}, incoming);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as CommandPaletteProps & Record<string, unknown>, []);
  void native; void state; void refs;
  return (<div data-kumo-compound={"command-palette"}><div data-kumo-part={"root"}>{(props.root as JSX.Element) ?? undefined}</div><div data-kumo-part={"collection"}>{(props.collection as JSX.Element) ?? undefined}</div></div>);
}

export function CommandPaletteHighlightedText(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="HighlightedText">{local.children}</div>;
}

export function CommandPaletteInput(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Input">{local.children}</div>;
}

export function CommandPaletteItem(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Item">{local.children}</div>;
}

export function CommandPaletteList(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="List">{local.children}</div>;
}

export function CommandPaletteRoot(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Root">{local.children}</div>;
}

Object.defineProperty(CommandPalette, "HighlightedText", {value:CommandPaletteHighlightedText, enumerable:true});
Object.defineProperty(CommandPalette, "Input", {value:CommandPaletteInput, enumerable:true});
Object.defineProperty(CommandPalette, "Item", {value:CommandPaletteItem, enumerable:true});
Object.defineProperty(CommandPalette, "List", {value:CommandPaletteList, enumerable:true});
Object.defineProperty(CommandPalette, "Root", {value:CommandPaletteRoot, enumerable:true});

export default CommandPalette;
