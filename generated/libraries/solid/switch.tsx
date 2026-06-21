import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface SwitchProps extends Record<string, unknown> { children?: JSX.Element; fixture?: unknown; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "45b759a0413309448508b145adecd9c95981fecda322f2b7f7443f2d3f5ed3e5";
export const semanticVariantDigests = {"small":"e0811ab839a9cd4a2d610f0a57140eaa69b6d32d30c94b0fff43aac89f46bd28"} as const;
const styles: Record<string, string> = {"root":"root","h-4 w-8":"h-4 w-8","h-4.5 w-9":"h-4.5 w-9","h-5 w-10":"h-5 w-10"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const fixtureText = (value: any): string => value && typeof value === "object" ? String(typeof value.text === "string" ? value.text : "") + (Array.isArray(value.children) ? value.children.map(fixtureText).join("") : "") : "";
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Switch(incoming: SwitchProps): JSX.Element {
  const props = Object.assign({"checked":false,"disabled":false,"size":"base"}, incoming);
  const fixture = props.fixture;
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as SwitchProps & Record<string, unknown>, []);
  void native; void state; void refs;
  if (Object.prototype.hasOwnProperty.call(props, "aria-label") && semanticEqual(props["aria-label"], "Small") && Object.prototype.hasOwnProperty.call(props, "size") && semanticEqual(props.size, "sm")) return (<button role={"switch"} aria-checked={"false"} class="h-4 w-8"></button>);
  return (<button class={mergeStyles(styles.root)}></button>);
}

export default Switch;
