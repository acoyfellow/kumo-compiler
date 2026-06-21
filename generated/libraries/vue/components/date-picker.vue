<script lang="ts">
export const modelDigest = "efe6ee1704bcfdd921aefd2a33601d5193d45c82454eadc21af9261b848e1bc6"
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface DatePickerProps {
  "aria-label"?: string
  "fromDate"?: unknown
  "mode"?: unknown
  "onChange"?: unknown
  "reactDayPickerProps"?: unknown
  "selected"?: unknown
  "toDate"?: unknown
}
const props = withDefaults(defineProps<DatePickerProps>(), {})
const emit = defineEmits(["onChange","update:selected","change"])
const styles: Record<string,string> = {"root":"kumo-date-picker-root"}
const selected = ref(undefined)
</script>

<template>
  <Teleport :to="&quot;document-body&quot;"><div data-kumo-layer="date-picker"><div data-kumo-compound="date-picker" :class="styles.root"><section data-kumo-part="date-picker"><slot name="date-picker"></slot></section></div></div></Teleport>
</template>
