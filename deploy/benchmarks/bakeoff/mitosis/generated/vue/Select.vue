<template>
  <label
    >{{ label
    }}<select
      :value="value"
      @change="async (event) => onChange(event.target.value)"
    >
      <template :key="index" v-for="(option, index) in options">
        <option :value="option">{{ option }}</option>
      </template>
    </select></label
  >
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "select",

  props: ["label", "value", "onChange", "options"],
});
</script>