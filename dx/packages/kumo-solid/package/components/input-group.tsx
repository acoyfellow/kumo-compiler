import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface InputGroupProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "723d817c6c81e88062ee871968eac6318dc1176c7b9e92c407d7f7a29445d8c3";
const styles: Record<string, string> = {"root":"root"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function InputGroup(incoming: InputGroupProps): JSX.Element {
  const props = Object.assign({}, incoming);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as InputGroupProps & Record<string, unknown>, ["observable"]);
  void native; void state; void refs;
  return (<div class={mergeStyles(styles.root)} data-kumo-element={"input-group"}></div>);
}

export function InputGroupAddon(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Addon">{local.children}</div>;
}

export function InputGroupButton(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Button">{local.children}</div>;
}

export function InputGroupInput(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Input">{local.children}</div>;
}

export function InputGroupSuffix(props: CompoundPartProps): JSX.Element {
  const [local, native] = splitProps(props, ["children"]);
  return <div {...native} data-kumo-part="Suffix">{local.children}</div>;
}

Object.defineProperty(InputGroup, "Addon", {value:InputGroupAddon, enumerable:true});
Object.defineProperty(InputGroup, "Button", {value:InputGroupButton, enumerable:true});
Object.defineProperty(InputGroup, "Input", {value:InputGroupInput, enumerable:true});
Object.defineProperty(InputGroup, "Suffix", {value:InputGroupSuffix, enumerable:true});

export default InputGroup;
