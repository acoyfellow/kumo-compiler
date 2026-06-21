<script lang="ts">
export const modelDigest = "1f41380c0300c6ab1aa370e5a96ed529bb1bdfb6d60bfcaaa9df23cd23dd8b07"
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
