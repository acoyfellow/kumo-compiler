<template>
  <label
    >{{ label
    }}<input
      type="date"
      :value="value"
      @input="async (event) => onChange(event.target.value)"
  /></label>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "date-picker",

  props: ["label", "value", "onChange"],
});
</script>