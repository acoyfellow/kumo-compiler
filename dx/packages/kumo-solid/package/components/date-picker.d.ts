import type { JSX } from "solid-js";
export interface DatePickerProps {
  "aria-label"?: unknown;
  "fromDate"?: unknown;
  "mode"?: unknown;
  "onChange"?: (...args: unknown[]) => void;
  "reactDayPickerProps"?: unknown;
  "selected"?: unknown;
  "toDate"?: unknown;
  children?: JSX.Element;
  fixture?: unknown;
  styles?: Record<string, string>;
}
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export declare const DatePicker: ((props: DatePickerProps) => JSX.Element);
export default DatePicker;
