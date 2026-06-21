<script lang="ts">
export const modelDigest = "ed2dc968d94168f193e43c4ace0c4c5a0eef92e88c8bbe1a3e168bf1f2b424b9"
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface SwitchProps {
  "checked"?: boolean
  "disabled"?: boolean
  "group"?: unknown
  "label"?: unknown
  "onCheckedChange"?: unknown
  "size"?: string
}
const props = withDefaults(defineProps<SwitchProps>(), {"checked":false,"disabled":false,"size":"base"})
const emit = defineEmits(["onCheckedChange","change"])
const styles: Record<string,string> = {"root":"kumo-switch-root"}
const controlled = ref(undefined)
</script>

<template>
  <button :class="[styles[&quot;root&quot;]]"></button>
</template>
