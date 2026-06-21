<script lang="ts">
export const modelDigest = "50b2371be89b11ae83917c42fdb9b67c42df8467c98e2668e0540afd07dc8c58"
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface CloudflareLogoProps {
  "className"?: string
  "color"?: unknown
  "variant"?: unknown
}
const props = withDefaults(defineProps<CloudflareLogoProps>(), {"color":"color","variant":"full"})
const emit = defineEmits([])
const styles: Record<string,string> = {"root":"kumo-cloudflare-logo-root"}
</script>

<template>
  <svg :role="&quot;img&quot;" :aria-label="&quot;Cloudflare&quot;" :class="[styles[&quot;root&quot;]]"></svg>
</template>
