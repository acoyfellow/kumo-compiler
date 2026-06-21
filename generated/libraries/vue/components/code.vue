<script lang="ts">
export const modelDigest = "5e7c1a6e6d7b7973979fc806a00d8999299a443db7eda7b9234417bc397a0fba"
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface CodeProps {
  "className"?: string
  "code": string
  "lang"?: unknown
  "style"?: unknown
  "values"?: unknown
}
const props = withDefaults(defineProps<CodeProps>(), {"lang":"ts"})
const emit = defineEmits([])
const styles: Record<string,string> = {"root":"kumo-code-root"}
</script>

<template>
  <code :class="[styles[&quot;root&quot;]]">{{ props.code }}</code>
</template>
