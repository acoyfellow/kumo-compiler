import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface MeterProps extends Record<string, unknown> { children?: JSX.Element; fixture?: unknown; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "c6790c453c6528f1fc20c70ef514b1cfe50b977eb4b876ba75060d1cf92efffd";
export const semanticVariantDigests = {"percentage":"c4c772dbf859773aca432276c1644939671936f70dbd45a0f6af9597390b1c21","custom-value":"3e23bcf2fb2bef98b1d76f4fd211094cb71c1e90f9c00fb48903c0017a361ad8","custom-range-hidden":"518555dfb2277bb968b95cd238e0505e731df0327e2a77b5e6d3636a3e4c5119"} as const;
const styles: Record<string, string> = {"root":"root","flex":"flex","w-full":"w-full","flex-col":"flex-col","gap-2":"gap-2"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const fixtureText = (value: any): string => value && typeof value === "object" ? String(typeof value.text === "string" ? value.text : "") + (Array.isArray(value.children) ? value.children.map(fixtureText).join("") : "") : "";
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Meter(incoming: MeterProps): JSX.Element {
  const props = Object.assign({"max":100,"min":0,"showValue":true}, incoming);
  const fixture = props.fixture;
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as MeterProps & Record<string, unknown>, []);
  void native; void state; void refs;
  if (Object.prototype.hasOwnProperty.call(props, "label") && semanticEqual(props.label, "Hidden") && Object.prototype.hasOwnProperty.call(props, "max") && semanticEqual(props.max, 200) && Object.prototype.hasOwnProperty.call(props, "min") && semanticEqual(props.min, 0) && Object.prototype.hasOwnProperty.call(props, "showValue") && semanticEqual(props.showValue, false) && Object.prototype.hasOwnProperty.call(props, "value") && semanticEqual(props.value, 20)) return (<div role={"meter"} aria-valuemax={"200"} aria-valuenow={"20"}><span></span><span></span>{"Hiddenx"}</div>);
  if (Object.prototype.hasOwnProperty.call(props, "customValue") && semanticEqual(props.customValue, "750 / 1,000") && Object.prototype.hasOwnProperty.call(props, "label") && semanticEqual(props.label, "Requests") && Object.prototype.hasOwnProperty.call(props, "value") && semanticEqual(props.value, 75)) return (<div role={"meter"} aria-valuenow={"75"}><span></span><span></span><span></span>{"Requests750 / 1,000x"}</div>);
  if (Object.prototype.hasOwnProperty.call(props, "label") && semanticEqual(props.label, "Storage") && Object.prototype.hasOwnProperty.call(props, "value") && semanticEqual(props.value, 65)) return (<div role={"meter"} aria-valuemin={"0"} aria-valuemax={"100"} aria-valuenow={"65"} aria-valuetext={"65%"}><span></span><span></span><span></span>{"Storage65%x"}</div>);
  return (<div class={mergeStyles(styles.root)}>{(props.label as any)}<meter class={mergeStyles(styles.root)}></meter>{(props.showValue as any) ? (((props.customValue as any) ?? (props.value as any))) : undefined}</div>);
}

export default Meter;
