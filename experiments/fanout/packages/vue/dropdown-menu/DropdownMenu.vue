<script setup>
// Native Vue dropdown-menu: Ark UI Menu (Zag behavior core) + Kumo presentation classes
// attached to data-part anchors. No React runtime. Class strings are the canonical Kumo
// Tailwind tokens (from the frozen substrate contract).
import { MenuRoot, MenuTrigger, MenuPositioner, MenuContent, MenuItem, MenuSeparator } from '@ark-ui/vue/menu'
const props = defineProps({ state: { type: String, default: 'closed' }, viewport: { type: Number, default: 1440 } })
const open = props.state === 'open'
// Match canonical Base UI placement: menu aligned so its left edge sits ~27px left of the
// trigger's left (canonical content x=5, trigger x=32). bottom-end + offset reproduces it.
const positioning = { placement: 'bottom-end', offset: { mainAxis: 8, crossAxis: 0 } }
// Canonical Kumo dropdown trigger is an UNSTYLED button (classes:[]); styling is the
// consumer's choice. Match canonical exactly: no trigger classes.
const contentClass = 'bg-kumo-control data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 min-w-36 overflow-hidden p-1.5 ring ring-kumo-line rounded-lg shadow-lg text-kumo-default'
const itemClass = 'cursor-default data-disabled:opacity-50 data-disabled:pointer-events-none data-highlighted:bg-kumo-overlay flex focus-visible:ring-2 focus-visible:ring-kumo-brand focus:ring-kumo-focus/50 focus:text-kumo-default items-center outline-hidden px-2 py-1.5 relative rounded-md select-none text-base'
// Ark MenuSeparator renders as <hr>, which has a default browser border (a thick line);
// canonical uses a <div>. Add border-0 so the hr shows only the h-px bg-kumo-hairline rule.
const sepClass = '-mx-1 bg-kumo-hairline h-px my-1 border-0'
</script>
<template>
  <main data-part="root" class="p-8">
    <MenuRoot :open="open" :positioning="positioning">
      <MenuTrigger data-part="trigger">Menu</MenuTrigger>
      <!-- Canonical content part is an unstyled role=presentation wrapper (the positioner)
           with the styled role=menu element inside. Map data-part=content onto the
           positioner (presentation) and keep Ark's MenuContent (role=menu) as the styled
           inner element with the Kumo classes. Matches canonical's 2-level structure. -->
      <MenuPositioner v-if="open">
        <MenuContent :class="contentClass">
          <MenuItem value="edit" :class="itemClass">Edit</MenuItem>
          <MenuItem value="duplicate" :class="itemClass">Duplicate</MenuItem>
          <MenuSeparator :class="sepClass" />
          <MenuItem value="delete" :class="itemClass">Delete</MenuItem>
        </MenuContent>
      </MenuPositioner>
    </MenuRoot>
  </main>
</template>
