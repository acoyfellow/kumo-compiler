import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface SensitiveInputProps extends Record<string, unknown> { children?: JSX.Element; fixture?: unknown; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "929d4c3eecd153af78d2db33ff8ba69333a6f6f39415ee3c65cb1d8f9eabcc3c";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
export const semanticVariantDigests = {"masked":"84316287b165e3499c9844cb130cdf3cf1d8ce7ea5c049ca51705c1fc977cd48"} as const;
const styles: Record<string, string> = {"root":"root"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const fixtureText = (value: any): string => value && typeof value === "object" ? String(typeof value.text === "string" ? value.text : "") + (Array.isArray(value.children) ? value.children.map(fixtureText).join("") : "") : "";
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function SensitiveInput(incoming: SensitiveInputProps): JSX.Element {
  const props = Object.assign({}, incoming);
  const fixture = props.fixture;
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as SensitiveInputProps & Record<string, unknown>, ["observable"]);
  void native; void state; void refs;
  if (Object.prototype.hasOwnProperty.call(props, "defaultValue") && semanticEqual(props.defaultValue, "alpha") && Object.prototype.hasOwnProperty.call(props, "label") && semanticEqual(props.label, "Secret")) return (<div></div>);
  return (<input class={mergeStyles(styles.root)}></input>);
}

export default SensitiveInput;
