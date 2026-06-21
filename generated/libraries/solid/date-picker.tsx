import { splitProps } from "solid-js";
import { Portal } from "solid-js/web";
import type { JSX } from "solid-js";

export interface DatePickerProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export const modelDigest = "efe6ee1704bcfdd921aefd2a33601d5193d45c82454eadc21af9261b848e1bc6";
const styles: Record<string, string> = {"root":"root","rdp-root":"rdp-root","rdp-month_grid":"rdp-month_grid","rdp-day_button":"rdp-day_button"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function DatePicker(incoming: DatePickerProps): JSX.Element {
  const props = Object.assign({}, incoming);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as DatePickerProps & Record<string, unknown>, []);
  void native; void state; void refs;
  return (<Portal mount={resolvePortalTarget("document-body")} children={<><div data-kumo-compound={"date-picker"}><div data-kumo-part={"date-picker"}>{props["date-picker"] ?? undefined}</div></div></>} />);
}

export default DatePicker;
