import type { JSX } from "solid-js";
export interface DateRangePickerProps {
  "className"?: unknown;
  "onEndDateChange"?: (...args: unknown[]) => void;
  "onStartDateChange"?: (...args: unknown[]) => void;
  "size"?: unknown;
  "timezone"?: unknown;
  "variant"?: unknown;
  children?: JSX.Element;
  styles?: Record<string, string>;
}
export declare const DateRangePicker: (props: DateRangePickerProps) => JSX.Element;
export default DateRangePicker;
