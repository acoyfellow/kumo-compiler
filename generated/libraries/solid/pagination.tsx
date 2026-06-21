import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface PaginationProps extends Record<string, unknown> { children?: JSX.Element; styles?: Record<string, string>; }
export const modelDigest = "8a03b02a4e86e5ee4971e869b775b7efd73bc7e61116c5e794612f2402b7dd2d";
const styles: Record<string, string> = {"root":"root","flex":"flex","items-center":"items-center","gap-2":"gap-2","w-full":"w-full"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Pagination(incoming: PaginationProps): JSX.Element {
  const props = Object.assign({"controls":"full","labels":"English canonical labels","page":1,"pageSelector":"input"}, incoming);
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as PaginationProps & Record<string, unknown>, []);
  void native; void state; void refs;
  return (<div data-kumo-compound={"pagination"}><div data-kumo-part={"root"}>{props.root ?? undefined}</div><div data-kumo-part={"collection"}>{props.collection ?? undefined}</div></div>);
}

export default Pagination;
