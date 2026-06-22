<script lang="ts">
export const modelDigest = "d61594f3236e8d7e4602671f3db5548b0873d563cfc52c9d9249597042a2cf31"
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd"
</script>

<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue'
interface BadgeProps {
  "appearance"?: unknown
  "children"?: unknown
  "className"?: string
  "variant"?: string
  fixture?: unknown
  semanticContent?: unknown
}
const props = withDefaults(defineProps<BadgeProps>(), {"appearance":"filled","variant":"primary"})
const slots = useSlots()
const styles: Record<string,string> = {}
const renderContent = () => props.semanticContent
const fixture = computed(() => props.fixture)
const semanticValues = Object.assign({}, useAttrs(), props) as Record<string, unknown>
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right)
const fixtureText = (value: any): string => value && typeof value === 'object' ? String(typeof value.text === 'string' ? value.text : '') + (Array.isArray(value.children) ? value.children.map(fixtureText).join('') : '') : ''
</script>

<template>
  <template v-if="Object.prototype.hasOwnProperty.call(semanticValues, &quot;appearance&quot;) &amp;&amp; semanticEqual(semanticValues.appearance, &quot;dot&quot;) &amp;&amp; semanticEqual(renderContent(), &quot;Healthy&quot;) &amp;&amp; Object.prototype.hasOwnProperty.call(semanticValues, &quot;variant&quot;) &amp;&amp; semanticEqual(semanticValues.variant, &quot;success&quot;)"><span><span aria-hidden="true" class="bg-kumo-success"></span>{{ renderContent() }}</span></template><template v-else-if="semanticEqual(renderContent(), &quot;PRO&quot;)"><span class="inline-flex bg-kumo-badge-inverted">{{ renderContent() }}</span></template><template v-else><span :class="[styles[&quot;root&quot;]]"><slot /></span></template>
</template>
