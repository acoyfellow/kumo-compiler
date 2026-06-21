import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface CommandPaletteProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export const modelDigest = "534bd5b5c6c38761249fe7fb50b9cc0cc672c5a25c4b72ab4e1808bb92d2dd29";
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

export default CommandPalette;
