# kumo-compiler

**A compiler that takes Cloudflare Kumo's canonical React components and emits
native Vue, Svelte, and Solid packages.**

> **Independent / community project — not official.** This is **not** built,
> endorsed, or maintained by Cloudflare or the Kumo team. [Kumo](https://kumo.cloudflare.design)
> is Cloudflare's React design system; it is the *input* to this project, not
> its author. "Kumo" here refers to that upstream React design system, which
> remains the source of truth. This repository is an independent experiment that
> *observes* those canonical React components and *emits* equivalent native
> components for other frameworks.

## What it actually does

Each Kumo component is authored once upstream as canonical React — that React
implementation is treated as the source of truth. This compiler observes the
canonical React behavior, records it as framework-neutral contracts and a
component algebra, and emits real, native **Vue**, **Svelte**, and **Solid**
components from those contracts.

The emitted output is genuine framework-native code. It is **not**
runtime-wrapped React and **not** transpiled in the browser: each target ships
and behaves like a component a human would have written by hand in that
framework. Because all three packages are emitted from the same canonical
observations, they stay in lockstep with a single upstream API.

Parity is not assumed from a successful build. Every claimed behavior is proven
against the canonical React control through target-specific SSR, hydration, and
trusted browser receipts; missing evidence never counts as passing.

```text
canonical React @cloudflare/kumo observations
→ framework-neutral observable contracts
→ framework-neutral component algebra
→ native Vue, Svelte, and Solid package emitters
→ packed-package SSR, hydration, and browser receipts
→ public Astro catalog + this live gallery
```

## Live gallery

👉 **<https://kumo-compiler.coey.dev>**

Every tile in the gallery is the *actual compiled output*, rendered live in an
isolated frame. Open the menus, dialogs, and listboxes — they really work.

## Install the emitted packages

Each target ships as its own native npm package. These are the **emitted output**
of this compiler, published under an independent (`@acoyfellow`) scope — they are
not official Cloudflare packages.

```bash
# Vue
npm i @acoyfellow/kumo-vue

# Svelte
npm i @acoyfellow/kumo-svelte

# Solid
npm i @acoyfellow/kumo-solid
```

Every component (e.g. `DropdownMenu`) is a named export.

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

## Repository layout

This repo contains both the compiler and the gallery site.

### Compiler

| Path | What it is |
| --- | --- |
| `src/kumo/compiler.ts`, `schema.ts`, `catalog.ts`, `validate.ts` | Compiler core, schema, catalog, and validation. |
| `src/kumo/emitters/{vue,svelte,solid}/` | Native framework emitters. |
| `src/kumo/library/` | Framework-neutral component algebra and models. |
| `contracts/` | Observable canonical React behavior, recorded with provenance. |
| `generated/libraries/` | The sole generated framework output (do not hand-edit). |
| `dx/packages/kumo-*` | Package builders for the emitted npm packages. |
| `proof/`, `benchmarks/` | Accepted evidence and receipts. |
| `scripts/` | Operator and verification scripts. |

The machine-readable version is [`repository-map.json`](repository-map.json).

### Gallery / referencer site

| Path | What it is |
| --- | --- |
| `index.html` | The gallery homepage that embeds every compiled cell. |
| `styles.css` | Gallery styling. |
| `cells/<component>__<framework>/` | The compiled native output for one component in one framework, served live via `<iframe>`. |
| `build.mjs` | Assembles the gallery from the frozen native cells. |

> Note: the repository root ships two deploy configs that target different
> accounts. `wrangler.jsonc` here is the compiler/proof worker config; the
> gallery's original static-assets config is preserved in history. Pick the
> intended one before running `wrangler deploy`.

## Six commands (compiler)

```sh
npm ci
npm run contract       # validate contracts and observable status
npm run generate       # regenerate library models and framework output
npm run conformance    # run fail-closed tests and receipts
npm run package        # build and verify deterministic package tarballs
npm run release        # complete release check; never publishes
npm run deploy         # explicit production deployment
```

## Evidence rules

A successful build proves only that output was generated or packaged; it does
not prove behavioral parity. Parity claims require target-specific SSR,
hydration, and trusted browser evidence recorded as:

```text
passed | failed | blocked | not-run
```

- `passed` — the asserted behavior ran and matched its contract.
- `failed` — it ran and did not match.
- `blocked` — a named dependency or missing authority prevents execution.
- `not-run` — no execution evidence exists.

Missing evidence never passes.

## Documentation

Full documentation lives in [`docs/`](./docs):

- [`docs/tutorials/`](./docs/tutorials) — learning-oriented, start here
- [`docs/how-to/`](./docs/how-to) — task-oriented recipes
- [`docs/reference/`](./docs/reference) — the component list and package APIs
- [`docs/explanation/`](./docs/explanation) — how the compiler works and why native, not wrapped
- [Architecture in seven minutes](docs/architecture/seven-minute-guide.md)

## License & attribution

This is an independent project. "Cloudflare" and "Kumo" are referenced for
descriptive accuracy only; all upstream rights belong to their owners. The
emitted components derive from Cloudflare's canonical React Kumo components.
