import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface TableProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "2a86761805e0e78f84a2b578b9b43656181ffd9f47ad91f4c17c81f6977c99c7";
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

export function TableBody(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Body">{local.children}</div>;
}

export function TableCell(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Cell">{local.children}</div>;
}

export function TableHead(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Head">{local.children}</div>;
}

export function TableHeader(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Header">{local.children}</div>;
}

export function TableRow(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Row">{local.children}</div>;
}

Object.defineProperty(Table, "Body", {value:TableBody, enumerable:true});
Object.defineProperty(Table, "Cell", {value:TableCell, enumerable:true});
Object.defineProperty(Table, "Head", {value:TableHead, enumerable:true});
Object.defineProperty(Table, "Header", {value:TableHeader, enumerable:true});
Object.defineProperty(Table, "Row", {value:TableRow, enumerable:true});

export default Table;
