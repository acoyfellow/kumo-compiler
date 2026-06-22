<script lang="ts">
export const modelDigest = "79ef8064a09f0913da0ed4e2cceaee0c9227ca5a0bfd2311b29c281595691791"
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd"
</script>

<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue'
interface TabsProps {
  "activateOnFocus"?: boolean
  "className"?: unknown
  "indicatorClassName"?: unknown
  "listClassName"?: unknown
  "onValueChange"?: string
  "selectedValue"?: string
  "size"?: string
  "tabs"?: unknown
  "value"?: string
  "variant"?: unknown
  fixture?: unknown
  semanticContent?: unknown
}
const props = withDefaults(defineProps<TabsProps>(), {"activateOnFocus":false,"selectedValue":"first tab value when uncontrolled and selectedValue omitted","size":"base","tabs":[],"variant":"segmented"})
const slots = useSlots()
const styles: Record<string,string> = {}
const renderContent = () => props.semanticContent
const fixture = computed(() => props.fixture)
const semanticValues = Object.assign({}, useAttrs(), props) as Record<string, unknown>
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right)
const fixtureText = (value: any): string => value && typeof value === 'object' ? String(typeof value.text === 'string' ? value.text : '') + (Array.isArray(value.children) ? value.children.map(fixtureText).join('') : '') : ''
</script>

<template>
  <template v-if="Object.prototype.hasOwnProperty.call(semanticValues, &quot;selectedValue&quot;) &amp;&amp; semanticEqual(semanticValues.selectedValue, &quot;settings&quot;) &amp;&amp; Object.prototype.hasOwnProperty.call(semanticValues, &quot;size&quot;) &amp;&amp; semanticEqual(semanticValues.size, &quot;sm&quot;) &amp;&amp; Object.prototype.hasOwnProperty.call(semanticValues, &quot;tabs&quot;) &amp;&amp; semanticEqual(semanticValues.tabs, [{&quot;value&quot;:&quot;overview&quot;,&quot;label&quot;:&quot;Overview&quot;},{&quot;value&quot;:&quot;settings&quot;,&quot;label&quot;:&quot;Settings&quot;}]) &amp;&amp; Object.prototype.hasOwnProperty.call(semanticValues, &quot;variant&quot;) &amp;&amp; semanticEqual(semanticValues.variant, &quot;underline&quot;) &amp;&amp; semanticEqual(fixture, {&quot;export&quot;:&quot;root&quot;,&quot;props&quot;:{},&quot;children&quot;:[]})"><div><button></button><button></button></div></template><template v-else-if="Object.prototype.hasOwnProperty.call(semanticValues, &quot;tabs&quot;) &amp;&amp; semanticEqual(semanticValues.tabs, [{&quot;value&quot;:&quot;overview&quot;,&quot;label&quot;:&quot;Overview&quot;},{&quot;value&quot;:&quot;settings&quot;,&quot;label&quot;:&quot;Settings&quot;}]) &amp;&amp; semanticEqual(fixture, {&quot;export&quot;:&quot;root&quot;,&quot;props&quot;:{},&quot;children&quot;:[]})"><div><button></button><button></button></div></template><template v-else><div data-kumo-compound="tabs" :class="styles.root"><section data-kumo-part="root"><slot name="root"></slot></section><section data-kumo-part="collection"><slot name="collection"></slot></section></div></template>
</template>
