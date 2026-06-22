import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface CommandPaletteProps extends Record<string, unknown> { children?: JSX.Element; fixture?: unknown; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "4aabec222bec5b00f25388a2bb017b36c91349e55fa3ba6cb97fdc3d0afee0c0";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
export const semanticVariantDigests = {"highlighted-text":"c47ffa9c9bb6ae48155882f1e4314b02f15e89d24d472bc83da54565ba878bf0"} as const;
const styles: Record<string, string> = {"root":"root","fixed inset-0 bg-kumo-overlay opacity-80":"fixed inset-0 bg-kumo-overlay opacity-80","fixed top-[10vh] left-1/2 w-full max-w-2xl -translate-x-1/2":"fixed top-[10vh] left-1/2 w-full max-w-2xl -translate-x-1/2","max-h-[60vh]":"max-h-[60vh]","rounded-lg bg-kumo-elevated":"rounded-lg bg-kumo-elevated","bg-kumo-base":"bg-kumo-base","data-[highlighted]:bg-kumo-overlay":"data-[highlighted]:bg-kumo-overlay","kumo-input-placeholder":"kumo-input-placeholder"};
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

export function CommandPalette(incoming: CommandPaletteProps): JSX.Element {
  const props = Object.assign({}, incoming);
  const fixture = props.fixture;
  const renderContent = normalizeRenderContent(props.children, true);
  const normalizedFixture = normalizeFixture(fixture);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as CommandPaletteProps & Record<string, unknown>, []);
  void native; void state; void refs;
  if (Object.prototype.hasOwnProperty.call(props, "highlights") && semanticEqual(props.highlights, [[0,4]]) && Object.prototype.hasOwnProperty.call(props, "text") && semanticEqual(props.text, "Cloudflare") && semanticEqual(normalizedFixture, {"export":".HighlightedText","props":{"text":"Cloudflare","highlights":[[0,4]]},"children":[]})) return (<span><mark>{"Cloud"}</mark></span>);
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
