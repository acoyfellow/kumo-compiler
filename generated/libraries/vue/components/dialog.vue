<script lang="ts">
export const modelDigest = "f9517f6c346751f7fb38e9984e7e08637053542c11e623d7b71778e55bf138cb"
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd"
</script>

<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue'
interface DialogProps {
  "Close"?: unknown
  "Description"?: unknown
  "Dialog"?: unknown
  "Root"?: string
  "Title"?: unknown
  "Trigger"?: unknown
  fixture?: unknown
  semanticContent?: unknown
}
const props = withDefaults(defineProps<DialogProps>(), {})
const slots = useSlots()
const styles: Record<string,string> = {}
const renderContent = () => props.semanticContent
const fixture = computed(() => props.fixture)
const semanticValues = Object.assign({}, useAttrs(), props) as Record<string, unknown>
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right)
const fixtureText = (value: any): string => value && typeof value === 'object' ? String(typeof value.text === 'string' ? value.text : '') + (Array.isArray(value.children) ? value.children.map(fixtureText).join('') : '') : ''
</script>

<template>
  <template ><Teleport :to="&quot;document-body&quot;"><div data-kumo-layer="dialog"><div data-kumo-compound="dialog" :class="styles.root"><section data-kumo-part="dialog"><slot name="dialog"></slot></section></div></div></Teleport></template>
</template>
