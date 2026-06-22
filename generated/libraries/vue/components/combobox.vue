<script lang="ts">
export const modelDigest = "99992dbcf413455a2229fb3d1cda459e1b2723adfeb2204db400829a901edf36"
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd"
</script>

<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue'
interface ComboboxProps {
  "compound"?: unknown
  "Content"?: unknown
  "root"?: unknown
  "TriggerInput"?: unknown
  "TriggerMultipleWithInput"?: unknown
  "variants"?: string
  fixture?: unknown
  semanticContent?: unknown
}
const props = withDefaults(defineProps<ComboboxProps>(), {})
const slots = useSlots()
const styles: Record<string,string> = {}
const renderContent = () => props.semanticContent
const fixture = computed(() => props.fixture)
const semanticValues = Object.assign({}, useAttrs(), props) as Record<string, unknown>
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right)
const fixtureText = (value: any): string => value && typeof value === 'object' ? String(typeof value.text === 'string' ? value.text : '') + (Array.isArray(value.children) ? value.children.map(fixtureText).join('') : '') : ''
</script>

<template>
  <template ><div data-kumo-compound="combobox" :class="styles.root"><section data-kumo-part="root"><slot name="root"></slot></section><section data-kumo-part="collection"><slot name="collection"></slot></section></div></template>
</template>
