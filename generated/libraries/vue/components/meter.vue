<script lang="ts">
export const modelDigest = "2201de1a1ed8a66d0925c6dae8b6b3197097ad332ed86e9b694f8d7383c8c284"
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface MeterProps {
  "className"?: string
  "customValue"?: string
  "indicatorClassName"?: string
  "label": string
  "max"?: number
  "min"?: number
  "showValue"?: boolean
  "trackClassName"?: string
  "value"?: number
}
const props = withDefaults(defineProps<MeterProps>(), {"max":100,"min":0,"showValue":true})
const emit = defineEmits([])
const styles: Record<string,string> = {"root":"kumo-meter-root"}
</script>

<template>
  <div :class="[styles[&quot;root&quot;]]">{{ props.label }}<meter :class="[styles[&quot;root&quot;]]"></meter><template v-if="props.showValue">{{ (props.customValue ?? props.value) }}</template></div>
</template>
