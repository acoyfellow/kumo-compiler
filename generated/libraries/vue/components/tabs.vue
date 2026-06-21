<script lang="ts">
export const modelDigest = "480d0ca0dc8311b3321bb1c078c9277118ed399fcc4ececa5b561d5b695a3336"
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface TabsProps {
  "activateOnFocus"?: boolean
  "className"?: unknown
  "indicatorClassName"?: unknown
  "listClassName"?: unknown
  "onValueChange"?: string
  "selectedValue"?: string
  "size"?: string
  "tabs"?: unknown
  "value"?: string
  "variant"?: unknown
}
const props = withDefaults(defineProps<TabsProps>(), {"activateOnFocus":false,"selectedValue":"first tab value when uncontrolled and selectedValue omitted","size":"base","tabs":[],"variant":"segmented"})
const emit = defineEmits(["onValueChange","change"])
const styles: Record<string,string> = {"root":"kumo-tabs-root"}
const controlled = ref(undefined)
const root = ref<HTMLElement | null>(null)
</script>

<template>
  <div data-kumo-compound="tabs" :class="styles.root"><section data-kumo-part="root"><slot name="root"></slot></section><section data-kumo-part="collection"><slot name="collection"></slot></section></div>
</template>
