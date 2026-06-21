<script lang="ts">
export const modelDigest = "ce6505b3ce28964f1d8bb565e8a04a6c23ab186f8a5afc3a83dc631e65c3914e"
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface SurfaceProps {
  "as"?: unknown
  "children"?: unknown
  "className"?: string
  "color"?: string
  "render"?: unknown
}
const props = withDefaults(defineProps<SurfaceProps>(), {"color":"primary"})
const emit = defineEmits([])
const styles: Record<string,string> = {"root":"kumo-surface-root"}
</script>

<template>
  <div :class="[styles[&quot;root&quot;]]"><slot /></div>
</template>
