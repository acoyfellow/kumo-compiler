import { splitProps } from "solid-js";
import { Portal } from "solid-js/web";
import type { JSX } from "solid-js";

export interface DialogProps extends Record<string, unknown> { children?: JSX.Element; fixture?: unknown; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "d9106fef28eec8fbdea97663c79744245f389ee2104f8b09f88cbb8c08389312";
export const semanticVariantDigests = {} as const;
const styles: Record<string, string> = {"root":"root","fixed inset-0 bg-kumo-recessed opacity-80":"fixed inset-0 bg-kumo-recessed opacity-80","fixed top-1/2 left-1/2":"fixed top-1/2 left-1/2","max-w-[calc(100vw-2rem)]":"max-w-[calc(100vw-2rem)]","rounded-xl bg-kumo-base text-kumo-default":"rounded-xl bg-kumo-base text-kumo-default","shadow-m ring ring-kumo-line":"shadow-m ring ring-kumo-line","sm:min-w-96":"sm:min-w-96","min-w-72":"min-w-72","min-w-[32rem]":"min-w-[32rem]","min-w-[48rem]":"min-w-[48rem]"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const fixtureText = (value: any): string => value && typeof value === "object" ? String(typeof value.text === "string" ? value.text : "") + (Array.isArray(value.children) ? value.children.map(fixtureText).join("") : "") : "";
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Dialog(incoming: DialogProps): JSX.Element {
  const props = Object.assign({}, incoming);
  const fixture = props.fixture;
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as DialogProps & Record<string, unknown>, []);
  void native; void state; void refs;
  return (<Portal mount={resolvePortalTarget("document-body")} children={<><div data-kumo-compound={"dialog"}><div data-kumo-part={"dialog"}>{(props.dialog as JSX.Element) ?? undefined}</div></div></>} />);
}

export function DialogClose(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Close">{local.children}</div>;
}

export function DialogDescription(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Description">{local.children}</div>;
}

export function DialogRoot(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Root">{local.children}</div>;
}

export function DialogTitle(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Title">{local.children}</div>;
}

export function DialogTrigger(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Trigger">{local.children}</div>;
}

Object.defineProperty(Dialog, "Close", {value:DialogClose, enumerable:true});
Object.defineProperty(Dialog, "Description", {value:DialogDescription, enumerable:true});
Object.defineProperty(Dialog, "Root", {value:DialogRoot, enumerable:true});
Object.defineProperty(Dialog, "Title", {value:DialogTitle, enumerable:true});
Object.defineProperty(Dialog, "Trigger", {value:DialogTrigger, enumerable:true});

export default Dialog;
