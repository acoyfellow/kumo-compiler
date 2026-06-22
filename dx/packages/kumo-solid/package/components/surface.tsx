import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface SurfaceProps extends Record<string, unknown> { children?: JSX.Element; fixture?: unknown; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "bcb4aa3e592b9584d7e18fe498c9d2cfaad66ee570e649a81bfcf73eeccac950";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
export const semanticVariantDigests = {"default":"4441c41c07410c7e20f820d8180d29bc4fa68fb41f9ec635bcc641391f687b4b","as-section":"308e0794f759650df3841b6d3e8260c5277c3b302bc9c17b2cac90eb36457489"} as const;
const styles: Record<string, string> = {"root":"root","overflow-visible":"overflow-visible","rounded-none":"rounded-none"};
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

export function Surface(incoming: SurfaceProps): JSX.Element {
  const props = Object.assign({"color":"primary"}, incoming);
  const fixture = props.fixture;
  const renderContent = normalizeRenderContent(props.children, true);
  const normalizedFixture = normalizeFixture(fixture);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as SurfaceProps & Record<string, unknown>, []);
  void native; void state; void refs;
  if (Object.prototype.hasOwnProperty.call(props, "as") && semanticEqual(props.as, "section") && semanticEqual(renderContent, "Card") && Object.prototype.hasOwnProperty.call(props, "color") && semanticEqual(props.color, "secondary")) return (<section data-surface-color={"secondary"} data-deprecated={"surface"}>{props.children}</section>);
  if (semanticEqual(renderContent, "Card")) return (<div data-surface-color={"primary"} data-deprecated={"surface"}>{props.children}</div>);
  return (<div class={mergeStyles(styles.root)}>{props.children}</div>);
}

export default Surface;
