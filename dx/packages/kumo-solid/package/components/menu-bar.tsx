import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface MenuBarProps extends Record<string, unknown> { children?: JSX.Element; fixture?: unknown; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "188bad4486283b6daed15b228465d53415f5e138ecb140a8de65b390602a0a22";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
export const semanticVariantDigests = {"empty-nav-ssr":"5cdeed6857aee33ad3beee01ef718b002e5e7d97daf643c1739e8d71cb4922b0"} as const;
const styles: Record<string, string> = {"root":"root","isolate":"isolate","flex":"flex","rounded-lg":"rounded-lg","ring-kumo-line":"ring-kumo-line","bg-kumo-recessed":"bg-kumo-recessed","shadow-xs":"shadow-xs"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const fixtureText = (value: any): string => value && typeof value === "object" ? String(typeof value.text === "string" ? value.text : "") + (Array.isArray(value.children) ? value.children.map(fixtureText).join("") : "") : "";
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function MenuBar(incoming: MenuBarProps): JSX.Element {
  const props = Object.assign({"optionIds":false}, incoming);
  const fixture = props.fixture;
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as MenuBarProps & Record<string, unknown>, []);
  void native; void state; void refs;
  if (Object.prototype.hasOwnProperty.call(props, "isActive") && semanticEqual(props.isActive, 0) && Object.prototype.hasOwnProperty.call(props, "options") && semanticEqual(props.options, [])) return (<nav class="isolate flex rounded-lg ring-kumo-line bg-kumo-recessed"></nav>);
  return (<div data-kumo-compound={"menu-bar"}><div data-kumo-part={"root"}>{(props.root as JSX.Element) ?? undefined}</div><div data-kumo-part={"collection"}>{(props.collection as JSX.Element) ?? undefined}</div></div>);
}

export default MenuBar;
