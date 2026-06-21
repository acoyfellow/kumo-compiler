<template>
  <div>
    <div role="tablist">
      <template :key="index" v-for="(label, index) in labels">
        <button
          role="tab"
          :aria-selected="active === index"
          @click="async (event) => (active = index)"
        >
          {{ label }}
        </button>
      </template>
    </div>
    <div role="tabpanel">{{ labels[active] }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "tabs",

  props: ["labels"],

  data() {
    return { active: 0 };
  },
});
</script>