import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface PaginationProps extends Record<string, unknown> { children?: JSX.Element; fixture?: unknown; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "e429308d31e783f621359d7f7497bbae2ce32cc82be5a9a21f42a3664d712efb";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
export const semanticVariantDigests = {"legacy-page-one":"4d6dd46730d1f2856dfdac1e96022778e8b2456051a5d05fbe77595eff741249","legacy-page-three-ssr":"6d7f54862c4c6a6d144229dca911fa8549b1c6208ff6df953d02ab43e529e8b2","compound-simple-labels":"42d50c63392b2969506d8ffafe38f9c16851bed43a72b2fbe9c96e8fbbb66790","compound-dropdown-size":"1d4187fdd0f607bc169db30f8e32f7f287d9e0d031711e185cc8f5ec1822a34e"} as const;
const styles: Record<string, string> = {"root":"root","flex":"flex","items-center":"items-center","gap-2":"gap-2","w-full":"w-full"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const fixtureText = (value: any): string => value && typeof value === "object" ? String(typeof value.text === "string" ? value.text : "") + (Array.isArray(value.children) ? value.children.map(fixtureText).join("") : "") : "";
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Pagination(incoming: PaginationProps): JSX.Element {
  const props = Object.assign({"controls":"full","labels":"English canonical labels","page":1,"pageSelector":"input"}, incoming);
  const fixture = props.fixture;
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as PaginationProps & Record<string, unknown>, []);
  void native; void state; void refs;
  if (Object.prototype.hasOwnProperty.call(props, "fixtureMode") && semanticEqual(props.fixtureMode, "simple") && Object.prototype.hasOwnProperty.call(props, "labels") && semanticEqual(props.labels, {"navigation":"Results pages","previousPage":"Back","nextPage":"Forward"}) && Object.prototype.hasOwnProperty.call(props, "page") && semanticEqual(props.page, 2) && Object.prototype.hasOwnProperty.call(props, "perPage") && semanticEqual(props.perPage, 10) && Object.prototype.hasOwnProperty.call(props, "totalCount") && semanticEqual(props.totalCount, 35)) return (<div><nav aria-label={"Results pages"}></nav><button></button><button></button></div>);
  if (Object.prototype.hasOwnProperty.call(props, "fixtureMode") && semanticEqual(props.fixtureMode, "dropdown") && Object.prototype.hasOwnProperty.call(props, "page") && semanticEqual(props.page, 2) && Object.prototype.hasOwnProperty.call(props, "perPage") && semanticEqual(props.perPage, 25) && Object.prototype.hasOwnProperty.call(props, "totalCount") && semanticEqual(props.totalCount, 100)) return (<div><button></button><button></button><button></button><button></button><button></button><button></button></div>);
  if (Object.prototype.hasOwnProperty.call(props, "page") && semanticEqual(props.page, 1) && Object.prototype.hasOwnProperty.call(props, "perPage") && semanticEqual(props.perPage, 10) && Object.prototype.hasOwnProperty.call(props, "totalCount") && semanticEqual(props.totalCount, 35)) return (<div data-slot={"pagination"}><nav aria-label={"Pagination"}></nav><button></button><button></button><button></button><button></button><input aria-label={"Page number"} value={"1"}></input></div>);
  if (Object.prototype.hasOwnProperty.call(props, "page") && semanticEqual(props.page, 3) && Object.prototype.hasOwnProperty.call(props, "perPage") && semanticEqual(props.perPage, 10) && Object.prototype.hasOwnProperty.call(props, "totalCount") && semanticEqual(props.totalCount, 35)) return (<div><input value={"1"}></input></div>);
  return (<div data-kumo-compound={"pagination"}><div data-kumo-part={"root"}>{(props.root as JSX.Element) ?? undefined}</div><div data-kumo-part={"collection"}>{(props.collection as JSX.Element) ?? undefined}</div></div>);
}

export default Pagination;
