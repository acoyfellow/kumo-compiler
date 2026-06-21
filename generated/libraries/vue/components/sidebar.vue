<script lang="ts">
export const modelDigest = "4c801e32de9aeeb481f09910a3cf18fe74e2893bb998ef9d4abdf950ffda4b13"
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface SidebarProps {
  "Collapsible"?: unknown
  "CollapsibleTrigger"?: unknown
  "MenuButton"?: unknown
  "MenuSubButton"?: unknown
  "Provider"?: unknown
  "root"?: unknown
  "SlidingView"?: unknown
  "SlidingViews"?: unknown
}
const props = withDefaults(defineProps<SidebarProps>(), {})
const emit = defineEmits(["change"])
const styles: Record<string,string> = {"root":"kumo-sidebar-root"}
const isPeeking = ref(false)
const root = ref<HTMLElement | null>(null)
onMounted(() => { void globalThis })
</script>

<template>
  <div data-kumo-compound="sidebar" :class="styles.root"><section data-kumo-part="root"><slot name="root"></slot></section><section data-kumo-part="collection"><slot name="collection"></slot></section></div>
</template>
