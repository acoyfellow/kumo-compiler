<script lang="ts">
export const modelDigest = "fba8232e14f886639f5b9cf04c6dd04fc1c8b09852cd5feefd379fda9ded0e30"
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface AutocompleteProps {
  "compound"?: unknown
  "Content"?: unknown
  "InputGroup"?: unknown
  "root"?: unknown
}
const props = withDefaults(defineProps<AutocompleteProps>(), {})
const emit = defineEmits(["update:open","update:value","change"])
const styles: Record<string,string> = {"root":"kumo-autocomplete-root"}
const highlight = ref(undefined)
const root = ref<HTMLElement | null>(null)
</script>

<template>
  <div data-kumo-compound="autocomplete" :class="styles.root"><section data-kumo-part="root"><slot name="root"></slot></section><section data-kumo-part="collection"><slot name="collection"></slot></section></div>
</template>
