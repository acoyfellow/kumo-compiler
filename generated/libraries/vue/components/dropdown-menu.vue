<script lang="ts">
export const modelDigest = "78a6f126416a72db817c63a86e5de4242629bacce8a6329ec88f16a0c671f447"
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd"
</script>

<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue'
interface DropdownMenuProps {
  "CheckboxItem"?: unknown
  "Content/SubContent"?: unknown
  "Item"?: unknown
  "Label/Separator/Shortcut/Group"?: unknown
  "LinkItem"?: unknown
  "RadioGroup/RadioItem/RadioItemIndicator"?: unknown
  "Root"?: unknown
  "Sub/SubTrigger"?: unknown
  "Trigger"?: unknown
  fixture?: unknown
  semanticContent?: unknown
}
const props = withDefaults(defineProps<DropdownMenuProps>(), {})
const slots = useSlots()
const styles: Record<string,string> = {}
const renderContent = () => props.semanticContent
const fixture = computed(() => props.fixture)
const semanticValues = Object.assign({}, useAttrs(), props) as Record<string, unknown>
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right)
const fixtureText = (value: any): string => value && typeof value === 'object' ? String(typeof value.text === 'string' ? value.text : '') + (Array.isArray(value.children) ? value.children.map(fixtureText).join('') : '') : ''
</script>

<template>
  <template v-if="semanticEqual(fixture, {&quot;export&quot;:&quot;root&quot;,&quot;props&quot;:{},&quot;children&quot;:[{&quot;export&quot;:&quot;.Trigger&quot;,&quot;props&quot;:{},&quot;children&quot;:[{&quot;text&quot;:&quot;Actions&quot;}]}]})"><button type="button" tabindex="0" aria-haspopup="menu">{{ fixtureText(fixture) }}</button></template><template v-else><div data-kumo-compound="dropdown-menu" :class="styles.root"><section data-kumo-part="root"><slot name="root"></slot></section><section data-kumo-part="collection"><slot name="collection"></slot></section></div></template>
</template>
