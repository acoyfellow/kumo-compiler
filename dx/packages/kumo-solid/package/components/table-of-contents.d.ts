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
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export declare const TableOfContentsGroup: (props: CompoundPartProps) => JSX.Element;
export declare const TableOfContentsItem: (props: CompoundPartProps) => JSX.Element;
export declare const TableOfContentsList: (props: CompoundPartProps) => JSX.Element;
export declare const TableOfContentsTitle: (props: CompoundPartProps) => JSX.Element;
export declare const TableOfContents: ((props: TableOfContentsProps) => JSX.Element) & { "Group": typeof TableOfContentsGroup; "Item": typeof TableOfContentsItem; "List": typeof TableOfContentsList; "Title": typeof TableOfContentsTitle };
export default TableOfContents;
