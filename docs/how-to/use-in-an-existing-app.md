# How to use Kumo in an existing app

Goal: drop Kumo components into an app you already have, without restructuring
it.

Because each Kumo package is native to its framework, there is no plugin to
register and no provider to wrap your tree in. You install one package and
import components.

## 1. Install the package for your framework

```bash
# Vue app
npm i @acoyfellow/kumo-vue

# SvelteKit / Svelte app
npm i @acoyfellow/kumo-svelte

# SolidStart / Solid app
npm i @acoyfellow/kumo-solid
```

## 2. Import components where you need them

Import the named exports directly in the component or route that needs them.
You can mix Kumo components freely with your own.

```svelte
<script>
  import { Field, Input, Button } from '@acoyfellow/kumo-svelte'
  import MyHeader from '$lib/MyHeader.svelte'
</script>

<MyHeader />

<Field>
  <Input />
</Field>
<Button>Save</Button>
```

## 3. Keep your bundler as-is

Kumo packages are plain published components for your framework, so your
existing Vite / SvelteKit / SolidStart build handles them with no extra
configuration. Tree-shaking works the way it does for any other ESM package:
only the components you import are bundled.

## 4. Server-side rendering

The native output is ordinary framework code, so it participates in your
framework's SSR / hydration the same way your own components do. Presentational
components render server-clean; interactive components hydrate their behavior on
the client.

## Troubleshooting

- **A component is undefined on import.** Check the export name in the
  [component reference](../reference/components.md) — names are PascalCase
  (`DropdownMenu`, not `dropdown-menu`).
- **An overlay is clipped.** A parent with `overflow: hidden` or a stacking
  context can clip floating surfaces. Render overlay components where their
  popup has room, or remove the clipping on the ancestor.
