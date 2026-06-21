<script lang="ts">
export const modelDigest = "b431b499c0e47a951de0104395b33980461e37f3410131f5ddf2fc8c2223070f"
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface ComboboxProps {
  "compound"?: unknown
  "Content"?: unknown
  "root"?: unknown
  "TriggerInput"?: unknown
  "TriggerMultipleWithInput"?: unknown
  "variants"?: string
}
const props = withDefaults(defineProps<ComboboxProps>(), {})
const emit = defineEmits(["update:open","change"])
const styles: Record<string,string> = {"root":"kumo-combobox-root"}
const multiple = ref(undefined)
const root = ref<HTMLElement | null>(null)
</script>

<template>
  <div data-kumo-compound="combobox" :class="styles.root"><section data-kumo-part="root"><slot name="root"></slot></section><section data-kumo-part="collection"><slot name="collection"></slot></section></div>
</template>
