import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface LoaderProps extends Record<string, unknown> { children?: JSX.Element; fixture?: unknown; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "2808be9f1c68f90d7f014f4c97a6080bee5614f559a273bd05ebcc41025ae331";
export const semanticVariantDigests = {"default":"6eb5c75d6fadb5fd6e7a9b6e216e728db8bed43f1734ef1c19efb96b4766cf1e","large-labelled":"163c48e1305118b9b2bc71154f96396b955344e0326a6dcaab28902fbf405547"} as const;
const styles: Record<string, string> = {"root":"root"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const fixtureText = (value: any): string => value && typeof value === "object" ? String(typeof value.text === "string" ? value.text : "") + (Array.isArray(value.children) ? value.children.map(fixtureText).join("") : "") : "";
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Loader(incoming: LoaderProps): JSX.Element {
  const props = Object.assign({"aria-label":"Loading","size":"base"}, incoming);
  const fixture = props.fixture;
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as LoaderProps & Record<string, unknown>, []);
  void native; void state; void refs;
  if (Object.prototype.hasOwnProperty.call(props, "aria-label") && semanticEqual(props["aria-label"], "Working") && Object.prototype.hasOwnProperty.call(props, "size") && semanticEqual(props.size, "lg")) return (<svg role={"status"} aria-label={"Working"}><circle></circle><circle></circle></svg>);
  if (true) return (<svg role={"status"} aria-label={"Loading"} width={"24"} height={"24"}><circle></circle><circle></circle></svg>);
  return (<span role={"status"} aria-label={(props["aria-label"] as any)} class={mergeStyles(styles.root)}></span>);
}

export default Loader;
