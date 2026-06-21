<script lang="ts">
export const modelDigest = "8c761d6a326088b816393ffb81fd67e64ad97a3299d323ad3078a93acebc0730"
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface LoaderProps {
  "aria-label"?: string
  "className"?: string
  "size"?: number
}
const props = withDefaults(defineProps<LoaderProps>(), {"aria-label":"Loading","size":"base"})
const emit = defineEmits([])
const styles: Record<string,string> = {"root":"kumo-loader-root"}
</script>

<template>
  <span :role="&quot;status&quot;" :aria-label="props.aria_label" :class="[styles[&quot;root&quot;]]"></span>
</template>
