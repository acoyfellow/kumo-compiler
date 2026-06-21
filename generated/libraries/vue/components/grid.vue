<script lang="ts">
export const modelDigest = "9dbbb8c1edc23a0a1b2ed65add8ac4c1a675b5b9f0afbdb9eae72871c290ace3"
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface GridProps {
  "children"?: unknown
  "className"?: string
  "gap"?: string
  "mobileDivider"?: boolean
  "variant"?: unknown
}
const props = withDefaults(defineProps<GridProps>(), {"gap":"base"})
const emit = defineEmits([])
const styles: Record<string,string> = {"root":"kumo-grid-root"}
</script>

<template>
  <div :class="[styles[&quot;root&quot;]]"><slot /></div>
</template>
