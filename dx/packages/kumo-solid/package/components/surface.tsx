import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface SurfaceProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export const modelDigest = "ce6505b3ce28964f1d8bb565e8a04a6c23ab186f8a5afc3a83dc631e65c3914e";
const styles: Record<string, string> = {"root":"root","overflow-visible":"overflow-visible","rounded-none":"rounded-none"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Surface(incoming: SurfaceProps): JSX.Element {
  const props = Object.assign({"color":"primary"}, incoming);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as SurfaceProps & Record<string, unknown>, []);
  void native; void state; void refs;
  return (<div class={mergeStyles(styles.root)}>{props.children}</div>);
}

export default Surface;
