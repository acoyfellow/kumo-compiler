import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface MenuBarProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "40c08fc1e03b3a7d723ec35135cb4cf3a2605d12368398588dcda6818ce453ea";
const styles: Record<string, string> = {"root":"root","isolate":"isolate","flex":"flex","rounded-lg":"rounded-lg","ring-kumo-line":"ring-kumo-line","bg-kumo-recessed":"bg-kumo-recessed","shadow-xs":"shadow-xs"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function MenuBar(incoming: MenuBarProps): JSX.Element {
  const props = Object.assign({"optionIds":false}, incoming);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as MenuBarProps & Record<string, unknown>, []);
  void native; void state; void refs;
  return (<div data-kumo-compound={"menu-bar"}><div data-kumo-part={"root"}>{(props.root as JSX.Element) ?? undefined}</div><div data-kumo-part={"collection"}>{(props.collection as JSX.Element) ?? undefined}</div></div>);
}

export default MenuBar;
