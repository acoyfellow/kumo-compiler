<script setup lang="ts">
defineOptions({ inheritAttrs: false })
</script>

<template>
  <span v-bind="$attrs" data-kumo-part="Link"><slot /></span>
</template>
