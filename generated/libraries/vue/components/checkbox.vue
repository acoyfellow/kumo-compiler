<script lang="ts">
export const modelDigest = "fe575b56fa0db80a1e83a5b6976f0303f63a8f6ab45de9ba8f5abfb19d9a935f"
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface CheckboxProps {
  "checked"?: boolean
  "disabled"?: boolean
  "group"?: unknown
  "indeterminate"?: boolean
  "label"?: unknown
  "onCheckedChange"?: unknown
}
const props = withDefaults(defineProps<CheckboxProps>(), {"checked":false,"disabled":false,"indeterminate":false})
const emit = defineEmits(["onCheckedChange","change"])
const styles: Record<string,string> = {"root":"kumo-checkbox-root"}
const controlled = ref(undefined)
</script>

<template>
  <input :class="[styles[&quot;root&quot;]]"></input>
</template>
