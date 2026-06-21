import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface RadioProps extends Record<string, unknown> { children?: JSX.Element; fixture?: unknown; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "4efcd54ca7258cd0bde1f6ad79805d243b1b2c254fee4dda0b4635452d3971e9";
export const semanticVariantDigests = {} as const;
const styles: Record<string, string> = {"root":"root","rounded-full":"rounded-full","data-[checked]":"data-[checked]"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const fixtureText = (value: any): string => value && typeof value === "object" ? String(typeof value.text === "string" ? value.text : "") + (Array.isArray(value.children) ? value.children.map(fixtureText).join("") : "") : "";
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Radio(incoming: RadioProps): JSX.Element {
  const props = Object.assign({"orientation":"vertical"}, incoming);
  const fixture = props.fixture;
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as RadioProps & Record<string, unknown>, []);
  void native; void state; void refs;
  return (<div data-kumo-compound={"radio"}><div data-kumo-part={"root"}>{(props.root as JSX.Element) ?? undefined}</div><div data-kumo-part={"collection"}>{(props.collection as JSX.Element) ?? undefined}</div></div>);
}

export default Radio;
