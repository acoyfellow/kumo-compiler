<script lang="ts">
export const modelDigest = "60219ad3fa185b8a9db3e82cc4fc77b1b0683b2881bcf6b0460646bb320e67c2"
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface TextProps {
  "as"?: unknown
  "bold"?: boolean
  "children"?: unknown
  "DANGEROUS_className"?: string
  "DANGEROUS_style"?: unknown
  "size"?: string
  "truncate"?: boolean
  "variant"?: unknown
}
const props = withDefaults(defineProps<TextProps>(), {"bold":false,"size":"base","truncate":false,"variant":"body"})
const emit = defineEmits([])
const styles: Record<string,string> = {"root":"kumo-text-root"}
</script>

<template>
  <span :class="[styles[&quot;root&quot;]]"><slot /></span>
</template>
