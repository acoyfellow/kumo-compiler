<script lang="ts">
export const modelDigest = "723d817c6c81e88062ee871968eac6318dc1176c7b9e92c407d7f7a29445d8c3"
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface InputGroupProps {
  "observable"?: unknown
}
const props = withDefaults(defineProps<InputGroupProps>(), {})
const emit = defineEmits(["change"])
const styles: Record<string,string> = {"root":"kumo-input-group-root"}
const root = ref<HTMLElement | null>(null)
</script>

<template>
  <input-group :class="[styles[&quot;root&quot;]]"></input-group>
</template>
