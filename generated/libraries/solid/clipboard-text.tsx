import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface ClipboardTextProps extends Record<string, unknown> { children?: JSX.Element; fixture?: unknown; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "00a3f6fda7beba1a0b5d8925eaaf3a396917695fb817c769cc203af6e8da92c2";
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
