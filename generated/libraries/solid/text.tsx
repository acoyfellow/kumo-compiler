import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface TextProps extends Record<string, unknown> { children?: JSX.Element; fixture?: unknown; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "b43b5e1bb2be788df24923252d5d5a7d7bba401db07c6baf521a7152442e2f45";
export const semanticVariantDigests = {"body-default":"b244946da5cf1ff8c2da4897816a693bd86ba446ddee8fd243b808df762f8530","mono-default":"2691e5670a1dd583467defa6638eb39245c0a19c3318ec29eb941ec2dad82e3d","heading-element":"7ef7a82cbde4f5297024684169079d5c2e336107de762719500223ba34f9ee19"} as const;
const styles: Record<string, string> = {"root":"root","text-kumo-default":"text-kumo-default","text-base":"text-base"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const fixtureText = (value: any): string => value && typeof value === "object" ? String(typeof value.text === "string" ? value.text : "") + (Array.isArray(value.children) ? value.children.map(fixtureText).join("") : "") : "";
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Text(incoming: TextProps): JSX.Element {
  const props = Object.assign({"bold":false,"size":"base","truncate":false,"variant":"body"}, incoming);
  const fixture = props.fixture;
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as TextProps & Record<string, unknown>, []);
  void native; void state; void refs;
  if (Object.prototype.hasOwnProperty.call(props, "as") && semanticEqual(props.as, "h1") && Object.prototype.hasOwnProperty.call(props, "children") && semanticEqual(props.children, "Title") && Object.prototype.hasOwnProperty.call(props, "variant") && semanticEqual(props.variant, "heading1")) return (<h1 class="text-3xl font-semibold">{props.children}</h1>);
  if (Object.prototype.hasOwnProperty.call(props, "children") && semanticEqual(props.children, "code") && Object.prototype.hasOwnProperty.call(props, "variant") && semanticEqual(props.variant, "mono")) return (<span class="font-mono text-sm">{props.children}</span>);
  if (Object.prototype.hasOwnProperty.call(props, "children") && semanticEqual(props.children, "Body")) return (<p class="text-kumo-default text-base">{props.children}</p>);
  return (<span class={mergeStyles(styles.root)}>{props.children}</span>);
}

export default Text;
