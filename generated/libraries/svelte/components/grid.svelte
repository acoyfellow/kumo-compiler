<script lang="ts">
  import type { Snippet } from 'svelte';
   const browser = typeof document !== 'undefined';

  export const modelDigest = "77368ecd52b54b2d85a270ad010c77b8e23e8c0be9b82414610908b3a84f636d";
  export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
  export type Props = {
  children?: Snippet;
  className?: unknown;
  gap?: unknown;
  mobileDivider?: boolean;
  variant?: unknown;
  styles?: Record<string, string>;
  fixture?: unknown;
  [key: string]: unknown;
};

  let componentInput = $props();
  let {
    className = undefined,
    gap = "base",
    mobileDivider = undefined,
    variant = undefined,
    children,
    fixture = undefined,
    __consumerContent = undefined,
    styles = {},
    ...rest
  }: Props = componentInput;
  
  const renderContent = __consumerContent;
  const semanticProps: Record<string, unknown> = { "className": className, "gap": gap, "mobileDivider": mobileDivider, "variant": variant, ...rest, ...(__consumerContent !== undefined ? {children: renderContent} : {}) };
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
  styleOperations.push([styles["root"]]);
</script>

{#if Object.prototype.hasOwnProperty.call(semanticValues, "children") && semanticEqual(semanticValues.children, "Two") && Object.prototype.hasOwnProperty.call(semanticValues, "gap") && semanticEqual(semanticValues.gap, "none") && Object.prototype.hasOwnProperty.call(semanticValues, "variant") && semanticEqual(semanticValues.variant, "side-by-side")}
  <div class="grid-cols-2 gap-0">
    {renderContent}
  </div>
{:else if Object.prototype.hasOwnProperty.call(semanticValues, "children") && semanticEqual(semanticValues.children, "Cells") && Object.prototype.hasOwnProperty.call(semanticValues, "variant") && semanticEqual(semanticValues.variant, "3up")}
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
    {renderContent}
  </div>
{:else}
<div class={cx(styles["root"])}>
  {#if children}{@render children()}{/if}
</div>
{/if}
