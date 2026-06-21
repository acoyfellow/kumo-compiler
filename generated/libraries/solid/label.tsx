import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface LabelProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "a14b8ca4ef389e6247d422e71305289cda06eeb21a5ec5a1f49f196a6cca012f";
const styles: Record<string, string> = {"root":"root","m-0":"m-0","text-base":"text-base","font-medium":"font-medium","text-kumo-default":"text-kumo-default","inline-flex":"inline-flex","items-center":"items-center","gap-1":"gap-1"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Label(incoming: LabelProps): JSX.Element {
  const props = Object.assign({"asContent":false,"showOptional":false}, incoming);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as LabelProps & Record<string, unknown>, []);
  void native; void state; void refs;
  return (<label class={mergeStyles(styles.root)}>{props.children}</label>);
}

export default Label;
