<script setup>
import { ComboboxRoot, ComboboxControl, ComboboxInput, ComboboxTrigger, ComboboxPositioner, ComboboxContent, ComboboxList, ComboboxItem } from '@ark-ui/vue/combobox'
import { createListCollection } from '@ark-ui/vue/collection'
const props = defineProps({ state: { type: String, default: 'default' }, viewport: { type: Number, default: 1440 } })
const items = ['United States', 'United Kingdom', 'Canada']
const collection = createListCollection({ items, itemToString: item => JSON.stringify([item]), itemToValue: item => item })
const open = props.state === 'open'
const value = props.state === 'selected' ? ['United States'] : []
const inputValue = props.state === 'selected' ? '["United States"]' : '[]'
const positioning = { placement: 'bottom-start', offset: { mainAxis: 4 } }
const controlClass = 'has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50 inline-block max-w-xs relative w-full'
const inputClass = 'bg-kumo-control border-0 disabled:cursor-not-allowed disabled:text-kumo-disabled focus:outline-none focus:ring-[1.5px] focus:ring-kumo-focus/50 gap-1.5 h-9 kumo-input-placeholder outline-none pr-12 px-3 ring ring-kumo-line rounded-lg text-base text-kumo-default w-full'
const clearClass = '-translate-y-1/2 absolute bg-transparent cursor-pointer data-[disabled]:opacity-0 data-[disabled]:pointer-events-none flex p-0 right-8 top-1/2'
const triggerClass = '-translate-y-1/2 absolute bg-transparent cursor-pointer flex items-center justify-center m-0 p-0 right-2 text-kumo-subtle top-1/2'
const contentClass = 'bg-kumo-base flex flex-col max-h-[min(var(--available-height),24rem)] max-w-(--available-width) min-w-(--reference-width) py-1.5 ring ring-kumo-line rounded-lg shadow-lg text-kumo-default'
const listClass = 'flex-1 min-h-0 overflow-y-auto overscroll-contain scroll-pb-2 scroll-pt-2'
const itemClass = 'cursor-pointer data-[disabled]:cursor-not-allowed data-[disabled]:data-highlighted:bg-transparent data-[disabled]:opacity-60 data-[disabled]:text-kumo-subtle data-highlighted:bg-kumo-tint gap-2 grid grid-cols-[1fr_16px] group mx-1.5 px-2 py-1.5 rounded text-base'
</script>
<template>
  <main data-part="root" class="p-8">
    <ComboboxRoot :collection="collection" :open="open" :modelValue="value" :inputValue="inputValue" :positioning="positioning">
      <ComboboxControl :class="controlClass">
        <ComboboxInput :class="inputClass" placeholder="Search…" />
        <button type="button" tabindex="-1" aria-label="Clear selection" :class="clearClass"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" /></svg></button>
        <ComboboxTrigger :class="triggerClass" aria-label="Toggle suggestions">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" class="fill-current"><path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" /></svg>
        </ComboboxTrigger>
      </ComboboxControl>
      <ComboboxPositioner v-if="open">
        <ComboboxContent :class="contentClass">
          <ComboboxList :class="listClass">
            <ComboboxItem v-for="item in items" :key="item" :item="item" :class="itemClass"><div class="col-start-1">{{ item }}</div></ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </ComboboxPositioner>
    </ComboboxRoot>
  </main>
</template>
