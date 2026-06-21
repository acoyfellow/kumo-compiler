import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface CheckboxProps extends Record<string, unknown> { children?: JSX.Element; fixture?: unknown; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "9bed87c38c3dc76bca19c327b60bc4264efc797aacdce1a4e06e08b722ca4c65";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
export const semanticVariantDigests = {} as const;
const styles: Record<string, string> = {"root":"root","data-[checked]":"data-[checked]","data-[indeterminate]":"data-[indeterminate]"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const fixtureText = (value: any): string => value && typeof value === "object" ? String(typeof value.text === "string" ? value.text : "") + (Array.isArray(value.children) ? value.children.map(fixtureText).join("") : "") : "";
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Checkbox(incoming: CheckboxProps): JSX.Element {
  const props = Object.assign({"checked":false,"disabled":false,"indeterminate":false}, incoming);
  const fixture = props.fixture;
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as CheckboxProps & Record<string, unknown>, []);
  void native; void state; void refs;
  return (<input class={mergeStyles(styles.root)}></input>);
}

export default Checkbox;
