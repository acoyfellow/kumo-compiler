<script setup lang="ts">
defineOptions({ inheritAttrs: false })
</script>

<template>
  <span v-bind="$attrs" data-kumo-part="SubContent"><slot /></span>
</template>
