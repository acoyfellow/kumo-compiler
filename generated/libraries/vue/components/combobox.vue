<script lang="ts">
export const modelDigest = "e632de38d37be35b83ed3e093ba4e52fbd67247aa10eff83bf2ac59fb1398a41"
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface ComboboxProps {
  "compound"?: unknown
  "Content"?: unknown
  "root"?: unknown
  "TriggerInput"?: unknown
  "TriggerMultipleWithInput"?: unknown
  "variants"?: string
}
const props = withDefaults(defineProps<ComboboxProps>(), {})
const emit = defineEmits(["update:open","change"])
const styles: Record<string,string> = {"root":"kumo-combobox-root"}
const multiple = ref(undefined)
const root = ref<HTMLElement | null>(null)
</script>

<template>
  <div data-kumo-compound="combobox" :class="styles.root"><section data-kumo-part="root"><slot name="root"></slot></section><section data-kumo-part="collection"><slot name="collection"></slot></section></div>
</template>
