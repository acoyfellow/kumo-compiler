import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface DropdownMenuProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export const modelDigest = "067c8530a8b7c49b56d39fe9649b03d5a722ce64bb0b9bc7226a6296da3b6f18";
const styles: Record<string, string> = {"root":"root","data-highlighted":"data-highlighted","data-disabled":"data-disabled","data-popup-open":"data-popup-open","data-starting-style":"data-starting-style","data-ending-style":"data-ending-style","text-kumo-danger":"text-kumo-danger"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function DropdownMenu(incoming: DropdownMenuProps): JSX.Element {
  const props = Object.assign({}, incoming);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as DropdownMenuProps & Record<string, unknown>, []);
  void native; void state; void refs;
  return (<div data-kumo-compound={"dropdown-menu"}><div data-kumo-part={"root"}>{props.root ?? undefined}</div><div data-kumo-part={"collection"}>{props.collection ?? undefined}</div></div>);
}

export default DropdownMenu;
