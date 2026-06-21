import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export interface CloudflareLogoProps extends Record<string, unknown> { children?: JSX.Element; fixture?: unknown; styles?: Record<string, string>; }
export interface CompoundPartProps extends JSX.HTMLAttributes<HTMLDivElement> { children?: JSX.Element; }
export const modelDigest = "e0451c0088ccb59f34594d962f02d2edc34829e8b2a927a382abebeb3a1f3484";
export const semanticVariantDigests = {"full-color":"4a470d188456a2895090a43ed1e98eff1f416323faeac90bb20d43ae581efacd","glyph-white":"caa69a7a338fc00c81a3c2c314bda2998c251b21ddc80f0f0bdb8edc6b54acbd"} as const;
const styles: Record<string, string> = {"root":"root"};
const mergeStyles = (...values: unknown[]) => values.filter(Boolean).join(" ");
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const fixtureText = (value: any): string => value && typeof value === "object" ? String(typeof value.text === "string" ? value.text : "") + (Array.isArray(value.children) ? value.children.map(fixtureText).join("") : "") : "";
const resolvePortalTarget = (target: unknown) => target === "document-body" && typeof document !== "undefined" ? document.body : target as Node;

export function CloudflareLogo(incoming: CloudflareLogoProps): JSX.Element {
  const props = Object.assign({"color":"color","variant":"full"}, incoming);
  const fixture = props.fixture;
  const state: Record<string, () => unknown> = {};
  const refs: Record<string, HTMLElement | undefined> = {};
  const [, native] = splitProps(props as CloudflareLogoProps & Record<string, unknown>, []);
  void native; void state; void refs;
  if (Object.prototype.hasOwnProperty.call(props, "color") && semanticEqual(props.color, "white") && Object.prototype.hasOwnProperty.call(props, "variant") && semanticEqual(props.variant, "glyph")) return (<svg role={"img"} aria-label={"Cloudflare logo"} viewBox={"0 0 49 22"} class="text-white"><path></path><path></path></svg>);
  if (true) return (<svg role={"img"} aria-label={"Cloudflare logo"} viewBox={"0 0 425.6 143.63"} class="text-kumo-default"><path></path><path></path><path></path><path></path><path></path><path></path><path></path><path></path><path></path><path></path><path></path><path></path></svg>);
  return (<svg role={"img"} aria-label={"Cloudflare"} class={mergeStyles(styles.root)}></svg>);
}

export default CloudflareLogo;
