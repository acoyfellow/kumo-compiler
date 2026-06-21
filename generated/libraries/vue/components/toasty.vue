<script lang="ts">
export const modelDigest = "96819ff5ff77c94bea48a81f92da6a4857acc3495fbbd3f4eb7703e24db317d6"
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface ToastyProps {
  "children"?: unknown
  "container"?: unknown
  "toastManager"?: unknown
  "variant"?: unknown
}
const props = withDefaults(defineProps<ToastyProps>(), {"container":"provider container or document.body","variant":"default"})
const emit = defineEmits(["change"])
const styles: Record<string,string> = {"root":"kumo-toasty-root"}
const viewport = ref(undefined)
onMounted(() => { void globalThis })
</script>

<template>
  <div data-kumo-compound="toasty" :class="styles.root"><section data-kumo-part="root"><slot name="root"></slot></section><section data-kumo-part="collection"><slot name="collection"></slot></section></div>
</template>
