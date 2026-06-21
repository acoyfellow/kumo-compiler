<script lang="ts">
export const modelDigest = "807df579a4b5811636f6c8ae3fbc56d8907ba572d3a57cf9b47ea9f266a81eca"
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface EmptyProps {
  "className"?: string
  "commandLine"?: string
  "contents"?: unknown
  "description"?: string
  "icon"?: unknown
  "size"?: string
  "title": string
}
const props = withDefaults(defineProps<EmptyProps>(), {"size":"base"})
const emit = defineEmits([])
const styles: Record<string,string> = {"root":"kumo-empty-root"}
</script>

<template>
  <section :class="[styles[&quot;root&quot;]]"><slot name="icon"></slot>{{ props.title }}<slot name="description"></slot><slot name="contents"></slot></section>
</template>
