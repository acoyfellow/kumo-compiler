<script lang="ts">
export const modelDigest = "48798c8ab5bf8d756056311749cd7d344b6c82b50134d057656d5f6e4cad48aa"
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface ButtonProps {
  "disabled"?: boolean
  "icon"?: unknown
  "loading"?: boolean
  "native"?: unknown
  "shape"?: string
  "size"?: string
  "variant"?: string
}
const props = withDefaults(defineProps<ButtonProps>(), {"loading":false,"shape":"base","size":"base","variant":"secondary"})
const emit = defineEmits(["change"])
const styles: Record<string,string> = {"root":"kumo-button-root"}
</script>

<template>
  <button :class="[styles[&quot;root&quot;]]"></button>
</template>
