<script lang="ts">
export const modelDigest = "5425763a958aaba88a608179f3dd53d1f9651a0bb15a6c4d82190bf83c5f9512"
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface InputProps {
  "observable"?: unknown
}
const props = withDefaults(defineProps<InputProps>(), {})
const emit = defineEmits(["change"])
const styles: Record<string,string> = {"root":"kumo-input-root"}
const root = ref<HTMLElement | null>(null)
</script>

<template>
  <input :class="[styles[&quot;root&quot;]]"></input>
</template>
