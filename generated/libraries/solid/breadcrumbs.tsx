import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface BreadcrumbsProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "7a7f2d6ea60be21b23d218781fadea8b534345fab15d5b0896600e503857eb65";
const styles: Record<string, string> = {"root":"root","group":"group","mr-4":"mr-4","flex":"flex","items-center":"items-center"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Breadcrumbs(incoming: BreadcrumbsProps): JSX.Element {
  const props = Object.assign({"size":"base"}, incoming);
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
