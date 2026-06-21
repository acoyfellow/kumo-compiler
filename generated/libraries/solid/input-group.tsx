import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface InputGroupProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export const modelDigest = "0edcb3b93ae1bc7dcc9649eb23cbe160e99dff83a87d6a697762a867141a58a8";
const styles: Record<string, string> = {"root":"root"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function InputGroup(incoming: InputGroupProps): JSX.Element {
  const props = Object.assign({}, incoming);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as InputGroupProps & Record<string, unknown>, ["observable"]);
  void native; void state; void refs;
  return (<input-group class={mergeStyles(styles.root)}></input-group>);
}

export default InputGroup;
