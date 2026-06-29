# How to add a component to a page

Goal: render a specific Kumo component on a page in your app.

## 1. Find the component

Look up the component name in the [component reference](../reference/components.md).
Component names are PascalCase named exports — for example the `dialog`
component is exported as `Dialog`, and `dropdown-menu` is exported as
`DropdownMenu`.

## 2. Import it from your framework's package

Import only what you use; the package exposes one named export per component.

```js
// Vue
import { Dialog } from '@acoyfellow/kumo-vue'
// Svelte
import { Dialog } from '@acoyfellow/kumo-svelte'
// Solid
import { Dialog } from '@acoyfellow/kumo-solid'
```

## 3. Render it

Use the component the way you use any other component in your framework.

```vue
<!-- Vue -->
<script setup>
import { Dialog } from '@acoyfellow/kumo-vue'
</script>

<template>
  <Dialog />
</template>
```

```svelte
<!-- Svelte -->
<script>
  import { Dialog } from '@acoyfellow/kumo-svelte'
</script>

<Dialog />
```

```jsx
// Solid
import { Dialog } from '@acoyfellow/kumo-solid'

<Dialog />
```

## 4. Verify it works

Components with floating surfaces — `Dialog`, `Popover`, `Select`, `Combobox`,
`Autocomplete`, `DropdownMenu`, `MenuBar` — are interactive. Open them in the
browser to confirm the overlay renders and is not clipped by a parent with
`overflow: hidden`.

## Notes

- The same component name and props work across all three frameworks, because
  every target is compiled from one canonical definition.
- Presentational components (`Badge`, `Text`, `Table`, `Grid`, …) render with
  little or no JavaScript. Interactive components ship the behavior they need.
