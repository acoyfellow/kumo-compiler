import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface LayerCardProps extends Record<string, unknown> { children?: JSX.Element; fixture?: unknown; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "fd939af05201967cffd0c170320971fa78ceaf75165af48a02a704e5594b7f38";
export const semanticVariantDigests = {"simple":"a499a4590b2889a399fb37ec1aea23b834bd37a9decc081349d87104441126a5","layered":"bdf1e0064642e5030741e7e6b3cfbefc3cb01d9355b221061e54ad98f1d48d10"} as const;
const styles: Record<string, string> = {"root":"root","overflow-hidden":"overflow-hidden","rounded-lg":"rounded-lg"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const fixtureText = (value: any): string => value && typeof value === "object" ? String(typeof value.text === "string" ? value.text : "") + (Array.isArray(value.children) ? value.children.map(fixtureText).join("") : "") : "";
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function LayerCard(incoming: LayerCardProps): JSX.Element {
  const props = Object.assign({}, incoming);
  const fixture = props.fixture;
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as LayerCardProps & Record<string, unknown>, []);
  void native; void state; void refs;
  if (Object.prototype.hasOwnProperty.call(props, "children") && semanticEqual(props.children, "Card")) return (<div class="bg-kumo-base shadow-xs ring-kumo-line">{props.children}</div>);
  if (semanticEqual(fixture, {"export":"root","props":{},"children":[{"export":".Secondary","props":{},"children":[{"text":"Top"}]},{"export":".Primary","props":{},"children":[{"text":"Main"}]}]})) return (<div class="bg-kumo-elevated ring-kumo-hairline"><div></div><div></div>{fixtureText(fixture)}</div>);
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
