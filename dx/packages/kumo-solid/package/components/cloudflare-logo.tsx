import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface CloudflareLogoProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "50b2371be89b11ae83917c42fdb9b67c42df8467c98e2668e0540afd07dc8c58";
const styles: Record<string, string> = {"root":"root"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function CloudflareLogo(incoming: CloudflareLogoProps): JSX.Element {
  const props = Object.assign({"color":"color","variant":"full"}, incoming);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as CloudflareLogoProps & Record<string, unknown>, []);
  void native; void state; void refs;
  return (<svg role={"img"} aria-label={"Cloudflare"} class={mergeStyles(styles.root)}></svg>);
}

export default CloudflareLogo;
