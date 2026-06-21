<script lang="ts">
export const modelDigest = "067c8530a8b7c49b56d39fe9649b03d5a722ce64bb0b9bc7226a6296da3b6f18"
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface DropdownMenuProps {
  "CheckboxItem"?: unknown
  "Content/SubContent"?: unknown
  "Item"?: unknown
  "Label/Separator/Shortcut/Group"?: unknown
  "LinkItem"?: unknown
  "RadioGroup/RadioItem/RadioItemIndicator"?: unknown
  "Root"?: unknown
  "Sub/SubTrigger"?: unknown
  "Trigger"?: unknown
}
const props = withDefaults(defineProps<DropdownMenuProps>(), {})
const emit = defineEmits(["update:open","change"])
const styles: Record<string,string> = {"root":"kumo-dropdown-menu-root"}
const highlightedItem = ref(undefined)
const root = ref<HTMLElement | null>(null)
onMounted(() => { void props })
</script>

<template>
  <div data-kumo-compound="dropdown-menu" :class="styles.root"><section data-kumo-part="root"><slot name="root"></slot></section><section data-kumo-part="collection"><slot name="collection"></slot></section></div>
</template>
