import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface LinkProps extends Record<string, unknown> { children?: JSX.Element; fixture?: unknown; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "7788e2dcb1ce47cb68c2f9ec62a5bc078986b931bd2c1cbfc1b21e473a94334c";
export const semanticVariantDigests = {"internal":"29e7ed1c47e2e5846d73164683b615e304a7c4b479fa40d162ff644a54fe0a42","plain-external":"55849ea241349409983a1f64b0567fc60bcfddac212cbfbd2a2b0d73ca8bd710"} as const;
const styles: Record<string, string> = {"root":"root","group/link":"group/link","inline-flex":"inline-flex","items-center":"items-center"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const fixtureText = (value: any): string => value && typeof value === "object" ? String(typeof value.text === "string" ? value.text : "") + (Array.isArray(value.children) ? value.children.map(fixtureText).join("") : "") : "";
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Link(incoming: LinkProps): JSX.Element {
  const props = Object.assign({"variant":"inline"}, incoming);
  const fixture = props.fixture;
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as LinkProps & Record<string, unknown>, []);
  void native; void state; void refs;
  if (Object.prototype.hasOwnProperty.call(props, "children") && semanticEqual(props.children, "External") && Object.prototype.hasOwnProperty.call(props, "href") && semanticEqual(props.href, "https://example.com") && Object.prototype.hasOwnProperty.call(props, "variant") && semanticEqual(props.variant, "plain")) return (<a href={"https://example.com"} class="hover:text-kumo-link/70">{props.children}</a>);
  if (Object.prototype.hasOwnProperty.call(props, "children") && semanticEqual(props.children, "Docs") && Object.prototype.hasOwnProperty.call(props, "href") && semanticEqual(props.href, "/docs")) return (<a href={"/docs"} data-kumo-component={"Link"} class="text-kumo-link underline">{props.children}</a>);
  return (<a href={(props.href as any)} class={mergeStyles(styles.root)}>{props.children}</a>);
}

export default Link;
