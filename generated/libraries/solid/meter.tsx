import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface MeterProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export const modelDigest = "2201de1a1ed8a66d0925c6dae8b6b3197097ad332ed86e9b694f8d7383c8c284";
const styles: Record<string, string> = {"root":"root","flex":"flex","w-full":"w-full","flex-col":"flex-col","gap-2":"gap-2"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Meter(incoming: MeterProps): JSX.Element {
  const props = Object.assign({"max":100,"min":0,"showValue":true}, incoming);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as MeterProps & Record<string, unknown>, []);
  void native; void state; void refs;
  return (<div class={mergeStyles(styles.root)}>{(props.label as any)}<meter class={mergeStyles(styles.root)}></meter>{(props.showValue as any) ? (((props.customValue as any) ?? (props.value as any))) : undefined}</div>);
}

export default Meter;
