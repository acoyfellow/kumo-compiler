<script lang="ts">
export const modelDigest = "c5e7d6281fea509e18399d83a7768d4533db188cdb59ddc8cbf2f1bd99e0dec1"
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface BannerProps {
  "action"?: unknown
  "children"?: unknown
  "className"?: string
  "description"?: unknown
  "icon"?: unknown
  "text"?: string
  "title"?: string
  "variant"?: unknown
}
const props = withDefaults(defineProps<BannerProps>(), {"variant":"default"})
const emit = defineEmits([])
const styles: Record<string,string> = {"root":"kumo-banner-root"}
</script>

<template>
  <section :class="[styles[&quot;root&quot;]]"><slot name="icon"></slot>{{ props.title }}<slot name="description"></slot><slot name="action"></slot><slot /></section>
</template>
