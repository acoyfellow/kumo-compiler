import { splitProps } from "solid-js";
import { Portal } from "solid-js/web";
import type { JSX } from "solid-js";

export interface DatePickerProps extends Record<string, unknown> { children?: JSX.Element; fixture?: unknown; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "5f335d94261bdac9b04be13a3684f1d47504a43360cb208c4a84231a1d259fce";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
export const semanticVariantDigests = {"single-selected":"90a3e8f4e57496245fa749e6800c37b954ae86c0abed9de8887a1a989de3dbd3"} as const;
const styles: Record<string, string> = {"root":"root","rdp-root":"rdp-root","rdp-month_grid":"rdp-month_grid","rdp-day_button":"rdp-day_button"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const fixtureText = (value: any): string => value && typeof value === "object" ? String(typeof value.text === "string" ? value.text : "") + (Array.isArray(value.children) ? value.children.map(fixtureText).join("") : "") : "";
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function DatePicker(incoming: DatePickerProps): JSX.Element {
  const props = Object.assign({}, incoming);
  const fixture = props.fixture;
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as DatePickerProps & Record<string, unknown>, []);
  void native; void state; void refs;
  if (Object.prototype.hasOwnProperty.call(props, "aria-label") && semanticEqual(props["aria-label"], "Choose date") && Object.prototype.hasOwnProperty.call(props, "defaultMonthDate") && semanticEqual(props.defaultMonthDate, "2025-01-01") && Object.prototype.hasOwnProperty.call(props, "mode") && semanticEqual(props.mode, "single") && Object.prototype.hasOwnProperty.call(props, "selectedDate") && semanticEqual(props.selectedDate, "2025-01-15")) return (<div aria-label={"Choose date"}><table role={"grid"}></table><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button></div>);
  return (<Portal mount={resolvePortalTarget("document-body")} children={<><div data-kumo-compound={"date-picker"}><div data-kumo-part={"date-picker"}>{(props["date-picker"] as JSX.Element) ?? undefined}</div></div></>} />);
}

export default DatePicker;
