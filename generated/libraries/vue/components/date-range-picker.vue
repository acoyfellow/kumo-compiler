<script lang="ts">
export const modelDigest = "24c51f801cb83e8ae05a575e5e3e012c1f46065f0d1fda618759efe36487bc38"
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface DateRangePickerProps {
  "className"?: string
  "onEndDateChange"?: unknown
  "onStartDateChange"?: unknown
  "size"?: string
  "timezone"?: string
  "variant"?: unknown
}
const props = withDefaults(defineProps<DateRangePickerProps>(), {"size":"base","timezone":"New York, NY, USA (GMT-4)","variant":"default"})
const emit = defineEmits(["onEndDateChange","onStartDateChange","update:endDate","update:startDate","change"])
const styles: Record<string,string> = {"root":"kumo-date-range-picker-root"}
const months = ref(undefined)
</script>

<template>
  <Teleport :to="&quot;document-body&quot;"><div data-kumo-layer="date-range-picker"><div data-kumo-compound="date-range-picker" :class="styles.root"><section data-kumo-part="date-range-picker"><slot name="date-range-picker"></slot></section></div></div></Teleport>
</template>
