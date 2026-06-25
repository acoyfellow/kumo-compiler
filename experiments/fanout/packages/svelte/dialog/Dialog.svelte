<script>
  import { Root as DialogRoot, Trigger as DialogTrigger, DialogBackdrop, Positioner as DialogPositioner, DialogContent, Title as DialogTitle, DialogDescription, DialogCloseTrigger } from '@ark-ui/svelte/dialog'
  let { state = 'closed', viewport = 1440 } = $props()
  const open = state === 'open'
  const backdropClass = 'bg-kumo-recessed data-ending-style:opacity-0 data-starting-style:opacity-0 duration-150 fixed inset-0 opacity-80 transition-all'
  const contentClass = '-translate-x-1/2 -translate-y-1/2 bg-kumo-base data-ending-style:opacity-0 data-ending-style:scale-90 data-starting-style:opacity-0 data-starting-style:scale-90 duration-150 fixed left-1/2 max-w-[calc(100vw-2rem)] overflow-hidden ring ring-kumo-line rounded-xl shadow-m shadow-xs sm:min-w-96 sm:w-auto text-kumo-default top-1/2 w-full'
</script>

<main data-part="root" class="p-8">
  <DialogRoot {open}>
    <DialogTrigger data-part="trigger">Open dialog</DialogTrigger>
    {#if open}
      <DialogBackdrop class={backdropClass} />
      <DialogPositioner>
        <DialogContent data-part="content" class={contentClass}>
          <DialogTitle>Confirm action</DialogTitle>
          <DialogDescription role="paragraph">Are you sure?</DialogDescription>
          <DialogCloseTrigger data-part="close">Cancel</DialogCloseTrigger>
        </DialogContent>
      </DialogPositioner>
    {/if}
  </DialogRoot>
</main>
