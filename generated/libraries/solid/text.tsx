import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface TextProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "60219ad3fa185b8a9db3e82cc4fc77b1b0683b2881bcf6b0460646bb320e67c2";
const styles: Record<string, string> = {"root":"root","text-kumo-default":"text-kumo-default","text-base":"text-base"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Text(incoming: TextProps): JSX.Element {
  const props = Object.assign({"bold":false,"size":"base","truncate":false,"variant":"body"}, incoming);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as TextProps & Record<string, unknown>, []);
  void native; void state; void refs;
  return (<span class={mergeStyles(styles.root)}>{props.children}</span>);
}

export default Text;
