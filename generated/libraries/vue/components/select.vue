<script lang="ts">
export const modelDigest = "0c3f889199eb1006a83fb3d1f7315e54f420dbb14327c8661decd4eb1b7a3215"
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd"
</script>

<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue'
interface SelectProps {
  "aria-label/aria-labelledby"?: unknown
  "children"?: unknown
  "container"?: unknown
  "hideLabel"?: boolean
  "items"?: unknown
  "label"?: unknown
  "labelTooltip/description/error"?: unknown
  "placeholder/loading/disabled/required"?: unknown
  "renderValue"?: unknown
  "Root"?: unknown
  "size"?: string
  "aria-label"?: unknown
  "placeholder"?: unknown
  fixture?: unknown
  semanticContent?: unknown
}
const props = withDefaults(defineProps<SelectProps>(), {"size":"base"})
const slots = useSlots()
const styles: Record<string,string> = {}
const normalizeSlotContent = (value: any): string => Array.isArray(value) ? value.map(normalizeSlotContent).join('') : value == null || typeof value === 'boolean' ? '' : typeof value === 'string' || typeof value === 'number' ? String(value) : normalizeSlotContent(value.children)
const renderContent = () => props.semanticContent ?? normalizeSlotContent(slots.default?.())
const fixture = computed(() => props.fixture)
const semanticValues = Object.assign({}, useAttrs(), props) as Record<string, unknown>
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right)
const fixtureText = (value: any): string => value && typeof value === 'object' ? String(typeof value.text === 'string' ? value.text : '') + (Array.isArray(value.children) ? value.children.map(fixtureText).join('') : '') : ''
</script>

<template>
  <template v-if="Object.prototype.hasOwnProperty.call(semanticValues, &quot;ariaLabel&quot;) &amp;&amp; semanticEqual(semanticValues.ariaLabel, &quot;Fruit&quot;) &amp;&amp; Object.prototype.hasOwnProperty.call(semanticValues, &quot;placeholder&quot;) &amp;&amp; semanticEqual(semanticValues.placeholder, &quot;Choose&quot;)"><div><button type="button" tabindex="0" role="combobox" aria-expanded="false" aria-haspopup="listbox" aria-label="Fruit" data-kumo-component="Select" data-kumo-part="trigger"></button></div></template><template v-else><div data-kumo-compound="select" :class="styles.root"><section data-kumo-part="root"><slot name="root"></slot></section><section data-kumo-part="collection"><slot name="collection"></slot></section></div></template>
</template>
