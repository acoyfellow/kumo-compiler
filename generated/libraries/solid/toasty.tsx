import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface ToastyProps extends Record<string, unknown> { children?: JSX.Element; fixture?: unknown; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "f05e8c2389dfb02ca23049e0fc5aa80b2797a0b63cb9c09a9603acb5d07c79bf";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
export const semanticVariantDigests = {"provider-ssr":"4088bd17afcb25d127264e53159684eb5599f996db6063aa6fb7e16a14b73506"} as const;
const styles: Record<string, string> = {"root":"root","fixed":"fixed","bottom-4":"bottom-4","right-4":"right-4","rounded-lg":"rounded-lg","shadow-lg":"shadow-lg"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const fixtureText = (value: any): string => value && typeof value === "object" ? String(typeof value.text === "string" ? value.text : "") + (Array.isArray(value.children) ? value.children.map(fixtureText).join("") : "") : "";
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Toasty(incoming: ToastyProps): JSX.Element {
  const props = Object.assign({"container":"provider container or document.body","variant":"default"}, incoming);
  const fixture = props.fixture;
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as ToastyProps & Record<string, unknown>, []);
  void native; void state; void refs;
  if (Object.prototype.hasOwnProperty.call(props, "children") && semanticEqual(props.children, "Application")) return (<div>{props.children}</div>);
  return (<div data-kumo-compound={"toasty"}><div data-kumo-part={"root"}>{(props.root as JSX.Element) ?? undefined}</div><div data-kumo-part={"collection"}>{(props.collection as JSX.Element) ?? undefined}</div></div>);
}

export default Toasty;
