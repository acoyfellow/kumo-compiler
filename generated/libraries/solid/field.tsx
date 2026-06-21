import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface FieldProps extends Record<string, unknown> { children?: JSX.Element; fixture?: unknown; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "6680d3b6e5ef5e85c4340fd8369a05f55c9a388c2bfb7ada7da9eeb0eccd29f3";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
export const semanticVariantDigests = {"optional":"84316287b165e3499c9844cb130cdf3cf1d8ce7ea5c049ca51705c1fc977cd48"} as const;
const styles: Record<string, string> = {"root":"root"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const fixtureText = (value: any): string => value && typeof value === "object" ? String(typeof value.text === "string" ? value.text : "") + (Array.isArray(value.children) ? value.children.map(fixtureText).join("") : "") : "";
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Field(incoming: FieldProps): JSX.Element {
  const props = Object.assign({}, incoming);
  const fixture = props.fixture;
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as FieldProps & Record<string, unknown>, ["observable"]);
  void native; void state; void refs;
  if (semanticEqual(fixture, {"export":"root","props":{"label":"Name","description":"Help","required":false},"children":[{"export":".NativeInput","props":{"id":"field-control"},"children":[]}]})) return (<div></div>);
  return (<div class={mergeStyles(styles.root)} data-kumo-element={"field"}></div>);
}

export function FieldNativeInput(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="NativeInput">{local.children}</div>;
}

Object.defineProperty(Field, "NativeInput", {value:FieldNativeInput, enumerable:true});

export default Field;
