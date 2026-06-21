import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface GridProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export const modelDigest = "9dbbb8c1edc23a0a1b2ed65add8ac4c1a675b5b9f0afbdb9eae72871c290ace3";
const styles: Record<string, string> = {"root":"root","grid":"grid"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Grid(incoming: GridProps): JSX.Element {
  const props = Object.assign({"gap":"base"}, incoming);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as GridProps & Record<string, unknown>, []);
  void native; void state; void refs;
  return (<div class={mergeStyles(styles.root)}>{props.children}</div>);
}

export default Grid;
