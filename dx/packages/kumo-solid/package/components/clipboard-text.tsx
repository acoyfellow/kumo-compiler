import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface ClipboardTextProps extends Record<string, unknown> { children?: JSX.Element; fixture?: unknown; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "b0a8634b18904bafb4a3ad9eb78bc40c9142397d8869bcc94a88c6a372265e25";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
export const semanticVariantDigests = {"ssr":"84316287b165e3499c9844cb130cdf3cf1d8ce7ea5c049ca51705c1fc977cd48"} as const;
const styles: Record<string, string> = {"root":"root"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const fixtureText = (value: any): string => value && typeof value === "object" ? String(typeof value.text === "string" ? value.text : "") + (Array.isArray(value.children) ? value.children.map(fixtureText).join("") : "") : "";
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function ClipboardText(incoming: ClipboardTextProps): JSX.Element {
  const props = Object.assign({}, incoming);
  const fixture = props.fixture;
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as ClipboardTextProps & Record<string, unknown>, ["observable"]);
  void native; void state; void refs;
  if (Object.prototype.hasOwnProperty.call(props, "text") && semanticEqual(props.text, "visible") && Object.prototype.hasOwnProperty.call(props, "textToCopy") && semanticEqual(props.textToCopy, "payload")) return (<div></div>);
  return (<div class={mergeStyles(styles.root)} data-kumo-element={"clipboard-text"}></div>);
}

export default ClipboardText;
