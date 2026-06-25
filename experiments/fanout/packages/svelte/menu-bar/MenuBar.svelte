<script>
  let { state = 'default', viewport = 1440 } = $props()
  let selected = state === 'second' ? 1 : 0
  const options = ['List', 'Grid', 'Board']
  const navClass = 'isolate flex rounded-lg ring ring-kumo-line bg-kumo-recessed pl-px shadow-xs transition-colors'
  const baseClass = 'relative -ml-px flex h-full w-11 cursor-pointer items-center justify-center rounded-md border-none first:rounded-l-lg last:rounded-r-lg focus:z-3 focus:outline-none focus:ring-kumo-focus/50 focus-visible:z-3 focus-visible:ring-2 focus-visible:ring-kumo-brand transition-colors cursor-default'
  const optionClass = (index) => `${baseClass} ${selected === index ? 'z-2 bg-kumo-base shadow-xs' : 'bg-kumo-recessed'}`
</script>

<main data-component="menu-bar" data-state={state} data-part="root" class="p-8">
  <nav class={navClass}>
    {#each options as label, index}
      <button type="button" data-kumo-component="MenuBar" data-kumo-part="option"
        aria-label={`${label} view`} class={optionClass(index)}
        onclick={() => selected = index}></button>
    {/each}
  </nav>
</main>
