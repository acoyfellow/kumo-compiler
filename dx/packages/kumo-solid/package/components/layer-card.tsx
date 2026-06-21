import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface LayerCardProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export const modelDigest = "c9dad696330b10c952f02f411171c962c2770f5c4b53cf81713d0397ef61abf8";
const styles: Record<string, string> = {"root":"root","overflow-hidden":"overflow-hidden","rounded-lg":"rounded-lg"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function LayerCard(incoming: LayerCardProps): JSX.Element {
  const props = Object.assign({}, incoming);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as LayerCardProps & Record<string, unknown>, []);
  void native; void state; void refs;
  return (<div class={mergeStyles(styles.root)}>{props.children}</div>);
}

export default LayerCard;
