import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface CodeProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export const modelDigest = "5e7c1a6e6d7b7973979fc806a00d8999299a443db7eda7b9234417bc397a0fba";
const styles: Record<string, string> = {"root":"root","font-mono":"font-mono","text-sm":"text-sm","text-kumo-subtle":"text-kumo-subtle"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Code(incoming: CodeProps): JSX.Element {
  const props = Object.assign({"lang":"ts"}, incoming);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as CodeProps & Record<string, unknown>, []);
  void native; void state; void refs;
  return (<code class={mergeStyles(styles.root)}>{(props.code as any)}</code>);
}

export default Code;
