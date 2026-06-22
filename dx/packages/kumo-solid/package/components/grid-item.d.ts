import type { JSX } from "solid-js";
export interface GridItemProps {
  "children"?: unknown;
  "className"?: unknown;
  children?: JSX.Element;
  fixture?: unknown;
  styles?: Record<string, string>;
}
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export declare const GridItem: ((props: GridItemProps) => JSX.Element);
export default GridItem;
