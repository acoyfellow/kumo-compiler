<script lang="ts">
export const modelDigest = "2a86761805e0e78f84a2b578b9b43656181ffd9f47ad91f4c17c81f6977c99c7"
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface TableProps {
  "children"?: unknown
  "className"?: string
  "layout"?: unknown
}
const props = withDefaults(defineProps<TableProps>(), {"layout":"auto"})
const emit = defineEmits([])
const styles: Record<string,string> = {"root":"kumo-table-root"}
</script>

<template>
  <table :class="[styles[&quot;root&quot;]]"><slot /></table>
</template>
