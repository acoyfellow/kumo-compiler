<script lang="ts">
export const modelDigest = "aec5871cdfdf97c938fb06aeb6a15dedd413550ce59bca231f5fe2e61f6d347c"
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd"
</script>

<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue'
interface InputGroupProps {
  "observable"?: unknown
  fixture?: unknown
  semanticContent?: unknown
}
const props = withDefaults(defineProps<InputGroupProps>(), {})
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
  <template v-if="semanticEqual(fixture, {&quot;export&quot;:&quot;root&quot;,&quot;props&quot;:{&quot;label&quot;:&quot;Search&quot;,&quot;description&quot;:&quot;Help&quot;,&quot;required&quot;:true},&quot;children&quot;:[{&quot;export&quot;:&quot;.Addon&quot;,&quot;props&quot;:{},&quot;children&quot;:[{&quot;text&quot;:&quot;$&quot;}]},{&quot;export&quot;:&quot;.Input&quot;,&quot;props&quot;:{&quot;aria-label&quot;:&quot;Search&quot;},&quot;children&quot;:[]},{&quot;export&quot;:&quot;.Button&quot;,&quot;props&quot;:{&quot;variant&quot;:&quot;secondary&quot;},&quot;children&quot;:[{&quot;text&quot;:&quot;Go&quot;}]},{&quot;export&quot;:&quot;.Suffix&quot;,&quot;props&quot;:{},&quot;children&quot;:[{&quot;text&quot;:&quot;USD&quot;}]}]})"><div></div></template><template v-else><input-group :class="[styles[&quot;root&quot;]]"></input-group></template>
</template>
