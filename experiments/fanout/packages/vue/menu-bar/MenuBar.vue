<script setup>
import { ref } from 'vue'
const props = defineProps({ state: { type: String, default: 'default' }, viewport: { type: Number, default: 1440 } })
const selected = ref(props.state === 'second' ? 1 : 0)
const options = ['List', 'Grid', 'Board']
const navClass = 'isolate flex rounded-lg ring ring-kumo-line bg-kumo-recessed pl-px shadow-xs transition-colors'
const baseClass = 'relative -ml-px flex h-full w-11 cursor-pointer items-center justify-center rounded-md border-none first:rounded-l-lg last:rounded-r-lg focus:z-3 focus:outline-none focus:ring-kumo-focus/50 focus-visible:z-3 focus-visible:ring-2 focus-visible:ring-kumo-brand transition-colors cursor-default'
const optionClass = index => `${baseClass} ${selected.value === index ? 'z-2 bg-kumo-base shadow-xs' : 'bg-kumo-recessed'}`
</script>

<template>
  <main data-component="menu-bar" :data-state="state" data-part="root" class="p-8">
    <nav :class="navClass">
      <button v-for="(label, index) in options" :key="label" type="button"
        data-kumo-component="MenuBar" data-kumo-part="option"
        :aria-label="`${label} view`" :class="optionClass(index)"
        @click="selected = index"></button>
    </nav>
  </main>
</template>
