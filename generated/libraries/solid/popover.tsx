import { splitProps } from "solid-js";
import { Portal } from "solid-js/web";
import type { JSX } from "solid-js";

export interface PopoverProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export const modelDigest = "7ba76baf0b210a7f5fcc8c192377afd244248598bb69b0a67e5d03b53c7fb59a";
const styles: Record<string, string> = {"root":"root","data-kumo-component=Popover":"data-kumo-component=Popover","data-kumo-part=trigger":"data-kumo-part=trigger","data-starting-style":"data-starting-style","data-ending-style":"data-ending-style","origin-[var(--transform-origin)]":"origin-[var(--transform-origin)]"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Popover(incoming: PopoverProps): JSX.Element {
  const props = Object.assign({}, incoming);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as PopoverProps & Record<string, unknown>, []);
  void native; void state; void refs;
  return (<Portal mount={resolvePortalTarget("document-body")} children={<><div data-kumo-compound={"popover"}><div data-kumo-part={"popover"}>{(props.popover as JSX.Element) ?? undefined}</div></div></>} />);
}

export default Popover;
