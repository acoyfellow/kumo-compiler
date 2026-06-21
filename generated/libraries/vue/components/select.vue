<script lang="ts">
export const modelDigest = "12a3eb7f1d84d603ca914b803a794e948b5b62e88a1981d4ebb270f13b6bf69c"
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface SelectProps {
  "aria-label/aria-labelledby"?: unknown
  "children"?: unknown
  "container"?: unknown
  "hideLabel"?: boolean
  "items"?: unknown
  "label"?: unknown
  "labelTooltip/description/error"?: unknown
  "placeholder/loading/disabled/required"?: unknown
  "renderValue"?: unknown
  "Root"?: unknown
  "size"?: string
}
const props = withDefaults(defineProps<SelectProps>(), {"size":"base"})
const emit = defineEmits(["update:open","update:value","change"])
const styles: Record<string,string> = {"root":"kumo-select-root"}
const highlightedOption = ref(undefined)
const root = ref<HTMLElement | null>(null)
onMounted(() => { void props })
</script>

<template>
  <div data-kumo-compound="select" :class="styles.root"><section data-kumo-part="root"><slot name="root"></slot></section><section data-kumo-part="collection"><slot name="collection"></slot></section></div>
</template>
