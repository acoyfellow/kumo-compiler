# How the compiler works

Kumo is a **component compiler**. This page explains the model: what the source
is, what comes out, and how the gallery in this repository proves it.

## One canonical source of truth

Every component is authored **once** as a single canonical definition.
**Canonical React is the source of truth** — the component's structure, props,
and behavior are described in one React-shaped definition, and nothing about a
specific framework is baked into it.

"Canonical" matters here: the source is not an arbitrary React component you
happen to also ship to users. It is the one authoritative description of the
component, written so that it can be mechanically translated.

## Compiling to native targets

From that one definition, the compiler **emits real, framework-native
components** for each target:

- a Vue component for `@acoyfellow/kumo-vue`
- a Svelte component for `@acoyfellow/kumo-svelte`
- a Solid component for `@acoyfellow/kumo-solid`

Each emitted component is genuine code for that framework — the kind a careful
human would have written by hand. It uses the target framework's own
reactivity, templating, and lifecycle, rather than carrying a foreign runtime
along with it.

Because all targets are generated from the same definition, they stay in
lockstep: one canonical API, three native implementations that cannot drift
apart by accident.

## What a "cell" is

This repository's gallery is a *referencer*: it demonstrates the compiler by
showing its real output. The unit of output is a **cell** —
`cells/<component>__<framework>/`. A cell is the frozen, built native output for
exactly one component in exactly one framework.

- 36 components × 3 frameworks = **108 cells**.
- Each cell is a self-contained page (`index.html` + `kumo.css`) rendering the
  real compiled component.

The gallery's [`build.mjs`](../../build.mjs) assembles the homepage by reading
these frozen cells and embedding each one in an isolated `<iframe>`, rewriting
absolute asset paths to relative ones so the whole thing serves as a static
site. Nothing in the gallery re-implements a component or fakes a screenshot:
every tile is the actual compiled output running live.

## Why a gallery at all

Compiling to "native" code is a claim that is easy to make and hard to trust.
The gallery makes the claim **falsifiable**: because each tile is the real
emitted component rendered in the browser, you can open the menus, dialogs, and
listboxes and confirm they behave like native components — not like a
demonstration video of them.

## See also

- [Why native, not wrapped](./why-native-not-wrapped.md) — the design tradeoff
  this approach is built around.
- [Packages](../reference/packages.md) — what the compiler's output looks like
  as installable packages.
