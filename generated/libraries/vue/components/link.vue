<script lang="ts">
export const modelDigest = "c6f0fbd6318e25df8755e6c0053fe1d74c23861e6bcc3f9256588ac62b9fa195"
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface LinkProps {
  "children"?: unknown
  "className"?: string
  "href"?: string
  "render"?: unknown
  "variant"?: unknown
}
const props = withDefaults(defineProps<LinkProps>(), {"variant":"inline"})
const emit = defineEmits([])
const styles: Record<string,string> = {"root":"kumo-link-root"}
</script>

<template>
  <a :href="props.href" :class="[styles[&quot;root&quot;]]"><slot /></a>
</template>
