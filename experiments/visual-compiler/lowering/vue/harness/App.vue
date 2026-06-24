<script setup>
// Generic harness: dynamically load EVERY generated SFC and key by lowercased
// basename (e.g. Button.vue -> "button", DateRangePicker.vue -> "date-range-picker").
// No per-component hardcoding; scales with the IR automatically.
const modules = import.meta.glob('../generated/*.vue', { eager: true })
const components = {}
for (const [path, mod] of Object.entries(modules)) {
  const base = path.split('/').pop().replace(/\.vue$/, '')
  const key = base.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
  components[key] = mod.default
}
const props = defineProps({ component: String, state: String })
function operation(detail) { globalThis.__events.push({ type: detail.operation, ...(detail.value === undefined ? {} : { value: detail.value }) }) }
</script>
<template><component :is="components[props.component]" :state="props.state" @operation="operation" /></template>
