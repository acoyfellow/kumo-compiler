<script lang="ts">
export const modelDigest = "1cb602a165516ca01de95379b40403eb61ab498fa6557f44ddeb0f0f5d0d9e4f"
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface BreadcrumbsProps {
  "children"?: unknown
  "className"?: string
  "size"?: string
}
const props = withDefaults(defineProps<BreadcrumbsProps>(), {"size":"base"})
const emit = defineEmits([])
const styles: Record<string,string> = {"root":"kumo-breadcrumbs-root"}
</script>

<template>
  <nav :aria-label="&quot;Breadcrumbs&quot;" :class="[styles[&quot;root&quot;]]"><slot /></nav>
</template>
