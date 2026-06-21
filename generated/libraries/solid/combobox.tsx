import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface ComboboxProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export const modelDigest = "b431b499c0e47a951de0104395b33980461e37f3410131f5ddf2fc8c2223070f";
const styles: Record<string, string> = {"root":"root","bg-kumo-control":"bg-kumo-control","ring-kumo-line":"ring-kumo-line","data-highlighted:bg-kumo-overlay":"data-highlighted:bg-kumo-overlay","data-selected:font-medium":"data-selected:font-medium","w-full px-2 py-1 border-0 bg-inherit":"w-full px-2 py-1 border-0 bg-inherit","flex items-center flex-wrap gap-1.5 flex-1":"flex items-center flex-wrap gap-1.5 flex-1","min-w-[100px]":"min-w-[100px]"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Combobox(incoming: ComboboxProps): JSX.Element {
  const props = Object.assign({}, incoming);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as ComboboxProps & Record<string, unknown>, []);
  void native; void state; void refs;
  return (<div data-kumo-compound={"combobox"}><div data-kumo-part={"root"}>{props.root ?? undefined}</div><div data-kumo-part={"collection"}>{props.collection ?? undefined}</div></div>);
}

export default Combobox;
