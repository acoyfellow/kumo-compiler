import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface InputAreaProps extends Record<string, unknown> { children?: JSX.Element; fixture?: unknown; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "3f2ca47762723bd72e47c5da8490058c226bbee67e5518d548fc19ba2c467f14";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
export const semanticVariantDigests = {"bare":"ebf5bf8b27301ff66eaf323b56e6a9ac48972ee15edb2d88ae114e04d29c04cd"} as const;
const styles: Record<string, string> = {"root":"root"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const fixtureText = (value: any): string => value && typeof value === "object" ? String(typeof value.text === "string" ? value.text : "") + (Array.isArray(value.children) ? value.children.map(fixtureText).join("") : "") : "";
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function InputArea(incoming: InputAreaProps): JSX.Element {
  const props = Object.assign({}, incoming);
  const fixture = props.fixture;
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as InputAreaProps & Record<string, unknown>, ["observable"]);
  void native; void state; void refs;
  if (Object.prototype.hasOwnProperty.call(props, "aria-label") && semanticEqual(props["aria-label"], "Notes") && Object.prototype.hasOwnProperty.call(props, "defaultValue") && semanticEqual(props.defaultValue, "hello")) return (<textarea></textarea>);
  return (<textarea class={mergeStyles(styles.root)}></textarea>);
}

export default InputArea;
