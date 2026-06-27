# Kumo Compiler

**One source. Native everywhere.**

Kumo is a component compiler. Each component is authored **once** as a single
canonical definition — **canonical React is the source of truth** — and
compiled to real, native **Vue**, **Svelte**, and **Solid** components.

The output is genuine framework-native code. It is **not** runtime-wrapped
React and **not** transpiled in the browser: every target ships and behaves
like a component a human would have written by hand in that framework. Because
all three packages are emitted from one definition, they stay in lockstep with
a single canonical API.

- **36** components
- **3** native targets (Vue, Svelte, Solid)
- **108** compiled cells

## Live gallery

👉 **<https://kumo-compiler.coey.dev>**

Every tile in the gallery is the *actual compiled output*, rendered live in an
isolated frame. Open the menus, dialogs, and listboxes — they really work.

## Install

Each target ships as its own native npm package. Install the one for your
framework, import a component, and render it — no wrappers, no runtime
transpile. Every component (e.g. `DropdownMenu`) is a named export.

```bash
# Vue
npm i @acoyfellow/kumo-vue

# Svelte
npm i @acoyfellow/kumo-svelte

# Solid
npm i @acoyfellow/kumo-solid
```

### Quick use

```vue
<!-- Vue -->
<script setup>
import { DropdownMenu } from '@acoyfellow/kumo-vue'
</script>

<template>
  <DropdownMenu />
</template>
```

```svelte
<!-- Svelte -->
<script>
  import { DropdownMenu } from '@acoyfellow/kumo-svelte'
</script>

<DropdownMenu />
```

```jsx
// Solid
import { render } from 'solid-js/web'
import { DropdownMenu } from '@acoyfellow/kumo-solid'

render(() => <DropdownMenu />, document.getElementById('app'))
```

## Documentation

Full documentation lives in [`docs/`](./docs):

- [`docs/tutorials/`](./docs/tutorials) — learning-oriented, start here
- [`docs/how-to/`](./docs/how-to) — task-oriented recipes
- [`docs/reference/`](./docs/reference) — the component list and package APIs
- [`docs/explanation/`](./docs/explanation) — how the compiler works and why native, not wrapped

## This repository

This repo contains the gallery / referencer site that is deployed to
<https://kumo-compiler.coey.dev>.

| Path | What it is |
| --- | --- |
| `index.html` | The gallery homepage that embeds every compiled cell. |
| `styles.css` | Gallery styling. |
| `cells/<component>__<framework>/` | The compiled native output for one component in one framework, served live via `<iframe>`. |
| `build.mjs` | Assembles the gallery from the frozen native cells. |
| `wrangler.jsonc` | Cloudflare static-assets deploy config. |

### Deploy

The gallery is a fully static site served from Cloudflare:

```bash
npx wrangler deploy
```
