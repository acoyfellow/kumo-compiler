import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface InputAreaProps extends Record<string, unknown> { children?: JSX.Element; fixture?: unknown; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "2e8146a491bf214e4202760c439b7eee5387f7a70659b1d59e47e7d294f9b6ad";
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
