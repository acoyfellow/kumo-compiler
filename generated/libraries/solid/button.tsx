import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface ButtonProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export const modelDigest = "48798c8ab5bf8d756056311749cd7d344b6c82b50134d057656d5f6e4cad48aa";
const styles: Record<string, string> = {"root":"root","group":"group","flex":"flex","w-max":"w-max","h-5":"h-5","h-6.5":"h-6.5","h-9":"h-9","h-10":"h-10","bg-kumo-brand":"bg-kumo-brand","bg-kumo-base":"bg-kumo-base","bg-transparent":"bg-transparent","rounded-full":"rounded-full"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Button(incoming: ButtonProps): JSX.Element {
  const props = Object.assign({"loading":false,"shape":"base","size":"base","variant":"secondary"}, incoming);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as ButtonProps & Record<string, unknown>, ["native"]);
  void native; void state; void refs;
  return (<button class={mergeStyles(styles.root)}></button>);
}

export default Button;
