import type { JSX } from "solid-js";
export interface TableOfContentsProps {
  "Group"?: unknown;
  "Item"?: unknown;
  "List"?: unknown;
  "root"?: unknown;
  "Title"?: unknown;
  "Group"?: JSX.Element;
  "Item"?: JSX.Element;
  "List"?: JSX.Element;
  "Title"?: JSX.Element;
  "root"?: JSX.Element;
  children?: JSX.Element;
  styles?: Record<string, string>;
}
export declare const TableOfContents: (props: TableOfContentsProps) => JSX.Element;
export default TableOfContents;
