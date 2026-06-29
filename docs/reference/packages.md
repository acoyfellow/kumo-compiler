# Packages

Kumo publishes one native package per framework target. All three are compiled
from the same canonical source, so they expose the **same component names and
the same component API**.

| Package | Framework | Install |
| --- | --- | --- |
| `@acoyfellow/kumo-vue` | Vue | `npm i @acoyfellow/kumo-vue` |
| `@acoyfellow/kumo-svelte` | Svelte | `npm i @acoyfellow/kumo-svelte` |
| `@acoyfellow/kumo-solid` | Solid | `npm i @acoyfellow/kumo-solid` |

## Export shape

Each package exposes one **named export per component**, in PascalCase. There is
no default export to register and no global setup step.

```js
import { Button, DropdownMenu, Dialog /* … */ } from '@acoyfellow/kumo-vue'
```

See the [component reference](./components.md) for the full list of export
names.

## Import & render by framework

### Vue — `@acoyfellow/kumo-vue`

Components are standard Vue components. Import and use them in a template.

```vue
<script setup>
import { DropdownMenu } from '@acoyfellow/kumo-vue'
</script>

<template>
  <DropdownMenu />
</template>
```

### Svelte — `@acoyfellow/kumo-svelte`

Components are standard Svelte components. Import and use them in markup.

```svelte
<script>
  import { DropdownMenu } from '@acoyfellow/kumo-svelte'
</script>

<DropdownMenu />
```

### Solid — `@acoyfellow/kumo-solid`

Components are standard Solid components. Import and render them with Solid's
`render`.

```jsx
import { render } from 'solid-js/web'
import { DropdownMenu } from '@acoyfellow/kumo-solid'

render(() => <DropdownMenu />, document.getElementById('app'))
```

## Guarantees across packages

- **Same names.** A component has the same export name in all three packages.
- **Same API.** Props and behavior are defined once in the canonical source and
  preserved in each compiled target.
- **Native output.** Each package is real framework code — not a runtime React
  wrapper and not browser-side transpilation — so each one bundles, tree-shakes,
  and server-renders like any other package for that framework.
