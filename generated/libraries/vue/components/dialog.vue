<script lang="ts">
export const modelDigest = "b69b28139a711d8e96dd6ddf236811e0a1c5d9510c961808f6912e09a2d48997"
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface DialogProps {
  "Close"?: unknown
  "Description"?: unknown
  "Dialog"?: unknown
  "Root"?: string
  "Title"?: unknown
  "Trigger"?: unknown
}
const props = withDefaults(defineProps<DialogProps>(), {})
const emit = defineEmits(["update:open","change"])
const styles: Record<string,string> = {"root":"kumo-dialog-root"}
const role = ref(undefined)
const root = ref<HTMLElement | null>(null)
onMounted(() => { void props })
</script>

<template>
  <Teleport :to="&quot;document-body&quot;"><div data-kumo-layer="dialog"><div data-kumo-compound="dialog" :class="styles.root"><section data-kumo-part="dialog"><slot name="dialog"></slot></section></div></div></Teleport>
</template>
