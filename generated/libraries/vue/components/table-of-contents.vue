<script lang="ts">
export const modelDigest = "e48b4239cfca5e769df53ef328dfaf3f910bf892b503c032b84e02002bb57789"
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface TableOfContentsProps {
  "Group"?: unknown
  "Item"?: boolean
  "List"?: unknown
  "root"?: unknown
  "Title"?: unknown
}
const props = withDefaults(defineProps<TableOfContentsProps>(), {})
const emit = defineEmits(["change"])
const styles: Record<string,string> = {"root":"kumo-table-of-contents-root"}
const active = ref(undefined)
</script>

<template>
  <div data-kumo-compound="table-of-contents" :class="styles.root"><section data-kumo-part="root"><slot name="root"></slot></section><section data-kumo-part="collection"><slot name="collection"></slot></section></div>
</template>
