<script lang="ts">
export const modelDigest = "c8c1c62130c1f34d0061c3ea6adadfe4728a10920f9906960684ff48e50325c7"
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
