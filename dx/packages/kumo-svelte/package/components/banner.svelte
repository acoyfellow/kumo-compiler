<script lang="ts">
  import type { Snippet } from 'svelte';
   const browser = typeof document !== 'undefined';

  export const modelDigest = "e57b4fc419d2b1310d0ea4963a5181380a89060415280931c0e7698f1cd2ede2";
  export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
  export type Props = {
  action?: Snippet;
  children?: Snippet;
  className?: unknown;
  description?: Snippet;
  icon?: Snippet;
  text?: unknown;
  title?: unknown;
  variant?: unknown;
  styles?: Record<string, string>;
  fixture?: unknown;
  [key: string]: unknown;
};

  let componentInput = $props();
  let {
    action = undefined,
    className = undefined,
    description = undefined,
    icon = undefined,
    text = undefined,
    title = undefined,
    variant = "default",
    children,
    fixture = undefined,
    __consumerContent = undefined,
    styles = {},
    ...rest
  }: Props = componentInput;
  
  const renderContent = __consumerContent;
  const semanticProps: Record<string, unknown> = { "action": action, "className": className, "description": description, "icon": icon, "text": text, "title": title, "variant": variant, ...rest, ...(__consumerContent !== undefined ? {children: renderContent} : {}) };
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

{#if Object.prototype.hasOwnProperty.call(semanticValues, "description") && semanticEqual(semanticValues.description, "Details") && Object.prototype.hasOwnProperty.call(semanticValues, "title") && semanticEqual(semanticValues.title, "Notice")}
  <div class="bg-kumo-banner-info">
    <p></p>
    <p></p>
    {"NoticeDetails"}
  </div>
{:else if semanticEqual(renderContent, "Careful") && Object.prototype.hasOwnProperty.call(semanticValues, "variant") && semanticEqual(semanticValues.variant, "alert")}
  <div class="bg-kumo-banner-warning text-kumo-warning">
    <p>
      {renderContent}
    </p>
  </div>
{:else}
<section class={cx(styles["root"])}>
  {#if icon}{@render icon()}{/if}
  {semanticValues["title"]}
  {#if description}{@render description()}{/if}
  {#if action}{@render action()}{/if}
  {#if children}{@render children()}{/if}
</section>
{/if}
