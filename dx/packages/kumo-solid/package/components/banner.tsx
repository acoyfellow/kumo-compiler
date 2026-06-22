import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface BannerProps extends Record<string, unknown> { children?: JSX.Element; fixture?: unknown; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "e57b4fc419d2b1310d0ea4963a5181380a89060415280931c0e7698f1cd2ede2";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
export const semanticVariantDigests = {"structured":"72afbfbc62b222448d476f2fe1a729495d6c4b4c8da3a915add21e95acf328a7","alert-simple":"b905eb0b86c579c36dd4cff9c50b555e66a8547f3deb1456ffeadbedb20a441b"} as const;
const styles: Record<string, string> = {"root":"root","flex":"flex","w-full":"w-full","items-start":"items-start","gap-3":"gap-3","rounded-lg":"rounded-lg"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const fixtureText = (value: any): string => value && typeof value === "object" ? String(typeof value.text === "string" ? value.text : "") + (Array.isArray(value.children) ? value.children.map(fixtureText).join("") : "") : "";
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function Banner(incoming: BannerProps): JSX.Element {
  const props = Object.assign({"variant":"default"}, incoming);
  const fixture = props.fixture;
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as BannerProps & Record<string, unknown>, []);
  void native; void state; void refs;
  if (Object.prototype.hasOwnProperty.call(props, "description") && semanticEqual(props.description, "Details") && Object.prototype.hasOwnProperty.call(props, "title") && semanticEqual(props.title, "Notice")) return (<div class="bg-kumo-banner-info"><p></p><p></p>{"NoticeDetails"}</div>);
  if (Object.prototype.hasOwnProperty.call(props, "children") && semanticEqual(props.children, "Careful") && Object.prototype.hasOwnProperty.call(props, "variant") && semanticEqual(props.variant, "alert")) return (<div class="bg-kumo-banner-warning text-kumo-warning"><p>{props.children}</p></div>);
  return (<section class={mergeStyles(styles.root)}>{(props.icon as JSX.Element) ?? undefined}{(props.title as any)}{(props.description as JSX.Element) ?? undefined}{(props.action as JSX.Element) ?? undefined}{props.children}</section>);
}

export default Banner;
