<template>
  <div role="dialog" aria-modal="true" :aria-label="title" :hidden="!open">
    <slot /><button @click="async (event) => onClose()">Close</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "dialog",

  props: ["title", "open", "onClose"],
});
</script>