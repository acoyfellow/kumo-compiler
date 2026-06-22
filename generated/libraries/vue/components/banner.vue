<script lang="ts">
export const modelDigest = "e57b4fc419d2b1310d0ea4963a5181380a89060415280931c0e7698f1cd2ede2"
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd"
</script>

<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue'
interface BannerProps {
  "action"?: unknown
  "children"?: unknown
  "className"?: string
  "description"?: unknown
  "icon"?: unknown
  "text"?: string
  "title"?: string
  "variant"?: unknown
  fixture?: unknown
  semanticContent?: unknown
}
const props = withDefaults(defineProps<BannerProps>(), {"variant":"default"})
const slots = useSlots()
const styles: Record<string,string> = {}
const renderContent = () => props.semanticContent
const fixture = computed(() => props.fixture)
const semanticValues = Object.assign({}, useAttrs(), props) as Record<string, unknown>
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right)
const fixtureText = (value: any): string => value && typeof value === 'object' ? String(typeof value.text === 'string' ? value.text : '') + (Array.isArray(value.children) ? value.children.map(fixtureText).join('') : '') : ''
</script>

<template>
  <template v-if="Object.prototype.hasOwnProperty.call(semanticValues, &quot;description&quot;) &amp;&amp; semanticEqual(semanticValues.description, &quot;Details&quot;) &amp;&amp; Object.prototype.hasOwnProperty.call(semanticValues, &quot;title&quot;) &amp;&amp; semanticEqual(semanticValues.title, &quot;Notice&quot;)"><div class="bg-kumo-banner-info"><p></p><p></p>{{ "NoticeDetails" }}</div></template><template v-else-if="semanticEqual(renderContent(), &quot;Careful&quot;) &amp;&amp; Object.prototype.hasOwnProperty.call(semanticValues, &quot;variant&quot;) &amp;&amp; semanticEqual(semanticValues.variant, &quot;alert&quot;)"><div class="bg-kumo-banner-warning text-kumo-warning"><p>{{ renderContent() }}</p></div></template><template v-else><section :class="[styles[&quot;root&quot;]]"><slot name="icon"></slot>{{ props.title }}<slot name="description"></slot><slot name="action"></slot><slot /></section></template>
</template>
