import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface TableOfContentsProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export const modelDigest = "e48b4239cfca5e769df53ef328dfaf3f910bf892b503c032b84e02002bb57789";
const styles: Record<string, string> = {"root":"root","flex flex-col gap-2 border-l-2 border-kumo-hairline":"flex flex-col gap-2 border-l-2 border-kumo-hairline","block w-full truncate border-l-2 border-transparent py-0.5 pl-4 text-sm text-left no-underline":"block w-full truncate border-l-2 border-transparent py-0.5 pl-4 text-sm text-left no-underline","border-kumo-brand font-medium text-kumo-default":"border-kumo-brand font-medium text-kumo-default"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function TableOfContents(incoming: TableOfContentsProps): JSX.Element {
  const props = Object.assign({}, incoming);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as TableOfContentsProps & Record<string, unknown>, []);
  void native; void state; void refs;
  return (<div data-kumo-compound={"table-of-contents"}><div data-kumo-part={"root"}>{(props.root as JSX.Element) ?? undefined}</div><div data-kumo-part={"collection"}>{(props.collection as JSX.Element) ?? undefined}</div></div>);
}

export default TableOfContents;
