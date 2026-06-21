<script lang="ts">
export const modelDigest = "914b6bbf31750fa0d8ea618a40c6abab812fc940fed7557bc9b8630e58fe76d7"
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface GridItemProps {
  "children"?: unknown
  "className"?: string
}
const props = withDefaults(defineProps<GridItemProps>(), {})
const emit = defineEmits([])
const styles: Record<string,string> = {"root":"kumo-grid-item-root"}
</script>

<template>
  <div :class="[styles[&quot;root&quot;]]"><slot /></div>
</template>
