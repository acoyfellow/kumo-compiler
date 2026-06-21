<script lang="ts">
export const modelDigest = "c9dad696330b10c952f02f411171c962c2770f5c4b53cf81713d0397ef61abf8"
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
