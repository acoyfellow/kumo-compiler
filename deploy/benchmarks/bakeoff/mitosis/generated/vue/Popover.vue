<template>
  <div>
    <button :aria-expanded="open" @click="async (event) => (open = !open)">
      {{ label }}
    </button>
    <div :hidden="!open"><slot /></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "popover",

  props: ["label"],

  data() {
    return { open: false };
  },
});
</script>