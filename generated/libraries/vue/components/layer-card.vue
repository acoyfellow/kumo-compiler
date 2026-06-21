<script lang="ts">
export const modelDigest = "0863b724219652fb6b34a5c3bc5564e8fc766a990f62178c6a66e5f17aa8ae1f"
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface LayerCardProps {
  "children"?: unknown
  "className"?: string
  "render"?: unknown
}
const props = withDefaults(defineProps<LayerCardProps>(), {})
const emit = defineEmits([])
const styles: Record<string,string> = {"root":"kumo-layer-card-root"}
</script>

<template>
  <div :class="[styles[&quot;root&quot;]]"><slot /></div>
</template>
