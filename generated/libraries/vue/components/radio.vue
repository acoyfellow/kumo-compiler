<script lang="ts">
export const modelDigest = "851f6bb506c384c8d6d8ec9583d3ec05a0cf060d5d9192464a29ba55e1185844"
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd"
</script>

<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue'
interface RadioProps {
  "defaultValue"?: string
  "disabled"?: boolean
  "items"?: unknown
  "onValueChange"?: unknown
  "orientation"?: unknown
  "value"?: string
  fixture?: unknown
  semanticContent?: unknown
}
const props = withDefaults(defineProps<RadioProps>(), {"orientation":"vertical"})
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
  <template ><div data-kumo-compound="radio" :class="styles.root"><section data-kumo-part="root"><slot name="root"></slot></section><section data-kumo-part="collection"><slot name="collection"></slot></section></div></template>
</template>
