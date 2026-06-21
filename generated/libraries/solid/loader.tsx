import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface LoaderProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export const modelDigest = "8c761d6a326088b816393ffb81fd67e64ad97a3299d323ad3078a93acebc0730";
const styles: Record<string, string> = {"root":"root"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Loader(incoming: LoaderProps): JSX.Element {
  const props = Object.assign({"aria-label":"Loading","size":"base"}, incoming);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as LoaderProps & Record<string, unknown>, []);
  void native; void state; void refs;
  return (<span role={"status"} aria-label={props["aria-label"]} class={mergeStyles(styles.root)}></span>);
}

export default Loader;
