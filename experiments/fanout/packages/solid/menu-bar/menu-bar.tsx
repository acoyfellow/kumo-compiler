import { createSignal, For } from 'solid-js'

export interface MenuBarProps { state?: string; viewport?: number }

const options = ['List', 'Grid', 'Board']
const navClass = 'isolate flex rounded-lg ring ring-kumo-line bg-kumo-recessed pl-px shadow-xs transition-colors'
const baseClass = 'relative -ml-px flex h-full w-11 cursor-pointer items-center justify-center rounded-md border-none first:rounded-l-lg last:rounded-r-lg focus:z-3 focus:outline-none focus:ring-kumo-focus/50 focus-visible:z-3 focus-visible:ring-2 focus-visible:ring-kumo-brand transition-colors cursor-default'

export function MenuBar(props: MenuBarProps) {
  const [selected, setSelected] = createSignal(props.state === 'second' ? 1 : 0)
  const optionClass = (index: number) => `${baseClass} ${selected() === index ? 'z-2 bg-kumo-base shadow-xs' : 'bg-kumo-recessed'}`
  return (
    <main data-component="menu-bar" data-state={props.state || 'default'} data-part="root" class="p-8">
      <nav class={navClass}>
        <For each={options}>{(label, index) =>
          <button type="button" data-kumo-component="MenuBar" data-kumo-part="option"
            aria-label={`${label} view`} class={optionClass(index())}
            onClick={() => setSelected(index())} />
        }</For>
      </nav>
    </main>
  )
}
