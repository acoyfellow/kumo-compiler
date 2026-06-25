import { Dialog } from '@ark-ui/solid/dialog'

export interface DialogProps { state?: string; viewport?: number }

const backdropClass = 'bg-kumo-recessed data-ending-style:opacity-0 data-starting-style:opacity-0 duration-150 fixed inset-0 opacity-80 transition-all'
const contentClass = '-translate-x-1/2 -translate-y-1/2 bg-kumo-base data-ending-style:opacity-0 data-ending-style:scale-90 data-starting-style:opacity-0 data-starting-style:scale-90 duration-150 fixed left-1/2 max-w-[calc(100vw-2rem)] overflow-hidden ring ring-kumo-line rounded-xl shadow-m shadow-xs sm:min-w-96 sm:w-auto text-kumo-default top-1/2 w-full'

export function KumoDialog(props: DialogProps) {
  const open = () => props.state === 'open'
  return (
    <main data-part="root" class="p-8">
      <Dialog.Root open={open()}>
        <Dialog.Trigger data-part="trigger">Open dialog</Dialog.Trigger>
        {open() && <>
          <Dialog.Backdrop class={backdropClass} />
          <Dialog.Positioner>
            <Dialog.Content data-part="content" class={contentClass}>
              <Dialog.Title>Confirm action</Dialog.Title>
              <Dialog.Description role="paragraph">Are you sure?</Dialog.Description>
              <Dialog.CloseTrigger data-part="close">Cancel</Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </>}
      </Dialog.Root>
    </main>
  )
}
