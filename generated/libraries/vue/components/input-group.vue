<script lang="ts">
export const modelDigest = "0edcb3b93ae1bc7dcc9649eb23cbe160e99dff83a87d6a697762a867141a58a8"
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
