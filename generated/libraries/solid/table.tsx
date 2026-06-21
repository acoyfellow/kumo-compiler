import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface TableProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export const modelDigest = "9d4b8d811da622ddf7ca92cd6b3f7e4f76e0d35094bab50ce0d03c2e4bde88ba";
const styles: Record<string, string> = {"root":"root","isolate":"isolate","w-full":"w-full","text-left":"text-left"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Table(incoming: TableProps): JSX.Element {
  const props = Object.assign({"layout":"auto"}, incoming);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as TableProps & Record<string, unknown>, []);
  void native; void state; void refs;
  return (<table class={mergeStyles(styles.root)}>{props.children}</table>);
}

export default Table;
