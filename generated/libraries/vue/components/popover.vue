<script lang="ts">
export const modelDigest = "ad3f10680d31c621c1bc54e0a910834f60fbc9d5776de398d94abac24dc0d45d"
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface PopoverProps {
  "Close"?: unknown
  "Content"?: unknown
  "Root"?: unknown
  "Title/Description"?: unknown
  "Trigger"?: unknown
}
const props = withDefaults(defineProps<PopoverProps>(), {})
const emit = defineEmits(["update:open","change"])
const styles: Record<string,string> = {"root":"kumo-popover-root"}
const focus = ref(undefined)
onMounted(() => { void globalThis })
</script>

<template>
  <Teleport :to="&quot;document-body&quot;"><div data-kumo-layer="popover"><div data-kumo-compound="popover" :class="styles.root"><section data-kumo-part="popover"><slot name="popover"></slot></section></div></div></Teleport>
</template>
