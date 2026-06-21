import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface LinkProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "c6f0fbd6318e25df8755e6c0053fe1d74c23861e6bcc3f9256588ac62b9fa195";
const styles: Record<string, string> = {"root":"root","group/link":"group/link","inline-flex":"inline-flex","items-center":"items-center"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Link(incoming: LinkProps): JSX.Element {
  const props = Object.assign({"variant":"inline"}, incoming);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as LinkProps & Record<string, unknown>, []);
  void native; void state; void refs;
  return (<a href={(props.href as any)} class={mergeStyles(styles.root)}>{props.children}</a>);
}

export default Link;
