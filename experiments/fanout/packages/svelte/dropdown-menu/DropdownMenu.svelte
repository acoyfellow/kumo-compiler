<script>
  // Native Svelte dropdown-menu: Ark UI Menu (Zag behavior core) + Kumo presentation
  // classes on data-part anchors. No React runtime. Mirrors the validated Vue/Solid
  // structure: unstyled trigger, conditional-mount content, separator border-0, canonical
  // Base UI placement.
  import { MenuRoot, MenuTrigger, MenuPositioner, MenuContent, MenuItem, MenuSeparator } from '@ark-ui/svelte/menu'
  let { state = 'closed', viewport = 1440 } = $props()
  const open = state === 'open'
  const positioning = { placement: 'bottom-start', offset: { mainAxis: 8, crossAxis: -30 } }
  const contentClass = 'bg-kumo-control data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 min-w-36 overflow-hidden p-1.5 ring ring-kumo-line rounded-lg shadow-lg text-kumo-default'
  const itemClass = 'cursor-default data-disabled:opacity-50 data-disabled:pointer-events-none data-highlighted:bg-kumo-overlay flex focus-visible:ring-2 focus-visible:ring-kumo-brand focus:ring-kumo-focus/50 focus:text-kumo-default items-center outline-hidden px-2 py-1.5 relative rounded-md select-none text-base'
  const sepClass = '-mx-1 bg-kumo-hairline h-px my-1 border-0'
</script>

<main data-part="root" class="p-8">
  <MenuRoot {open} {positioning}>
    <MenuTrigger data-part="trigger">Menu</MenuTrigger>
    {#if open}
      <MenuPositioner>
        <MenuContent data-part="content" class={contentClass}>
          <MenuItem value="edit" class={itemClass}>Edit</MenuItem>
          <MenuItem value="duplicate" class={itemClass}>Duplicate</MenuItem>
          <MenuSeparator class={sepClass} />
          <MenuItem value="delete" class={itemClass}>Delete</MenuItem>
        </MenuContent>
      </MenuPositioner>
    {/if}
  </MenuRoot>
</main>
