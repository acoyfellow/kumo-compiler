import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface RadioProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export const modelDigest = "0f71542a2bd3b8e5809f5dbb979a7fe2448e19e4f007cced41a22cbc5ef4cba9";
const styles: Record<string, string> = {"root":"root","rounded-full":"rounded-full","data-[checked]":"data-[checked]"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Radio(incoming: RadioProps): JSX.Element {
  const props = Object.assign({"orientation":"vertical"}, incoming);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as RadioProps & Record<string, unknown>, []);
  void native; void state; void refs;
  return (<div data-kumo-compound={"radio"}><div data-kumo-part={"root"}>{(props.root as JSX.Element) ?? undefined}</div><div data-kumo-part={"collection"}>{(props.collection as JSX.Element) ?? undefined}</div></div>);
}

export default Radio;
