<script lang="ts">
export const modelDigest = "5095f41d10b4171b26a76054676cdd46240c352d0283a678dedfe13047e9ca2f"
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd"
</script>

<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue'
interface LabelProps {
  "asContent"?: boolean
  "children"?: unknown
  "className"?: string
  "htmlFor"?: string
  "showOptional"?: boolean
  "tooltip"?: unknown
  fixture?: unknown
  semanticContent?: unknown
}
const props = withDefaults(defineProps<LabelProps>(), {"asContent":false,"showOptional":false})
const slots = useSlots()
const styles: Record<string,string> = {}
const renderContent = () => props.semanticContent
const fixture = computed(() => props.fixture)
const semanticValues = Object.assign({}, useAttrs(), props) as Record<string, unknown>
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right)
const fixtureText = (value: any): string => value && typeof value === 'object' ? String(typeof value.text === 'string' ? value.text : '') + (Array.isArray(value.children) ? value.children.map(fixtureText).join('') : '') : ''
</script>

<template>
  <template v-if="semanticEqual(renderContent(), &quot;Middle Name&quot;) &amp;&amp; Object.prototype.hasOwnProperty.call(semanticValues, &quot;showOptional&quot;) &amp;&amp; semanticEqual(semanticValues.showOptional, true)"><label><span class="font-normal text-kumo-subtle"></span>{{ "Middle Name(optional)" }}</label></template><template v-else-if="Object.prototype.hasOwnProperty.call(semanticValues, &quot;asContent&quot;) &amp;&amp; semanticEqual(semanticValues.asContent, true) &amp;&amp; semanticEqual(renderContent(), &quot;Email&quot;)"><span>{{ renderContent() }}</span></template><template v-else-if="semanticEqual(renderContent(), &quot;Email&quot;)"><label>{{ renderContent() }}</label></template><template v-else><label :class="[styles[&quot;root&quot;]]"><slot /></label></template>
</template>
