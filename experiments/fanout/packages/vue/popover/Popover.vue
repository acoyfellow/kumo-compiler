<script setup>
import { PopoverRoot, PopoverTrigger, PopoverPositioner, PopoverContent, PopoverTitle, PopoverDescription, PopoverCloseTrigger } from '@ark-ui/vue/popover'
const props = defineProps({ state: { type: String, default: 'closed' }, viewport: { type: Number, default: 1440 } })
const open = props.state === 'open'
const positioning = { placement: 'bottom-start', offset: { mainAxis: 8, crossAxis: -27 } }
const contentClass = 'bg-kumo-base data-ending-style:opacity-0 data-ending-style:scale-90 data-instant:duration-0 data-starting-style:opacity-0 data-starting-style:scale-90 duration-150 flex flex-col kumo-popover-popup origin-(--transform-origin) outline outline-kumo-fill px-4 py-3 rounded-lg shadow-kumo-tip-shadow shadow-lg text-kumo-default text-sm transition-[transform,scale,opacity]'
const titleClass = 'font-medium leading-6 m-0 text-base'
const descriptionClass = 'leading-6 m-0 text-base text-kumo-subtle'
</script>
<template>
  <main data-part="root" class="p-8">
    <PopoverRoot :open="open" :positioning="positioning">
      <PopoverTrigger data-part="trigger">Toggle</PopoverTrigger>
      <PopoverPositioner v-if="open">
        <PopoverContent :class="contentClass">
          <PopoverTitle :class="titleClass" role="heading">Options</PopoverTitle>
          <PopoverDescription :class="descriptionClass" role="paragraph">Popover content</PopoverDescription>
          <PopoverCloseTrigger data-part="close">Close</PopoverCloseTrigger>
        </PopoverContent>
      </PopoverPositioner>
    </PopoverRoot>
  </main>
</template>
