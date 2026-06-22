<script lang="ts">
export const modelDigest = "25a19cbe99e84a9f4daf06d56a4f43a039827812a3623bc39919eb4683550b77"
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd"
</script>

<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue'
interface SidebarProps {
  "Collapsible"?: unknown
  "CollapsibleTrigger"?: unknown
  "MenuButton"?: unknown
  "MenuSubButton"?: unknown
  "Provider"?: unknown
  "root"?: unknown
  "SlidingView"?: unknown
  "SlidingViews"?: unknown
  fixture?: unknown
  semanticContent?: unknown
}
const props = withDefaults(defineProps<SidebarProps>(), {})
const slots = useSlots()
const styles: Record<string,string> = {}
const renderContent = () => props.semanticContent
const fixture = computed(() => props.fixture)
const semanticValues = Object.assign({}, useAttrs(), props) as Record<string, unknown>
const semanticEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right)
const fixtureText = (value: any): string => value && typeof value === 'object' ? String(typeof value.text === 'string' ? value.text : '') + (Array.isArray(value.children) ? value.children.map(fixtureText).join('') : '') : ''
</script>

<template>
  <template v-if="semanticEqual(fixture, {&quot;export&quot;:&quot;.Provider&quot;,&quot;props&quot;:{&quot;defaultOpen&quot;:false},&quot;children&quot;:[{&quot;export&quot;:&quot;root&quot;,&quot;props&quot;:{},&quot;children&quot;:[{&quot;export&quot;:&quot;.SlidingViews&quot;,&quot;props&quot;:{&quot;activeKey&quot;:&quot;account&quot;},&quot;children&quot;:[{&quot;export&quot;:&quot;.SlidingView&quot;,&quot;props&quot;:{&quot;value&quot;:&quot;account&quot;},&quot;children&quot;:[{&quot;text&quot;:&quot;Account nav&quot;}]},{&quot;export&quot;:&quot;.SlidingView&quot;,&quot;props&quot;:{&quot;value&quot;:&quot;zone&quot;},&quot;children&quot;:[{&quot;text&quot;:&quot;Zone nav&quot;}]}]},{&quot;export&quot;:&quot;.Trigger&quot;,&quot;props&quot;:{},&quot;children&quot;:[]}]}]})"><div data-state="collapsed"><aside data-state="collapsed"></aside></div></template><template v-else-if="semanticEqual(fixture, {&quot;export&quot;:&quot;.Provider&quot;,&quot;props&quot;:{},&quot;children&quot;:[{&quot;export&quot;:&quot;root&quot;,&quot;props&quot;:{},&quot;children&quot;:[{&quot;export&quot;:&quot;.Collapsible&quot;,&quot;props&quot;:{},&quot;children&quot;:[{&quot;export&quot;:&quot;.CollapsibleContent&quot;,&quot;props&quot;:{},&quot;children&quot;:[{&quot;text&quot;:&quot;Nested navigation&quot;}]}]}]}]})"><div></div></template><template v-else><div data-kumo-compound="sidebar" :class="styles.root"><section data-kumo-part="root"><slot name="root"></slot></section><section data-kumo-part="collection"><slot name="collection"></slot></section></div></template>
</template>
