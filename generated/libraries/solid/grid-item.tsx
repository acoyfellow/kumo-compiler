import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface GridItemProps extends Record<string, unknown> { children?: JSX.Element; fixture?: unknown; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "731f046cabfca2ddc6ca5d3fffd4bc0eb020042258529b47b51be3c350d1cb1c";
export const semanticVariantDigests = {"default":"51c1d321c43ffacdda6bd6fc684748b42dfba6453c77469911a835a6971f221c","custom-class":"fae0126eee9399750e209d30c90d71037d08b2d983b07c536fe81384697adc57"} as const;
const styles: Record<string, string> = {"root":"root"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const fixtureText = (value: any): string => value && typeof value === "object" ? String(typeof value.text === "string" ? value.text : "") + (Array.isArray(value.children) ? value.children.map(fixtureText).join("") : "") : "";
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function GridItem(incoming: GridItemProps): JSX.Element {
  const props = Object.assign({}, incoming);
  const fixture = props.fixture;
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as GridItemProps & Record<string, unknown>, []);
  void native; void state; void refs;
  if (Object.prototype.hasOwnProperty.call(props, "children") && semanticEqual(props.children, "Cell") && Object.prototype.hasOwnProperty.call(props, "className") && semanticEqual(props.className, "p-4")) return (<div class="p-4">{props.children}</div>);
  if (Object.prototype.hasOwnProperty.call(props, "children") && semanticEqual(props.children, "Cell")) return (<div>{props.children}</div>);
  return (<div class={mergeStyles(styles.root)}>{props.children}</div>);
}

export default GridItem;
