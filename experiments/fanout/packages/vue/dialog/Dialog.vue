<script setup>
import { DialogRoot, DialogTrigger, DialogBackdrop, DialogPositioner, DialogContent, DialogTitle, DialogDescription, DialogCloseTrigger } from '@ark-ui/vue/dialog'
const props = defineProps({ state: { type: String, default: 'closed' }, viewport: { type: Number, default: 1440 } })
const open = props.state === 'open'
const backdropClass = 'bg-kumo-recessed data-ending-style:opacity-0 data-starting-style:opacity-0 duration-150 fixed inset-0 opacity-80 transition-all'
const contentClass = '-translate-x-1/2 -translate-y-1/2 bg-kumo-base data-ending-style:opacity-0 data-ending-style:scale-90 data-starting-style:opacity-0 data-starting-style:scale-90 duration-150 fixed left-1/2 max-w-[calc(100vw-2rem)] overflow-hidden ring ring-kumo-line rounded-xl shadow-m shadow-xs sm:min-w-96 sm:w-auto text-kumo-default top-1/2 w-full'
</script>
<template>
  <main data-part="root" class="p-8">
    <DialogRoot :open="open">
      <DialogTrigger data-part="trigger">Open dialog</DialogTrigger>
      <template v-if="open">
        <DialogBackdrop :class="backdropClass" />
        <DialogPositioner>
          <DialogContent data-part="content" :class="contentClass">
            <DialogTitle>Confirm action</DialogTitle>
            <DialogDescription role="paragraph">Are you sure?</DialogDescription>
            <DialogCloseTrigger data-part="close">Cancel</DialogCloseTrigger>
          </DialogContent>
        </DialogPositioner>
      </template>
    </DialogRoot>
  </main>
</template>
