<template>
  <button
    type="button"
    :disabled="disabled"
    @click="async (event) => onClick()"
  >
    <slot />
  </button>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "button",

  props: ["disabled", "onClick"],
});
</script>