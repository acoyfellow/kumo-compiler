import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface InputGroupProps extends Record<string, unknown> { children?: JSX.Element; fixture?: unknown; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "aec5871cdfdf97c938fb06aeb6a15dedd413550ce59bca231f5fe2e61f6d347c";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
export const semanticVariantDigests = {"composition":"84316287b165e3499c9844cb130cdf3cf1d8ce7ea5c049ca51705c1fc977cd48"} as const;
const styles: Record<string, string> = {"root":"root"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const normalizeRenderContent = (value: unknown, accessors = false): string => {
  if (value == null || value === false || value === true) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map(item => normalizeRenderContent(item, accessors)).join("");
  if (accessors && typeof value === "function") return normalizeRenderContent(value(), accessors);
  if (typeof value === "object") { const item = value as {text?: unknown; children?: unknown}; return (typeof item.text === "string" ? item.text : "") + (Array.isArray(item.children) ? item.children.map(child => normalizeRenderContent(child)).join("") : ""); }
  return "";
};
const normalizeFixture = (value: unknown): unknown => Array.isArray(value) ? value.map(normalizeFixture) : value && typeof value === "object" ? Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalizeFixture(item)])) : value;
const fixtureText = (value: unknown): string => normalizeRenderContent(value);
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function InputGroup(incoming: InputGroupProps): JSX.Element {
  const props = Object.assign({}, incoming);
  const fixture = props.fixture;
  const renderContent = normalizeRenderContent(props.children, true);
  const normalizedFixture = normalizeFixture(fixture);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as InputGroupProps & Record<string, unknown>, ["observable"]);
  void native; void state; void refs;
  if (semanticEqual(normalizedFixture, {"export":"root","props":{"label":"Search","description":"Help","required":true},"children":[{"export":".Addon","props":{},"children":[{"text":"$"}]},{"export":".Input","props":{"aria-label":"Search"},"children":[]},{"export":".Button","props":{"variant":"secondary"},"children":[{"text":"Go"}]},{"export":".Suffix","props":{},"children":[{"text":"USD"}]}]})) return (<div></div>);
  return (<div class={mergeStyles(styles.root)} data-kumo-element={"input-group"}></div>);
}

export function InputGroupAddon(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Addon">{local.children}</div>;
}

export function InputGroupButton(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Button">{local.children}</div>;
}

export function InputGroupInput(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Input">{local.children}</div>;
}

export function InputGroupSuffix(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Suffix">{local.children}</div>;
}

Object.defineProperty(InputGroup, "Addon", {value:InputGroupAddon, enumerable:true});
Object.defineProperty(InputGroup, "Button", {value:InputGroupButton, enumerable:true});
Object.defineProperty(InputGroup, "Input", {value:InputGroupInput, enumerable:true});
Object.defineProperty(InputGroup, "Suffix", {value:InputGroupSuffix, enumerable:true});

export default InputGroup;
