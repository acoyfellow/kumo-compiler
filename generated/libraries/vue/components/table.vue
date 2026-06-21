<script lang="ts">
export const modelDigest = "9d4b8d811da622ddf7ca92cd6b3f7e4f76e0d35094bab50ce0d03c2e4bde88ba"
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
