<script lang="ts">
export const modelDigest = "2519ce9397d7b2de6138a9f8fe7461e138cd766c9a39f7f25d1d4c84345f0d10"
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface ClipboardTextProps {
  "observable"?: unknown
}
const props = withDefaults(defineProps<ClipboardTextProps>(), {})
const emit = defineEmits(["change"])
const styles: Record<string,string> = {"root":"kumo-clipboard-text-root"}
const root = ref<HTMLElement | null>(null)
onMounted(() => { void globalThis })
</script>

<template>
  <clipboard-text :class="[styles[&quot;root&quot;]]"></clipboard-text>
</template>
