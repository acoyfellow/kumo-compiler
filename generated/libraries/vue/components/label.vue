<script lang="ts">
export const modelDigest = "a14b8ca4ef389e6247d422e71305289cda06eeb21a5ec5a1f49f196a6cca012f"
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface LabelProps {
  "asContent"?: boolean
  "children": unknown
  "className"?: string
  "htmlFor"?: string
  "showOptional"?: boolean
  "tooltip"?: unknown
}
const props = withDefaults(defineProps<LabelProps>(), {"asContent":false,"showOptional":false})
const emit = defineEmits([])
const styles: Record<string,string> = {"root":"kumo-label-root"}
const root = ref<HTMLElement | null>(null)
</script>

<template>
  <label :class="[styles[&quot;root&quot;]]"><slot /></label>
</template>
