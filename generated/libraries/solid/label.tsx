import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface LabelProps extends Record<string, unknown> { children?: JSX.Element; fixture?: unknown; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "3d765f829aeb9964c3c718b42b20afd269c566c27a0250fbf669826b3564b1e9";
export const semanticVariantDigests = {"default":"c524128c24125acceb5de81fecf2ea71a750dfde1b4bbe4e95d2b7b7400d07ba","optional":"d87059331137a9a04142c68aceaccabe92317b4092692a0ca1448f5e96db52dd","as-content":"9b3e9b27098c001394df18c124e9969711d7417464cb9725396ad912311eef3d"} as const;
const styles: Record<string, string> = {"root":"root","m-0":"m-0","text-base":"text-base","font-medium":"font-medium","text-kumo-default":"text-kumo-default","inline-flex":"inline-flex","items-center":"items-center","gap-1":"gap-1"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const fixtureText = (value: any): string => value && typeof value === "object" ? String(typeof value.text === "string" ? value.text : "") + (Array.isArray(value.children) ? value.children.map(fixtureText).join("") : "") : "";
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Label(incoming: LabelProps): JSX.Element {
  const props = Object.assign({"asContent":false,"showOptional":false}, incoming);
  const fixture = props.fixture;
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as LabelProps & Record<string, unknown>, []);
  void native; void state; void refs;
  if (Object.prototype.hasOwnProperty.call(props, "children") && semanticEqual(props.children, "Middle Name") && Object.prototype.hasOwnProperty.call(props, "showOptional") && semanticEqual(props.showOptional, true)) return (<label><span class="font-normal text-kumo-subtle"></span>{"Middle Name(optional)"}</label>);
  if (Object.prototype.hasOwnProperty.call(props, "asContent") && semanticEqual(props.asContent, true) && Object.prototype.hasOwnProperty.call(props, "children") && semanticEqual(props.children, "Email")) return (<span>{props.children}</span>);
  if (Object.prototype.hasOwnProperty.call(props, "children") && semanticEqual(props.children, "Email")) return (<label>{props.children}</label>);
  return (<label class={mergeStyles(styles.root)}>{props.children}</label>);
}

export default Label;
