<script>
  // Native Svelte select: Ark UI Select (Zag) + Kumo presentation. No React runtime.
  import { SelectRoot, SelectControl, SelectTrigger, SelectValueText, SelectIndicator } from '@ark-ui/svelte/select'
  import { createListCollection } from '@ark-ui/svelte/collection'
  let { state = 'default', viewport = 1440 } = $props()
  const collection = createListCollection({ items: [{ value: 'us' }, { value: 'uk' }], itemToString: (i) => i.value, itemToValue: (i) => i.value })
  const disabled = state === 'disabled'
  const value = state === 'selected' ? ['us'] : []
  const triggerBase = '!text-kumo-default *:in-focus:opacity-100 bg-kumo-base border-0 cursor-pointer data-[state=open]:bg-kumo-base disabled:!text-kumo-default/70 disabled:bg-kumo-base/50 disabled:cursor-not-allowed disabled:text-kumo-subtle flex focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-kumo-brand focus:opacity-100 focus:outline-none focus:ring-kumo-focus/50 font-normal gap-1.5 group h-9 items-center justify-between not-disabled:hover:bg-kumo-tint px-3 ring ring-kumo-line rounded-lg select-none shadow-xs shrink-0 text-base w-max'
  const triggerClass = disabled ? triggerBase + ' opacity-50' : triggerBase
  const valueClass = 'data-[placeholder]:text-kumo-placeholder min-w-0 truncate'
  const indicatorClass = 'flex shrink-0 items-center text-kumo-subtle'
</script>

<main data-part="root" class="p-8">
  <SelectRoot {collection} {value} {disabled}>
    <SelectControl>
      <SelectTrigger data-part="trigger" class={triggerClass}>
        <SelectValueText class={valueClass} />
        <SelectIndicator class={indicatorClass}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" class="fill-current">
            <path d="M181.66,170.34a8,8,0,0,1,0,11.32l-48,48a8,8,0,0,1-11.32,0l-48-48a8,8,0,0,1,11.32-11.32L128,212.69l42.34-42.35A8,8,0,0,1,181.66,170.34Zm-96-84.68L128,43.31l42.34,42.35a8,8,0,0,0,11.32-11.32l-48-48a8,8,0,0,0-11.32,0l-48,48A8,8,0,0,0,85.66,85.66Z" />
          </svg>
        </SelectIndicator>
      </SelectTrigger>
    </SelectControl>
  </SelectRoot>
</main>
