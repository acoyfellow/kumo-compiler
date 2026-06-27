# Why native, not wrapped

A common way to ship "one component library to many frameworks" is to write the
component once (often in React, or as a web component) and then provide thin
**wrappers** for each other framework. Kumo deliberately does **not** do that.
This page explains why.

## The two approaches

**Wrapped.** A single runtime implementation (React, or a custom element)
backs every framework. Each framework gets an adapter that forwards props and
events into that one runtime.

**Compiled (Kumo).** One canonical definition is **compiled ahead of time** into
separate, real components for each framework. The Vue package is Vue code, the
Svelte package is Svelte code, the Solid package is Solid code.

## What wrapping costs

- **A foreign runtime tags along.** A Svelte app that uses a React-backed
  wrapper has to ship and run React too. You pay for a second framework you
  didn't choose.
- **Seams at the boundary.** Reactivity, lifecycle, and event semantics don't
  line up perfectly across frameworks, so wrappers leak: props that don't update
  the way the host framework expects, events that arrive at the wrong time,
  SSR/hydration that fights the host.
- **It doesn't feel native.** The component is a guest in the app. It doesn't
  tree-shake, server-render, or compose the way the framework's own components
  do.

## What compiling buys

- **No extra runtime.** The Vue output is Vue; the Svelte output is Svelte; the
  Solid output is Solid. There is no second framework hiding inside.
- **Native behavior.** Each component uses the target framework's own
  reactivity and lifecycle, so it behaves exactly like a hand-written component
  in that framework — including SSR/hydration and tree-shaking.
- **One API, kept honest.** Because every target is generated from the same
  canonical definition, the three packages share one API and stay in lockstep.
  You get the maintenance benefit of "write once" without the runtime tax of
  "wrap everywhere".

## The tradeoff, stated plainly

Compiling moves the hard work to **build time** instead of **runtime**. That
means there is a compiler to maintain — but in exchange, the thing you ship to
users is the smallest, most native artifact possible: just framework code, with
no wrapper and no foreign runtime.

This is the whole point of Kumo: author once, but **ship native** to every
target rather than shipping a wrapper that only pretends to be native.

## See also

- [How the compiler works](./how-the-compiler-works.md)
