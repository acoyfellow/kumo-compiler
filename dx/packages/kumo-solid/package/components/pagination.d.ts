import type { JSX } from "solid-js";
export interface PaginationProps {
  "compound"?: unknown;
  "controls"?: unknown;
  "labels"?: unknown;
  "page"?: unknown;
  "pageSelector"?: unknown;
  "perPage"?: unknown;
  "setPage"?: (...args: unknown[]) => void;
  "totalCount"?: unknown;
  "compound"?: JSX.Element;
  children?: JSX.Element;
  styles?: Record<string, string>;
}
export declare const Pagination: (props: PaginationProps) => JSX.Element;
export default Pagination;
