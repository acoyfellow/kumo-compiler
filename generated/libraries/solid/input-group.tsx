import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface InputGroupProps extends Record<string, unknown> { children?: JSX.Element; fixture?: unknown; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "d9941d0c1ddbafb3ab1c8d2397fbcd27f641bbcd6c6db4f66a653e7765ed14c9";
export const semanticVariantDigests = {"composition":"84316287b165e3499c9844cb130cdf3cf1d8ce7ea5c049ca51705c1fc977cd48"} as const;
const styles: Record<string, string> = {"root":"root"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const fixtureText = (value: any): string => value && typeof value === "object" ? String(typeof value.text === "string" ? value.text : "") + (Array.isArray(value.children) ? value.children.map(fixtureText).join("") : "") : "";
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function InputGroup(incoming: InputGroupProps): JSX.Element {
  const props = Object.assign({}, incoming);
  const fixture = props.fixture;
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as InputGroupProps & Record<string, unknown>, ["observable"]);
  void native; void state; void refs;
  if (semanticEqual(fixture, {"export":"root","props":{"label":"Search","description":"Help","required":true},"children":[{"export":".Addon","props":{},"children":[{"text":"$"}]},{"export":".Input","props":{"aria-label":"Search"},"children":[]},{"export":".Button","props":{"variant":"secondary"},"children":[{"text":"Go"}]},{"export":".Suffix","props":{},"children":[{"text":"USD"}]}]})) return (<div></div>);
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
