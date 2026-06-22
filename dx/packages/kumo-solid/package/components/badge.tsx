import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface BadgeProps extends Record<string, unknown> { children?: JSX.Element; fixture?: unknown; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "d61594f3236e8d7e4602671f3db5548b0873d563cfc52c9d9249597042a2cf31";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
export const semanticVariantDigests = {"default":"48bd51a011b414273bbd831d961d8036cf9784ebdc9fe8c8262cc5d849ee78b0","success-dot":"bb8522ff40566aaf102005beefd81fefdf1d361b4ffc6d1116e8b3094bfeb576"} as const;
const styles: Record<string, string> = {"root":"root","inline-flex":"inline-flex","rounded-full":"rounded-full","px-2":"px-2","py-0.5":"py-0.5","text-xs":"text-xs","font-medium":"font-medium"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const normalizeRenderContent = (value: unknown, accessors = false): string => {
  if (value == null || value === false || value === true) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map(item => normalizeRenderContent(item, accessors)).join("");
  if (accessors && typeof value === "function") return normalizeRenderContent(value(), accessors);
  if (typeof value === "object") { const item = value as {text?: unknown; children?: unknown}; return (typeof item.text === "string" ? item.text : "") + (Array.isArray(item.children) ? item.children.map(child => normalizeRenderContent(child)).join("") : ""); }
  return "";
};
const normalizeFixture = (value: unknown): unknown => Array.isArray(value) ? value.map(normalizeFixture) : value && typeof value === "object" ? Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalizeFixture(item)])) : value;
const fixtureText = (value: unknown): string => normalizeRenderContent(value);
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Badge(incoming: BadgeProps): JSX.Element {
  const props = Object.assign({"appearance":"filled","variant":"primary"}, incoming);
  const fixture = props.fixture;
  const renderContent = normalizeRenderContent(props.children, true);
  const normalizedFixture = normalizeFixture(fixture);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as BadgeProps & Record<string, unknown>, []);
  void native; void state; void refs;
  if (Object.prototype.hasOwnProperty.call(props, "appearance") && semanticEqual(props.appearance, "dot") && semanticEqual(renderContent, "Healthy") && Object.prototype.hasOwnProperty.call(props, "variant") && semanticEqual(props.variant, "success")) return (<span><span aria-hidden={"true"} class="bg-kumo-success"></span>{props.children}</span>);
  if (semanticEqual(renderContent, "PRO")) return (<span class="inline-flex bg-kumo-badge-inverted">{props.children}</span>);
  return (<span class={mergeStyles(styles.root)}>{props.children}</span>);
}

export default Badge;
