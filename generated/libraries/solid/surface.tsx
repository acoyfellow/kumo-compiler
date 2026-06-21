import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface SurfaceProps extends Record<string, unknown> { children?: JSX.Element; fixture?: unknown; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "97e129f5f9aa52214f84f0d93a19fcda29a6305d79efd2606f3f30e12129fcda";
export const semanticVariantDigests = {"default":"4441c41c07410c7e20f820d8180d29bc4fa68fb41f9ec635bcc641391f687b4b","as-section":"308e0794f759650df3841b6d3e8260c5277c3b302bc9c17b2cac90eb36457489"} as const;
const styles: Record<string, string> = {"root":"root","overflow-visible":"overflow-visible","rounded-none":"rounded-none"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const fixtureText = (value: any): string => value && typeof value === "object" ? String(typeof value.text === "string" ? value.text : "") + (Array.isArray(value.children) ? value.children.map(fixtureText).join("") : "") : "";
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Surface(incoming: SurfaceProps): JSX.Element {
  const props = Object.assign({"color":"primary"}, incoming);
  const fixture = props.fixture;
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as SurfaceProps & Record<string, unknown>, []);
  void native; void state; void refs;
  if (Object.prototype.hasOwnProperty.call(props, "as") && semanticEqual(props.as, "section") && Object.prototype.hasOwnProperty.call(props, "children") && semanticEqual(props.children, "Card") && Object.prototype.hasOwnProperty.call(props, "color") && semanticEqual(props.color, "secondary")) return (<section data-surface-color={"secondary"} data-deprecated={"surface"}>{props.children}</section>);
  if (Object.prototype.hasOwnProperty.call(props, "children") && semanticEqual(props.children, "Card")) return (<div data-surface-color={"primary"} data-deprecated={"surface"}>{props.children}</div>);
  return (<div class={mergeStyles(styles.root)}>{props.children}</div>);
}

export default Surface;
