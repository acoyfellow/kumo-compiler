<script lang="ts">
export const modelDigest = "70db6933357de8ee3d47759cd14f5ca8cab2cc88427a19740a54a5f4d65377b3"
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd"
</script>

<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue'
interface SwitchProps {
  "checked"?: boolean
  "disabled"?: boolean
  "group"?: unknown
  "label"?: unknown
  "onCheckedChange"?: unknown
  "size"?: string
  "aria-label"?: unknown
  fixture?: unknown
  semanticContent?: unknown
}
const props = withDefaults(defineProps<SwitchProps>(), {"checked":false,"disabled":false,"size":"base"})
const slots = useSlots()
const styles: Record<string,string> = {}
const renderContent = () => props.semanticContent
const fixture = computed(() => props.fixture)
const semanticValues = Object.assign({}, useAttrs(), props) as Record<string, unknown>
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right)
const fixtureText = (value: any): string => value && typeof value === 'object' ? String(typeof value.text === 'string' ? value.text : '') + (Array.isArray(value.children) ? value.children.map(fixtureText).join('') : '') : ''
</script>

<template>
  <template v-if="Object.prototype.hasOwnProperty.call(semanticValues, &quot;ariaLabel&quot;) &amp;&amp; semanticEqual(semanticValues.ariaLabel, &quot;Small&quot;) &amp;&amp; Object.prototype.hasOwnProperty.call(semanticValues, &quot;size&quot;) &amp;&amp; semanticEqual(semanticValues.size, &quot;sm&quot;)"><button role="switch" aria-checked="false" class="h-4 w-8"></button></template><template v-else><button :class="[styles[&quot;root&quot;]]"></button></template>
</template>
