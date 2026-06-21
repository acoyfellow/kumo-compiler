import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface LayerCardProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "0863b724219652fb6b34a5c3bc5564e8fc766a990f62178c6a66e5f17aa8ae1f";
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

export function LayerCardPrimary(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Primary">{local.children}</div>;
}

export function LayerCardSecondary(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Secondary">{local.children}</div>;
}

Object.defineProperty(LayerCard, "Primary", {value:LayerCardPrimary, enumerable:true});
Object.defineProperty(LayerCard, "Secondary", {value:LayerCardSecondary, enumerable:true});

export default LayerCard;
