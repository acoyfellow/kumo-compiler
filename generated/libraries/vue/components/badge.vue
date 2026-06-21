<script lang="ts">
export const modelDigest = "67f224503fcce1b354d3848ac5a55b55587789af9fe0688a4849fef4ad5c8ec5"
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface BadgeProps {
  "appearance"?: unknown
  "children": unknown
  "className"?: string
  "variant"?: string
}
const props = withDefaults(defineProps<BadgeProps>(), {"appearance":"filled","variant":"primary"})
const emit = defineEmits([])
const styles: Record<string,string> = {"root":"kumo-badge-root"}
</script>

<template>
  <span :class="[styles[&quot;root&quot;]]"><slot /></span>
</template>
