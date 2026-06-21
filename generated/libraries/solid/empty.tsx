import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface EmptyProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export const modelDigest = "807df579a4b5811636f6c8ae3fbc56d8907ba572d3a57cf9b47ea9f266a81eca";
const styles: Record<string, string> = {"root":"root","flex":"flex","w-full":"w-full","flex-col":"flex-col","items-center":"items-center"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Empty(incoming: EmptyProps): JSX.Element {
  const props = Object.assign({"size":"base"}, incoming);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as EmptyProps & Record<string, unknown>, []);
  void native; void state; void refs;
  return (<section class={mergeStyles(styles.root)}>{props.icon ?? undefined}{props.title}{props.description ?? undefined}{props.contents ?? undefined}</section>);
}

export default Empty;
