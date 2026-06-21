import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface BadgeProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export const modelDigest = "67f224503fcce1b354d3848ac5a55b55587789af9fe0688a4849fef4ad5c8ec5";
const styles: Record<string, string> = {"root":"root","inline-flex":"inline-flex","rounded-full":"rounded-full","px-2":"px-2","py-0.5":"py-0.5","text-xs":"text-xs","font-medium":"font-medium"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Badge(incoming: BadgeProps): JSX.Element {
  const props = Object.assign({"appearance":"filled","variant":"primary"}, incoming);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as BadgeProps & Record<string, unknown>, []);
  void native; void state; void refs;
  return (<span class={mergeStyles(styles.root)}>{props.children}</span>);
}

export default Badge;
