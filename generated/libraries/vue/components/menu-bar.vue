<script lang="ts">
export const modelDigest = "40c08fc1e03b3a7d723ec35135cb4cf3a2605d12368398588dcda6818ce453ea"
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface MenuBarProps {
  "className"?: string
  "isActive"?: boolean
  "optionIds"?: boolean
  "options"?: unknown
}
const props = withDefaults(defineProps<MenuBarProps>(), {"optionIds":false})
const emit = defineEmits(["change"])
const styles: Record<string,string> = {"root":"kumo-menu-bar-root"}
const focus = ref(undefined)
const root = ref<HTMLElement | null>(null)
</script>

<template>
  <div data-kumo-compound="menu-bar" :class="styles.root"><section data-kumo-part="root"><slot name="root"></slot></section><section data-kumo-part="collection"><slot name="collection"></slot></section></div>
</template>
