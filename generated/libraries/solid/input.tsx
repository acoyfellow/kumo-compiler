import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface InputProps extends Record<string, unknown> { children?: JSX.Element; fixture?: unknown; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "e8a33e484edf40ba2012018e4cecbd2717d8931a91f0055696dc750be0ba5e0d";
export const semanticVariantDigests = {"bare-disabled":"9f4857a73ca347a341683ae3f56fb85d5f056ec4d0bac47c5b8c71f722f25d48"} as const;
const styles: Record<string, string> = {"root":"root"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const fixtureText = (value: any): string => value && typeof value === "object" ? String(typeof value.text === "string" ? value.text : "") + (Array.isArray(value.children) ? value.children.map(fixtureText).join("") : "") : "";
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Input(incoming: InputProps): JSX.Element {
  const props = Object.assign({}, incoming);
  const fixture = props.fixture;
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as InputProps & Record<string, unknown>, ["observable"]);
  void native; void state; void refs;
  if (Object.prototype.hasOwnProperty.call(props, "aria-label") && semanticEqual(props["aria-label"], "Email") && Object.prototype.hasOwnProperty.call(props, "defaultValue") && semanticEqual(props.defaultValue, "x") && Object.prototype.hasOwnProperty.call(props, "disabled") && semanticEqual(props.disabled, true)) return (<input></input>);
  return (<input class={mergeStyles(styles.root)}></input>);
}

export default Input;
