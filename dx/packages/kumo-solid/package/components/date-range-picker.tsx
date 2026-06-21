import { splitProps } from "solid-js";
import { Portal } from "solid-js/web";
import type { JSX } from "solid-js";

export interface DateRangePickerProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "24c51f801cb83e8ae05a575e5e3e012c1f46065f0d1fda618759efe36487bc38";
const styles: Record<string, string> = {"root":"root","p-3":"p-3","p-4":"p-4","p-5":"p-5","bg-kumo-overlay":"bg-kumo-overlay","bg-kumo-base":"bg-kumo-base"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function DateRangePicker(incoming: DateRangePickerProps): JSX.Element {
  const props = Object.assign({"size":"base","timezone":"New York, NY, USA (GMT-4)","variant":"default"}, incoming);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as DateRangePickerProps & Record<string, unknown>, []);
  void native; void state; void refs;
  return (<Portal mount={resolvePortalTarget("document-body")} children={<><div data-kumo-compound={"date-range-picker"}><div data-kumo-part={"date-range-picker"}>{(props["date-range-picker"] as JSX.Element) ?? undefined}</div></div></>} />);
}

export default DateRangePicker;
