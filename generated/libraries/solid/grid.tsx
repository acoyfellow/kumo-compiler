import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface GridProps extends Record<string, unknown> { children?: JSX.Element; fixture?: unknown; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "8f448ea59addb5dd51bd78ec2a05ab79f2a82c9fa87807bd2a6621cf54efe3c4";
export const semanticVariantDigests = {"three-up":"1d4ad816e0831f232c9946096131c941667811621348ced2bee375a7e44fe429","side-none":"4a534e8926dd3df51c47a717b766f52022b617de627fb0da56db1f5d96740503"} as const;
const styles: Record<string, string> = {"root":"root","grid":"grid"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const fixtureText = (value: any): string => value && typeof value === "object" ? String(typeof value.text === "string" ? value.text : "") + (Array.isArray(value.children) ? value.children.map(fixtureText).join("") : "") : "";
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Grid(incoming: GridProps): JSX.Element {
  const props = Object.assign({"gap":"base"}, incoming);
  const fixture = props.fixture;
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as GridProps & Record<string, unknown>, []);
  void native; void state; void refs;
  if (Object.prototype.hasOwnProperty.call(props, "children") && semanticEqual(props.children, "Two") && Object.prototype.hasOwnProperty.call(props, "gap") && semanticEqual(props.gap, "none") && Object.prototype.hasOwnProperty.call(props, "variant") && semanticEqual(props.variant, "side-by-side")) return (<div class="grid-cols-2 gap-0">{props.children}</div>);
  if (Object.prototype.hasOwnProperty.call(props, "children") && semanticEqual(props.children, "Cells") && Object.prototype.hasOwnProperty.call(props, "variant") && semanticEqual(props.variant, "3up")) return (<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">{props.children}</div>);
  return (<div class={mergeStyles(styles.root)}>{props.children}</div>);
}

export default Grid;
