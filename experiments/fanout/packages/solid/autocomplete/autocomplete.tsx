import { Combobox } from '@ark-ui/solid/combobox'
import { createListCollection } from '@ark-ui/solid/collection'
import { For, createMemo, createSignal } from 'solid-js'
export interface AutocompleteProps { state?: string; viewport?: number }
const allItems = ['United States', 'United Kingdom', 'Canada']
const fieldClass = 'gap-2 grid has-[[role=switch]]:grid-cols-[auto_1fr] has-[[role=switch]]:items-center has-[input[type=checkbox]]:grid-cols-[auto_1fr] has-[input[type=checkbox]]:items-center'
const labelClass = 'font-medium m-0 select-none text-base text-kumo-default'
const inputClass = 'bg-kumo-control border-0 disabled:text-kumo-disabled focus:outline-none focus:ring-[1.5px] focus:ring-kumo-focus/50 gap-1.5 h-9 kumo-input-placeholder outline-none px-3 ring ring-kumo-line rounded-lg text-base text-kumo-default w-full'
const contentClass = 'bg-kumo-control flex flex-col max-h-[min(var(--available-height),24rem)] max-w-(--available-width) min-w-(--anchor-width) py-1.5 ring ring-kumo-line rounded-lg shadow-lg text-kumo-default'
const itemClass = 'cursor-pointer data-highlighted:bg-kumo-overlay data-selected:font-medium gap-2 grid grid-cols-[1fr_16px] group mx-1.5 px-2 py-1.5 rounded text-base'
export function Autocomplete(props: AutocompleteProps) {
  const [filtered, setFiltered] = createSignal(allItems)
  const collection = createMemo(() => createListCollection({ items: filtered() }))
  const handleInputValueChange = (details: { inputValue: string }) => {
    const q = (details?.inputValue ?? '').toLowerCase()
    setFiltered(allItems.filter((item) => item.toLowerCase().includes(q)))
  }
  return <main data-part="root" class="p-8">
    <Combobox.Root collection={collection()} allowCustomValue inputBehavior="none" positioning={{ placement: "bottom-start", offset: { mainAxis: 4, crossAxis: 0 } }} onInputValueChange={handleInputValueChange}>
      <Combobox.Control class={fieldClass}>
        <Combobox.Label class={labelClass}><span class="gap-1 inline-flex items-center">Country</span></Combobox.Label>
        <span role="button" aria-label="Dismiss" style="clip-path:inset(50%);overflow:hidden;white-space:nowrap;border:0;padding:0;width:1px;height:1px;margin:-1px;position:absolute"></span>
        <Combobox.Input class={inputClass} placeholder="Search…" />
      </Combobox.Control>
      <Combobox.Positioner class="outline-none">
        <Combobox.Content role="presentation" class={contentClass}>
          <div class="flex-1 min-h-0 overflow-y-auto overscroll-contain scroll-pb-2 scroll-pt-2" role="listbox">
            <For each={filtered()}>{item => <Combobox.Item item={item} class={itemClass} data-kumo-component="Autocomplete" data-kumo-part="item">
              <Combobox.ItemText class="col-start-1">{item}</Combobox.ItemText>
              <Combobox.ItemIndicator class="col-start-2 group-data-selected:flex hidden items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z" /></svg>
              </Combobox.ItemIndicator>
            </Combobox.Item>}</For>
          </div>
        </Combobox.Content>
      </Combobox.Positioner>
    </Combobox.Root>
  </main>
}
