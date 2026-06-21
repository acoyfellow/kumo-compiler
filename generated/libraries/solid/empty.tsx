import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface EmptyProps extends Record<string, unknown> { children?: JSX.Element; fixture?: unknown; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "3eb165ee4cd0c36a4801de0d3b7033b2b1e38093487faf0063ab0ae16fd257f2";
export const semanticVariantDigests = {"minimal":"fac6cc210e864da2dd8e1aefab71c1261c24df86ace2fe3bc85a3cac59f2cce4"} as const;
const styles: Record<string, string> = {"root":"root","flex":"flex","w-full":"w-full","flex-col":"flex-col","items-center":"items-center"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const fixtureText = (value: any): string => value && typeof value === "object" ? String(typeof value.text === "string" ? value.text : "") + (Array.isArray(value.children) ? value.children.map(fixtureText).join("") : "") : "";
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Empty(incoming: EmptyProps): JSX.Element {
  const props = Object.assign({"size":"base"}, incoming);
  const fixture = props.fixture;
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as EmptyProps & Record<string, unknown>, []);
  void native; void state; void refs;
  if (Object.prototype.hasOwnProperty.call(props, "title") && semanticEqual(props.title, "No results")) return (<div class="px-10 py-16 gap-6"><h2>{(props.title as any)}</h2></div>);
  return (<section class={mergeStyles(styles.root)}>{(props.icon as JSX.Element) ?? undefined}{(props.title as any)}{(props.description as JSX.Element) ?? undefined}{(props.contents as JSX.Element) ?? undefined}</section>);
}

export default Empty;
