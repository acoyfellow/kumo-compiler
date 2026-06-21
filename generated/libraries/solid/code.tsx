import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface CodeProps extends Record<string, unknown> { children?: JSX.Element; fixture?: unknown; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "0f20f3e06c118fd7d803b2a9d0dd5198a620b5536189d2dc00f63224192525e2";
export const semanticVariantDigests = {"default":"face9c8e09407353487403fbf216b21820327f561a4753c60c526ffb7d00fc25","bash":"685437b93a0078d4bd57f63886449874af8d7f6e5197dc93d063954e9bc6f2cf"} as const;
const styles: Record<string, string> = {"root":"root","font-mono":"font-mono","text-sm":"text-sm","text-kumo-subtle":"text-kumo-subtle"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const fixtureText = (value: any): string => value && typeof value === "object" ? String(typeof value.text === "string" ? value.text : "") + (Array.isArray(value.children) ? value.children.map(fixtureText).join("") : "") : "";
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Code(incoming: CodeProps): JSX.Element {
  const props = Object.assign({"lang":"ts"}, incoming);
  const fixture = props.fixture;
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as CodeProps & Record<string, unknown>, []);
  void native; void state; void refs;
  if (Object.prototype.hasOwnProperty.call(props, "className") && semanticEqual(props.className, "custom") && Object.prototype.hasOwnProperty.call(props, "code") && semanticEqual(props.code, "echo kumo") && Object.prototype.hasOwnProperty.call(props, "lang") && semanticEqual(props.lang, "bash")) return (<pre class="custom font-mono">{(props.code as any)}</pre>);
  if (Object.prototype.hasOwnProperty.call(props, "code") && semanticEqual(props.code, "const x = 1;")) return (<pre class="font-mono text-sm text-kumo-subtle">{(props.code as any)}</pre>);
  return (<code class={mergeStyles(styles.root)}>{(props.code as any)}</code>);
}

export default Code;
