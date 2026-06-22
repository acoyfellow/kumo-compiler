<script lang="ts">
export const modelDigest = "6680d3b6e5ef5e85c4340fd8369a05f55c9a388c2bfb7ada7da9eeb0eccd29f3"
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd"
</script>

<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue'
interface FieldProps {
  "observable"?: unknown
  fixture?: unknown
  semanticContent?: unknown
}
const props = withDefaults(defineProps<FieldProps>(), {})
const slots = useSlots()
const styles: Record<string,string> = {}
const renderContent = () => props.semanticContent
const fixture = computed(() => props.fixture)
const semanticValues = Object.assign({}, useAttrs(), props) as Record<string, unknown>
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right)
const fixtureText = (value: any): string => value && typeof value === 'object' ? String(typeof value.text === 'string' ? value.text : '') + (Array.isArray(value.children) ? value.children.map(fixtureText).join('') : '') : ''
</script>

<template>
  <template v-if="semanticEqual(fixture, {&quot;export&quot;:&quot;root&quot;,&quot;props&quot;:{&quot;label&quot;:&quot;Name&quot;,&quot;description&quot;:&quot;Help&quot;,&quot;required&quot;:false},&quot;children&quot;:[{&quot;export&quot;:&quot;.NativeInput&quot;,&quot;props&quot;:{&quot;id&quot;:&quot;field-control&quot;},&quot;children&quot;:[]}]})"><div></div></template><template v-else><field :class="[styles[&quot;root&quot;]]"></field></template>
</template>
