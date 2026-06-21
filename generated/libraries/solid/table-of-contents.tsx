import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface TableOfContentsProps extends Record<string, unknown> { children?: JSX.Element; fixture?: unknown; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "81f51f73fcb15fac9412c9a30a06ea03f1e2fa2292ec5b6197d72c106554a466";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
export const semanticVariantDigests = {"static-title-items":"2c340de436cabfd4624765e93ce8d80d91469a0f0c64e8492aacf42165197f08","nested-linked-group":"d46be6fd1882b7d21df1e064de09325ce1bd8b535fe3d2b069a9dc356d2c4625"} as const;
const styles: Record<string, string> = {"root":"root","flex flex-col gap-2 border-l-2 border-kumo-hairline":"flex flex-col gap-2 border-l-2 border-kumo-hairline","block w-full truncate border-l-2 border-transparent py-0.5 pl-4 text-sm text-left no-underline":"block w-full truncate border-l-2 border-transparent py-0.5 pl-4 text-sm text-left no-underline","border-kumo-brand font-medium text-kumo-default":"border-kumo-brand font-medium text-kumo-default"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const fixtureText = (value: any): string => value && typeof value === "object" ? String(typeof value.text === "string" ? value.text : "") + (Array.isArray(value.children) ? value.children.map(fixtureText).join("") : "") : "";
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function TableOfContents(incoming: TableOfContentsProps): JSX.Element {
  const props = Object.assign({}, incoming);
  const fixture = props.fixture;
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as TableOfContentsProps & Record<string, unknown>, []);
  void native; void state; void refs;
  if (semanticEqual(fixture, {"export":"root","props":{"aria-label":"Article sections"},"children":[{"export":".Title","props":{},"children":[{"text":"On this page"}]},{"export":".List","props":{},"children":[{"export":".Item","props":{"href":"#intro","active":true},"children":[{"text":"Introduction"}]},{"export":".Item","props":{"href":"#install"},"children":[{"text":"Installation"}]}]}]})) return (<nav aria-label={"Article sections"}><p>{"On this page"}</p><ul></ul><a></a><a></a></nav>);
  if (semanticEqual(fixture, {"export":"root","props":{},"children":[{"export":".List","props":{},"children":[{"export":".Group","props":{"label":"Getting started","href":"#getting-started","active":true},"children":[{"export":".Item","props":{"href":"#install"},"children":[{"text":"Install"}]},{"export":".Item","props":{"href":"#setup"},"children":[{"text":"Setup"}]}]}]}]})) return (<nav aria-label={"Table of contents"}><ul></ul><li></li><li></li><a></a><a></a><a></a></nav>);
  return (<div data-kumo-compound={"table-of-contents"}><div data-kumo-part={"root"}>{(props.root as JSX.Element) ?? undefined}</div><div data-kumo-part={"collection"}>{(props.collection as JSX.Element) ?? undefined}</div></div>);
}

export function TableOfContentsGroup(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Group">{local.children}</div>;
}

export function TableOfContentsItem(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Item">{local.children}</div>;
}

export function TableOfContentsList(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="List">{local.children}</div>;
}

export function TableOfContentsTitle(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Title">{local.children}</div>;
}

Object.defineProperty(TableOfContents, "Group", {value:TableOfContentsGroup, enumerable:true});
Object.defineProperty(TableOfContents, "Item", {value:TableOfContentsItem, enumerable:true});
Object.defineProperty(TableOfContents, "List", {value:TableOfContentsList, enumerable:true});
Object.defineProperty(TableOfContents, "Title", {value:TableOfContentsTitle, enumerable:true});

export default TableOfContents;
