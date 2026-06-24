<script setup>
import Button from '../Button.vue'
import Checkbox from '../Checkbox.vue'
import Field from '../Field.vue'
import Popover from '../Popover.vue'
const props = defineProps({ component: String, state: String })
const components = { button: Button, checkbox: Checkbox, field: Field, popover: Popover }
function operation(detail) { globalThis.__events.push({ type: detail.operation, ...(detail.value === undefined ? {} : { value: detail.value }) }) }
</script>
<template><component :is="components[props.component]" :state="props.state" @operation="operation" /></template>
