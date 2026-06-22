import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface BreadcrumbsProps extends Record<string, unknown> { children?: JSX.Element; fixture?: unknown; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "b6e5e0d42071bc3fa59e912c2fa0d704cc3acc039749d4c109e804bab44b4b15";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
export const semanticVariantDigests = {} as const;
const styles: Record<string, string> = {"root":"root","group":"group","mr-4":"mr-4","flex":"flex","items-center":"items-center"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const fixtureText = (value: any): string => value && typeof value === "object" ? String(typeof value.text === "string" ? value.text : "") + (Array.isArray(value.children) ? value.children.map(fixtureText).join("") : "") : "";
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Breadcrumbs(incoming: BreadcrumbsProps): JSX.Element {
  const props = Object.assign({"size":"base"}, incoming);
  const fixture = props.fixture;
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as BreadcrumbsProps & Record<string, unknown>, []);
  void native; void state; void refs;
  return (<nav aria-label={"Breadcrumbs"} class={mergeStyles(styles.root)}>{props.children}</nav>);
}

export function BreadcrumbsCurrent(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Current">{local.children}</div>;
}

export function BreadcrumbsLink(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Link">{local.children}</div>;
}

export function BreadcrumbsSeparator(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Separator">{local.children}</div>;
}

Object.defineProperty(Breadcrumbs, "Current", {value:BreadcrumbsCurrent, enumerable:true});
Object.defineProperty(Breadcrumbs, "Link", {value:BreadcrumbsLink, enumerable:true});
Object.defineProperty(Breadcrumbs, "Separator", {value:BreadcrumbsSeparator, enumerable:true});

export default Breadcrumbs;
