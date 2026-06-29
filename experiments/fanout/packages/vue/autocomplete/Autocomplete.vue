<script setup>
import { ref, computed } from 'vue'
import { ComboboxRoot, ComboboxControl, ComboboxInput, ComboboxLabel, ComboboxPositioner, ComboboxContent, ComboboxItem, ComboboxItemText, ComboboxItemIndicator } from '@ark-ui/vue/combobox'
import { createListCollection } from '@ark-ui/vue/collection'
const props = defineProps({ state: { type: String, default: 'default' }, viewport: Number })
const allItems = ['United States', 'United Kingdom', 'Canada']
const filtered = ref(allItems)
const collection = computed(() => createListCollection({ items: filtered.value }))
function handleInputValueChange(details) {
  const q = (details?.inputValue ?? '').toLowerCase()
  filtered.value = allItems.filter((item) => item.toLowerCase().includes(q))
}
const fieldClass = 'gap-2 grid has-[[role=switch]]:grid-cols-[auto_1fr] has-[[role=switch]]:items-center has-[input[type=checkbox]]:grid-cols-[auto_1fr] has-[input[type=checkbox]]:items-center'
const labelClass = 'font-medium m-0 select-none text-base text-kumo-default'
const inputClass = 'bg-kumo-control border-0 disabled:text-kumo-disabled focus:outline-none focus:ring-[1.5px] focus:ring-kumo-focus/50 gap-1.5 h-9 kumo-input-placeholder outline-none px-3 ring ring-kumo-line rounded-lg text-base text-kumo-default w-full'
const contentClass = 'bg-kumo-control flex flex-col max-h-[min(var(--available-height),24rem)] max-w-(--available-width) min-w-(--anchor-width) py-1.5 ring ring-kumo-line rounded-lg shadow-lg text-kumo-default'
const listClass = 'flex-1 min-h-0 overflow-y-auto overscroll-contain scroll-pb-2 scroll-pt-2'
const itemClass = 'cursor-pointer data-highlighted:bg-kumo-overlay data-selected:font-medium gap-2 grid grid-cols-[1fr_16px] group mx-1.5 px-2 py-1.5 rounded text-base'
</script>
<template>
  <main data-part="root" class="p-8">
    <ComboboxRoot :collection="collection" :allowCustomValue="true" inputBehavior="none" :positioning="{ placement: 'bottom-start', offset: { mainAxis: 4, crossAxis: 0 } }" @input-value-change="handleInputValueChange">
      <ComboboxControl :class="fieldClass">
        <ComboboxLabel :class="labelClass"><span class="gap-1 inline-flex items-center">Country</span></ComboboxLabel>
        <span role="button" aria-label="Dismiss" style="clip-path:inset(50%);overflow:hidden;white-space:nowrap;border:0;padding:0;width:1px;height:1px;margin:-1px;position:absolute"></span>
        <ComboboxInput :class="inputClass" placeholder="Search…" />
      </ComboboxControl>
      <ComboboxPositioner class="outline-none">
        <ComboboxContent role="presentation" :class="contentClass">
          <div :class="listClass" role="listbox">
            <ComboboxItem v-for="item in filtered" :key="item" :item="item" :class="itemClass" data-kumo-component="Autocomplete" data-kumo-part="item">
              <ComboboxItemText class="col-start-1">{{ item }}</ComboboxItemText>
              <ComboboxItemIndicator class="col-start-2 group-data-selected:flex hidden items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z" /></svg>
              </ComboboxItemIndicator>
            </ComboboxItem>
          </div>
        </ComboboxContent>
      </ComboboxPositioner>
    </ComboboxRoot>
  </main>
</template>
