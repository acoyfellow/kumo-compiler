<script lang="ts">
export const modelDigest = "b6e5e0d42071bc3fa59e912c2fa0d704cc3acc039749d4c109e804bab44b4b15"
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd"
</script>

<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue'
interface BreadcrumbsProps {
  "children"?: unknown
  "className"?: string
  "size"?: string
  fixture?: unknown
  semanticContent?: unknown
}
const props = withDefaults(defineProps<BreadcrumbsProps>(), {"size":"base"})
const slots = useSlots()
const styles: Record<string,string> = {}
const renderContent = () => props.semanticContent
const fixture = computed(() => props.fixture)
const semanticValues = Object.assign({}, useAttrs(), props) as Record<string, unknown>
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right)
const fixtureText = (value: any): string => value && typeof value === 'object' ? String(typeof value.text === 'string' ? value.text : '') + (Array.isArray(value.children) ? value.children.map(fixtureText).join('') : '') : ''
</script>

<template>
  <template ><nav :aria-label="&quot;Breadcrumbs&quot;" :class="[styles[&quot;root&quot;]]"><slot /></nav></template>
</template>
