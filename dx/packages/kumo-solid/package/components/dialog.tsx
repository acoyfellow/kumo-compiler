import { splitProps } from "solid-js";
import { Portal } from "solid-js/web";
import type { JSX } from "solid-js";

export interface DialogProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export const modelDigest = "b69b28139a711d8e96dd6ddf236811e0a1c5d9510c961808f6912e09a2d48997";
const styles: Record<string, string> = {"root":"root","fixed inset-0 bg-kumo-recessed opacity-80":"fixed inset-0 bg-kumo-recessed opacity-80","fixed top-1/2 left-1/2":"fixed top-1/2 left-1/2","max-w-[calc(100vw-2rem)]":"max-w-[calc(100vw-2rem)]","rounded-xl bg-kumo-base text-kumo-default":"rounded-xl bg-kumo-base text-kumo-default","shadow-m ring ring-kumo-line":"shadow-m ring ring-kumo-line","sm:min-w-96":"sm:min-w-96","min-w-72":"min-w-72","min-w-[32rem]":"min-w-[32rem]","min-w-[48rem]":"min-w-[48rem]"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Dialog(incoming: DialogProps): JSX.Element {
  const props = Object.assign({}, incoming);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as DialogProps & Record<string, unknown>, []);
  void native; void state; void refs;
  return (<Portal mount={resolvePortalTarget("document-body")} children={<><div data-kumo-compound={"dialog"}><div data-kumo-part={"dialog"}>{(props.dialog as JSX.Element) ?? undefined}</div></div></>} />);
}

export default Dialog;
