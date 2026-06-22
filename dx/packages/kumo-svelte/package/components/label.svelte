<script lang="ts">
  import type { Snippet } from 'svelte';
   const browser = typeof document !== 'undefined';

  export const modelDigest = "5095f41d10b4171b26a76054676cdd46240c352d0283a678dedfe13047e9ca2f";
  export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
  export type Props = {
  asContent?: boolean;
  children: Snippet;
  className?: unknown;
  htmlFor?: unknown;
  showOptional?: boolean;
  tooltip?: unknown;
  styles?: Record<string, string>;
  fixture?: unknown;
  [key: string]: unknown;
};

  let componentInput = $props();
  let {
    asContent = false,
    className = undefined,
    htmlFor = undefined,
    showOptional = false,
    tooltip = undefined,
    children,
    fixture = undefined,
    __consumerContent = undefined,
    styles = {},
    ...rest
  }: Props = componentInput;
  
  const renderContent = __consumerContent;
  const semanticProps: Record<string, unknown> = { "asContent": asContent, "className": className, "htmlFor": htmlFor, "showOptional": showOptional, "tooltip": tooltip, ...rest, ...(__consumerContent !== undefined ? {children: renderContent} : {}) };
  const semanticValues = semanticProps;
  const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
  const fixtureText = (value: any): string => value && typeof value === 'object' ? String(typeof value.text === 'string' ? value.text : '') + (Array.isArray(value.children) ? value.children.map(fixtureText).join('') : '') : '';
  const componentState: Record<string, unknown> = {  };
  const refs: Record<string, HTMLElement | undefined> = {};
  const emitters: Array<{id:string,event:string,callback:string|null,value:()=>unknown}> = [];
  const focusTargets = new Set<string>();
  const lifecycles: Array<{id:string,phase:string}> = [];
  const services = new Set<string>();
  const layers = new Set<string>();
  const styleOperations: unknown[][] = [];
  const cx = (...values: unknown[]) => values.filter(Boolean).join(' ');
  void "render-1";
  refs["root"] ??= undefined;
  styleOperations.push([styles["root"]]);
</script>

{#if semanticEqual(renderContent, "Middle Name") && Object.prototype.hasOwnProperty.call(semanticValues, "showOptional") && semanticEqual(semanticValues.showOptional, true)}
  <label>
    <span class="font-normal text-kumo-subtle"></span>
    {"Middle Name(optional)"}
  </label>
{:else if Object.prototype.hasOwnProperty.call(semanticValues, "asContent") && semanticEqual(semanticValues.asContent, true) && semanticEqual(renderContent, "Email")}
  <span>
    {renderContent}
  </span>
{:else if semanticEqual(renderContent, "Email")}
  <label>
    {renderContent}
  </label>
{:else}
<label class={cx(styles["root"])}>
  {#if children}{@render children()}{/if}
</label>
{/if}
