import { Popover } from '@ark-ui/solid/popover'

export interface PopoverProps { state?: string; viewport?: number }
const contentClass = 'bg-kumo-base data-ending-style:opacity-0 data-ending-style:scale-90 data-instant:duration-0 data-starting-style:opacity-0 data-starting-style:scale-90 duration-150 flex flex-col kumo-popover-popup origin-(--transform-origin) outline outline-kumo-fill px-4 py-3 rounded-lg shadow-kumo-tip-shadow shadow-lg text-kumo-default text-sm transition-[transform,scale,opacity]'

export function PopoverDemo(props: PopoverProps) {
  const open = () => props.state === 'open'
  return (
    <main data-part="root" class="p-8">
      <Popover.Root open={open()} positioning={{ placement: 'bottom-start', offset: { mainAxis: 8, crossAxis: -27 } }}>
        <Popover.Trigger data-part="trigger">Toggle</Popover.Trigger>
        {open() && <Popover.Positioner>
          <Popover.Content class={contentClass}>
            <Popover.Title class="font-medium leading-6 m-0 text-base" role="heading">Options</Popover.Title>
            <Popover.Description class="leading-6 m-0 text-base text-kumo-subtle" role="paragraph">Popover content</Popover.Description>
            <Popover.CloseTrigger data-part="close">Close</Popover.CloseTrigger>
          </Popover.Content>
        </Popover.Positioner>}
      </Popover.Root>
    </main>
  )
}
