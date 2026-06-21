import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface ToastyProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "96819ff5ff77c94bea48a81f92da6a4857acc3495fbbd3f4eb7703e24db317d6";
const styles: Record<string, string> = {"root":"root","fixed":"fixed","bottom-4":"bottom-4","right-4":"right-4","rounded-lg":"rounded-lg","shadow-lg":"shadow-lg"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Toasty(incoming: ToastyProps): JSX.Element {
  const props = Object.assign({"container":"provider container or document.body","variant":"default"}, incoming);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as ToastyProps & Record<string, unknown>, []);
  void native; void state; void refs;
  return (<div data-kumo-compound={"toasty"}><div data-kumo-part={"root"}>{(props.root as JSX.Element) ?? undefined}</div><div data-kumo-part={"collection"}>{(props.collection as JSX.Element) ?? undefined}</div></div>);
}

export default Toasty;
