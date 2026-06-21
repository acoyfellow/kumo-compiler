<script lang="ts">
export const modelDigest = "d09e3c2183930eb35b4c558193926c71ea15e98aba97c8e6179a1afdf7c60d63"
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface FieldProps {
  "observable"?: unknown
}
const props = withDefaults(defineProps<FieldProps>(), {})
const emit = defineEmits(["change"])
const styles: Record<string,string> = {"root":"kumo-field-root"}
const root = ref<HTMLElement | null>(null)
</script>

<template>
  <field :class="[styles[&quot;root&quot;]]"></field>
</template>
