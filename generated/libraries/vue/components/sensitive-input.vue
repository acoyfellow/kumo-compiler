<script lang="ts">
export const modelDigest = "9f0862f5064e4584c2616703c9f1cd80330b5ef71dee9361752cc32841164461"
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface SensitiveInputProps {
  "observable"?: unknown
}
const props = withDefaults(defineProps<SensitiveInputProps>(), {})
const emit = defineEmits(["change"])
const styles: Record<string,string> = {"root":"kumo-sensitive-input-root"}
const root = ref<HTMLElement | null>(null)
</script>

<template>
  <input :class="[styles[&quot;root&quot;]]"></input>
</template>
