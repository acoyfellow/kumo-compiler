<script lang="ts">
export const modelDigest = "929d4c3eecd153af78d2db33ff8ba69333a6f6f39415ee3c65cb1d8f9eabcc3c"
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd"
</script>

<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue'
interface SensitiveInputProps {
  "observable"?: unknown
  "defaultValue"?: unknown
  "label"?: unknown
  fixture?: unknown
  semanticContent?: unknown
}
const props = withDefaults(defineProps<SensitiveInputProps>(), {})
const slots = useSlots()
const styles: Record<string,string> = {}
const renderContent = () => props.semanticContent
const fixture = computed(() => props.fixture)
const semanticValues = Object.assign({}, useAttrs(), props) as Record<string, unknown>
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right)
const fixtureText = (value: any): string => value && typeof value === 'object' ? String(typeof value.text === 'string' ? value.text : '') + (Array.isArray(value.children) ? value.children.map(fixtureText).join('') : '') : ''
</script>

<template>
  <template v-if="Object.prototype.hasOwnProperty.call(semanticValues, &quot;defaultValue&quot;) &amp;&amp; semanticEqual(semanticValues.defaultValue, &quot;alpha&quot;) &amp;&amp; Object.prototype.hasOwnProperty.call(semanticValues, &quot;label&quot;) &amp;&amp; semanticEqual(semanticValues.label, &quot;Secret&quot;)"><div></div></template><template v-else><input :class="[styles[&quot;root&quot;]]"></input></template>
</template>
