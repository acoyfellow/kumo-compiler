<script lang="ts">
export const modelDigest = "b0a8634b18904bafb4a3ad9eb78bc40c9142397d8869bcc94a88c6a372265e25"
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd"
</script>

<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue'
interface ClipboardTextProps {
  "observable"?: unknown
  "text"?: unknown
  "textToCopy"?: unknown
  fixture?: unknown
  semanticContent?: unknown
}
const props = withDefaults(defineProps<ClipboardTextProps>(), {})
const slots = useSlots()
const styles: Record<string,string> = {}
const renderContent = () => props.semanticContent
const fixture = computed(() => props.fixture)
const semanticValues = Object.assign({}, useAttrs(), props) as Record<string, unknown>
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right)
const fixtureText = (value: any): string => value && typeof value === 'object' ? String(typeof value.text === 'string' ? value.text : '') + (Array.isArray(value.children) ? value.children.map(fixtureText).join('') : '') : ''
</script>

<template>
  <template v-if="Object.prototype.hasOwnProperty.call(semanticValues, &quot;text&quot;) &amp;&amp; semanticEqual(semanticValues.text, &quot;visible&quot;) &amp;&amp; Object.prototype.hasOwnProperty.call(semanticValues, &quot;textToCopy&quot;) &amp;&amp; semanticEqual(semanticValues.textToCopy, &quot;payload&quot;)"><div></div></template><template v-else><clipboard-text :class="[styles[&quot;root&quot;]]"></clipboard-text></template>
</template>
