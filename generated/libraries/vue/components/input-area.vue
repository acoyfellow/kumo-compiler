<script lang="ts">
export const modelDigest = "59711469ba9cb63d7177a2ef83d87ae8fdd8835dab30e06846284b0d7497f1c1"
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface InputAreaProps {
  "observable"?: unknown
}
const props = withDefaults(defineProps<InputAreaProps>(), {})
const emit = defineEmits(["change"])
const styles: Record<string,string> = {"root":"kumo-input-area-root"}
const root = ref<HTMLElement | null>(null)
</script>

<template>
  <textarea :class="[styles[&quot;root&quot;]]"></textarea>
</template>
