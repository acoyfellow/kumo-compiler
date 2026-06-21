<template>
  <label
    >{{ label
    }}<input
      :value="value"
      @input="async (event) => onInput(event.target.value)"
  /></label>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "field",

  props: ["label", "value", "onInput"],
});
</script>