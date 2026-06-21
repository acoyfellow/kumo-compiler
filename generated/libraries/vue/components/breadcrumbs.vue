<script lang="ts">
export const modelDigest = "7a7f2d6ea60be21b23d218781fadea8b534345fab15d5b0896600e503857eb65"
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
