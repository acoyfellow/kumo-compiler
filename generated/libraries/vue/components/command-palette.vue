<script lang="ts">
export const modelDigest = "7e72307448756ba3dce186fdd6d001623e82bf54634bcb1dd046b6ec82f31bf6"
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface CommandPaletteProps {
  "compound"?: unknown
  "Dialog"?: unknown
  "Input"?: unknown
  "Panel"?: string
  "Root"?: string
}
const props = withDefaults(defineProps<CommandPaletteProps>(), {})
const emit = defineEmits(["update:open","change"])
const styles: Record<string,string> = {"root":"kumo-command-palette-root"}
const modal = ref(true)
const root = ref<HTMLElement | null>(null)
onMounted(() => { void props })
</script>

<template>
  <div data-kumo-compound="command-palette" :class="styles.root"><section data-kumo-part="root"><slot name="root"></slot></section><section data-kumo-part="collection"><slot name="collection"></slot></section></div>
</template>
