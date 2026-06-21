import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface BreadcrumbsProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export const modelDigest = "1cb602a165516ca01de95379b40403eb61ab498fa6557f44ddeb0f0f5d0d9e4f";
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

export default Breadcrumbs;
