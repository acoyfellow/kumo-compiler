import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface BannerProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export const modelDigest = "c5e7d6281fea509e18399d83a7768d4533db188cdb59ddc8cbf2f1bd99e0dec1";
const styles: Record<string, string> = {"root":"root","flex":"flex","w-full":"w-full","items-start":"items-start","gap-3":"gap-3","rounded-lg":"rounded-lg"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Banner(incoming: BannerProps): JSX.Element {
  const props = Object.assign({"variant":"default"}, incoming);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as BannerProps & Record<string, unknown>, []);
  void native; void state; void refs;
  return (<section class={mergeStyles(styles.root)}>{(props.icon as JSX.Element) ?? undefined}{(props.title as any)}{(props.description as JSX.Element) ?? undefined}{(props.action as JSX.Element) ?? undefined}{props.children}</section>);
}

export default Banner;
