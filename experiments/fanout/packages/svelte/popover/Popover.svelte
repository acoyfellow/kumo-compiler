<script>
  import { PopoverRoot, PopoverTrigger, PopoverPositioner, PopoverContent, PopoverTitle, PopoverDescription, PopoverCloseTrigger } from '@ark-ui/svelte/popover'
  let { state = 'closed', viewport = 1440 } = $props()
  const open = state === 'open'
  const positioning = { placement: 'bottom-start', offset: { mainAxis: 8, crossAxis: -27 } }
  const contentClass = 'bg-kumo-base data-ending-style:opacity-0 data-ending-style:scale-90 data-instant:duration-0 data-starting-style:opacity-0 data-starting-style:scale-90 duration-150 flex flex-col kumo-popover-popup origin-(--transform-origin) outline outline-kumo-fill px-4 py-3 rounded-lg shadow-kumo-tip-shadow shadow-lg text-kumo-default text-sm transition-[transform,scale,opacity]'
</script>
<main data-part="root" class="p-8">
  <PopoverRoot {open} {positioning}>
    <PopoverTrigger data-part="trigger">Toggle</PopoverTrigger>
    {#if open}
      <PopoverPositioner>
        <PopoverContent class={contentClass}>
          <PopoverTitle class="font-medium leading-6 m-0 text-base">Options</PopoverTitle>
          <PopoverDescription class="leading-6 m-0 text-base text-kumo-subtle">Popover content</PopoverDescription>
          <PopoverCloseTrigger data-part="close">Close</PopoverCloseTrigger>
        </PopoverContent>
      </PopoverPositioner>
    {/if}
  </PopoverRoot>
</main>
