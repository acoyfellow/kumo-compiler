<script setup>
const p = defineProps({ label:String, disabled:Boolean, value:String, placeholder:String, error:String, description:String })
</script>
<template><label class="kumo-label">{{ p.label }}<select class="kumo-control" :disabled="p.disabled" :value="p.value"><option v-if="p.placeholder" disabled>{{ p.placeholder }}</option><option>Apple</option><option>Banana</option><option>Cherry</option></select><span v-if="p.error" class="kumo-error">{{ p.error }}</span><span v-else-if="p.description" class="kumo-description">{{ p.description }}</span></label></template>
