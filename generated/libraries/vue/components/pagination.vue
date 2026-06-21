<script lang="ts">
export const modelDigest = "8a03b02a4e86e5ee4971e869b775b7efd73bc7e61116c5e794612f2402b7dd2d"
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface PaginationProps {
  "compound"?: unknown
  "controls"?: unknown
  "labels"?: unknown
  "page"?: number
  "pageSelector"?: unknown
  "perPage"?: number
  "setPage"?: unknown
  "totalCount"?: number
}
const props = withDefaults(defineProps<PaginationProps>(), {"controls":"full","labels":"English canonical labels","page":1,"pageSelector":"input"})
const emit = defineEmits(["update:page","change"])
const styles: Record<string,string> = {"root":"kumo-pagination-root"}
const editingPage = ref(undefined)
onMounted(() => { void globalThis })
</script>

<template>
  <div data-kumo-compound="pagination" :class="styles.root"><section data-kumo-part="root"><slot name="root"></slot></section><section data-kumo-part="collection"><slot name="collection"></slot></section></div>
</template>
