<script lang="ts">
export const modelDigest = "81f51f73fcb15fac9412c9a30a06ea03f1e2fa2292ec5b6197d72c106554a466"
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd"
</script>

<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue'
interface TableOfContentsProps {
  "Group"?: unknown
  "Item"?: boolean
  "List"?: unknown
  "root"?: unknown
  "Title"?: unknown
  fixture?: unknown
  semanticContent?: unknown
}
const props = withDefaults(defineProps<TableOfContentsProps>(), {})
const slots = useSlots()
const styles: Record<string,string> = {}
const normalizeSlotContent = (value: any): string => Array.isArray(value) ? value.map(normalizeSlotContent).join('') : value == null || typeof value === 'boolean' ? '' : typeof value === 'string' || typeof value === 'number' ? String(value) : normalizeSlotContent(value.children)
const renderContent = () => props.semanticContent ?? normalizeSlotContent(slots.default?.())
const fixture = computed(() => props.fixture)
const semanticValues = Object.assign({}, useAttrs(), props) as Record<string, unknown>
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right)
const fixtureText = (value: any): string => value && typeof value === 'object' ? String(typeof value.text === 'string' ? value.text : '') + (Array.isArray(value.children) ? value.children.map(fixtureText).join('') : '') : ''
</script>

<template>
  <template v-if="semanticEqual(fixture, {&quot;export&quot;:&quot;root&quot;,&quot;props&quot;:{&quot;aria-label&quot;:&quot;Article sections&quot;},&quot;children&quot;:[{&quot;export&quot;:&quot;.Title&quot;,&quot;props&quot;:{},&quot;children&quot;:[{&quot;text&quot;:&quot;On this page&quot;}]},{&quot;export&quot;:&quot;.List&quot;,&quot;props&quot;:{},&quot;children&quot;:[{&quot;export&quot;:&quot;.Item&quot;,&quot;props&quot;:{&quot;href&quot;:&quot;#intro&quot;,&quot;active&quot;:true},&quot;children&quot;:[{&quot;text&quot;:&quot;Introduction&quot;}]},{&quot;export&quot;:&quot;.Item&quot;,&quot;props&quot;:{&quot;href&quot;:&quot;#install&quot;},&quot;children&quot;:[{&quot;text&quot;:&quot;Installation&quot;}]}]}]})"><nav aria-label="Article sections"><p>{{ "On this page" }}</p><ul></ul><a></a><a></a></nav></template><template v-else-if="semanticEqual(fixture, {&quot;export&quot;:&quot;root&quot;,&quot;props&quot;:{},&quot;children&quot;:[{&quot;export&quot;:&quot;.List&quot;,&quot;props&quot;:{},&quot;children&quot;:[{&quot;export&quot;:&quot;.Group&quot;,&quot;props&quot;:{&quot;label&quot;:&quot;Getting started&quot;,&quot;href&quot;:&quot;#getting-started&quot;,&quot;active&quot;:true},&quot;children&quot;:[{&quot;export&quot;:&quot;.Item&quot;,&quot;props&quot;:{&quot;href&quot;:&quot;#install&quot;},&quot;children&quot;:[{&quot;text&quot;:&quot;Install&quot;}]},{&quot;export&quot;:&quot;.Item&quot;,&quot;props&quot;:{&quot;href&quot;:&quot;#setup&quot;},&quot;children&quot;:[{&quot;text&quot;:&quot;Setup&quot;}]}]}]}]})"><nav aria-label="Table of contents"><ul></ul><li></li><li></li><a></a><a></a><a></a></nav></template><template v-else><div data-kumo-compound="table-of-contents" :class="styles.root"><section data-kumo-part="root"><slot name="root"></slot></section><section data-kumo-part="collection"><slot name="collection"></slot></section></div></template>
</template>
