<script lang="ts">
export const modelDigest = "4af0c8a7d7b8b60e856eaff59dc37b9cf13972ebeb4a5efd3e6776a353898221"
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
