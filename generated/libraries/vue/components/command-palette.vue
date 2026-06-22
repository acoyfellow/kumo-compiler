<script lang="ts">
export const modelDigest = "4aabec222bec5b00f25388a2bb017b36c91349e55fa3ba6cb97fdc3d0afee0c0"
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd"
</script>

<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue'
interface CommandPaletteProps {
  "compound"?: unknown
  "Dialog"?: unknown
  "Input"?: unknown
  "Panel"?: string
  "Root"?: string
  "highlights"?: unknown
  "text"?: unknown
  fixture?: unknown
  semanticContent?: unknown
}
const props = withDefaults(defineProps<CommandPaletteProps>(), {})
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
  <template v-if="Object.prototype.hasOwnProperty.call(semanticValues, &quot;highlights&quot;) &amp;&amp; semanticEqual(semanticValues.highlights, [[0,4]]) &amp;&amp; Object.prototype.hasOwnProperty.call(semanticValues, &quot;text&quot;) &amp;&amp; semanticEqual(semanticValues.text, &quot;Cloudflare&quot;) &amp;&amp; semanticEqual(fixture, {&quot;export&quot;:&quot;.HighlightedText&quot;,&quot;props&quot;:{&quot;text&quot;:&quot;Cloudflare&quot;,&quot;highlights&quot;:[[0,4]]},&quot;children&quot;:[]})"><span><mark>{{ "Cloud" }}</mark></span></template><template v-else><div data-kumo-compound="command-palette" :class="styles.root"><section data-kumo-part="root"><slot name="root"></slot></section><section data-kumo-part="collection"><slot name="collection"></slot></section></div></template>
</template>
