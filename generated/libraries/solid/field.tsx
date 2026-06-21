import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface FieldProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "c8c1c62130c1f34d0061c3ea6adadfe4728a10920f9906960684ff48e50325c7";
const styles: Record<string, string> = {"root":"root"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Field(incoming: FieldProps): JSX.Element {
  const props = Object.assign({}, incoming);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as FieldProps & Record<string, unknown>, ["observable"]);
  void native; void state; void refs;
  return (<div class={mergeStyles(styles.root)} data-kumo-element={"field"}></div>);
}

export function FieldNativeInput(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="NativeInput">{local.children}</div>;
}

Object.defineProperty(Field, "NativeInput", {value:FieldNativeInput, enumerable:true});

export default Field;
