<script setup>
import Button from '../generated/Button.vue'
import Checkbox from '../generated/Checkbox.vue'
import Field from '../generated/Field.vue'
import Popover from '../generated/Popover.vue'
const props = defineProps({ component: String, state: String })
const components = { button: Button, checkbox: Checkbox, field: Field, popover: Popover }
function operation(detail) { globalThis.__events.push({ type: 'operation', operation: detail.operation, state: detail.state }) }
</script>
<template><main><component :is="components[props.component]" :state="props.state" @operation="operation" /></main></template>
