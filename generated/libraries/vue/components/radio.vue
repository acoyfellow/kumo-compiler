<script lang="ts">
export const modelDigest = "0f71542a2bd3b8e5809f5dbb979a7fe2448e19e4f007cced41a22cbc5ef4cba9"
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface RadioProps {
  "defaultValue"?: string
  "disabled"?: boolean
  "items"?: unknown
  "onValueChange"?: unknown
  "orientation"?: unknown
  "value"?: string
}
const props = withDefaults(defineProps<RadioProps>(), {"orientation":"vertical"})
const emit = defineEmits(["onValueChange","change"])
const styles: Record<string,string> = {"root":"kumo-radio-root"}
const controlled = ref(undefined)
const root = ref<HTMLElement | null>(null)
</script>

<template>
  <div data-kumo-compound="radio" :class="styles.root"><section data-kumo-part="root"><slot name="root"></slot></section><section data-kumo-part="collection"><slot name="collection"></slot></section></div>
</template>
