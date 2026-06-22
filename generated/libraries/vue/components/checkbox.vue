<script lang="ts">
export const modelDigest = "9bed87c38c3dc76bca19c327b60bc4264efc797aacdce1a4e06e08b722ca4c65"
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd"
</script>

<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue'
interface CheckboxProps {
  "checked"?: boolean
  "disabled"?: boolean
  "group"?: unknown
  "indeterminate"?: boolean
  "label"?: unknown
  "onCheckedChange"?: unknown
  fixture?: unknown
  semanticContent?: unknown
}
const props = withDefaults(defineProps<CheckboxProps>(), {"checked":false,"disabled":false,"indeterminate":false})
const slots = useSlots()
const styles: Record<string,string> = {}
const renderContent = () => props.semanticContent
const fixture = computed(() => props.fixture)
const semanticValues = Object.assign({}, useAttrs(), props) as Record<string, unknown>
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right)
const fixtureText = (value: any): string => value && typeof value === 'object' ? String(typeof value.text === 'string' ? value.text : '') + (Array.isArray(value.children) ? value.children.map(fixtureText).join('') : '') : ''
</script>

<template>
  <template ><input :class="[styles[&quot;root&quot;]]"></input></template>
</template>
