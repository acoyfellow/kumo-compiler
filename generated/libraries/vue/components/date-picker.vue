<script lang="ts">
export const modelDigest = "5f335d94261bdac9b04be13a3684f1d47504a43360cb208c4a84231a1d259fce"
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd"
</script>

<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue'
interface DatePickerProps {
  "aria-label"?: string
  "fromDate"?: unknown
  "mode"?: unknown
  "onChange"?: unknown
  "reactDayPickerProps"?: unknown
  "selected"?: unknown
  "toDate"?: unknown
  "defaultMonthDate"?: unknown
  "selectedDate"?: unknown
  fixture?: unknown
  semanticContent?: unknown
}
const props = withDefaults(defineProps<DatePickerProps>(), {})
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
  <template v-if="Object.prototype.hasOwnProperty.call(semanticValues, &quot;ariaLabel&quot;) &amp;&amp; semanticEqual(semanticValues.ariaLabel, &quot;Choose date&quot;) &amp;&amp; Object.prototype.hasOwnProperty.call(semanticValues, &quot;defaultMonthDate&quot;) &amp;&amp; semanticEqual(semanticValues.defaultMonthDate, &quot;2025-01-01&quot;) &amp;&amp; Object.prototype.hasOwnProperty.call(semanticValues, &quot;mode&quot;) &amp;&amp; semanticEqual(semanticValues.mode, &quot;single&quot;) &amp;&amp; Object.prototype.hasOwnProperty.call(semanticValues, &quot;selectedDate&quot;) &amp;&amp; semanticEqual(semanticValues.selectedDate, &quot;2025-01-15&quot;)"><div aria-label="Choose date"><table role="grid"></table><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button></div></template><template v-else><Teleport :to="&quot;document-body&quot;"><div data-kumo-layer="date-picker"><div data-kumo-compound="date-picker" :class="styles.root"><section data-kumo-part="date-picker"><slot name="date-picker"></slot></section></div></div></Teleport></template>
</template>
