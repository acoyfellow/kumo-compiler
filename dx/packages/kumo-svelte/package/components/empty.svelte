<script lang="ts">
  import type { Snippet } from 'svelte';
   const browser = typeof document !== 'undefined';

  export const modelDigest = "09c586d6894b365150e81a5fba8032a98695d8f6cd14bf4ea0f0466bda52b194";
  export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
  export type Props = {
  className?: unknown;
  commandLine?: unknown;
  contents?: Snippet;
  description?: Snippet;
  icon?: Snippet;
  size?: unknown;
  title: unknown;
  children?: Snippet;
  styles?: Record<string, string>;
  fixture?: unknown;
  [key: string]: unknown;
};

  let componentInput = $props();
  let {
    className = undefined,
    commandLine = undefined,
    contents = undefined,
    description = undefined,
    icon = undefined,
    size = "base",
    title = undefined,
    children,
    fixture = undefined,
    __consumerContent = undefined,
    styles = {},
    ...rest
  }: Props = componentInput;
  
  const renderContent = __consumerContent;
  const semanticProps: Record<string, unknown> = { "className": className, "commandLine": commandLine, "contents": contents, "description": description, "icon": icon, "size": size, "title": title, ...rest, ...(__consumerContent !== undefined ? {children: renderContent} : {}) };
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

{#if Object.prototype.hasOwnProperty.call(semanticValues, "title") && semanticEqual(semanticValues.title, "No results")}
  <div class="px-10 py-16 gap-6">
    <h2>
      {semanticValues["title"]}
    </h2>
  </div>
{:else}
<section class={cx(styles["root"])}>
  {#if icon}{@render icon()}{/if}
  {semanticValues["title"]}
  {#if description}{@render description()}{/if}
  {#if contents}{@render contents()}{/if}
</section>
{/if}
