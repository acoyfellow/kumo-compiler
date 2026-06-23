# How the compiler works

The compiler ports observable Kumo behavior. It does not translate arbitrary React source.

## What it does

1. Observe the pinned canonical React package and record executable `kumo.observable/v1` contracts.
2. Derive framework-neutral component models and behavior capabilities from those contracts.
3. Emit native Vue, Svelte, and Solid source and package it under the fixed downstream identities.
4. Install each packed tarball and run SSR, hydration, trusted browser interaction, node-identity, and diagnostic checks.
5. Record each component-by-target result as `passed`, `failed`, `blocked`, or `not-run`.

A generated source file or successful build is not parity. Only a `passed` packed-package receipt supports a parity claim.

## How it is built

The implementation has four boundaries:

- [Observable contracts](../../contracts/kumo.observable/v1/) define what can be asserted.
- [Library algebra and capabilities](../../src/kumo/library/) hold framework-neutral state and behavior.
- [Framework emitters](../../src/kumo/emitters/) produce native target source.
- [Browser runner](../../scripts/observable-browser-runner.mjs) and [conformance fixtures](../../proof/dx/conformance/) execute and record proof.

Generated files are disposable. Changes belong in a contract, shared capability, emitter, fixture, or runner, then flow through regeneration and packed proof.

## Where it is useful

Use this architecture when one canonical component library must support several native framework packages without treating compilation as evidence. It is useful for:

- preserving a pinned behavioral authority while targets evolve independently;
- separating framework-neutral behavior from framework syntax;
- locating parity failures at the contract, emitter, package, hydration, or browser boundary;
- adding a target without weakening the component-by-target evidence matrix.

It is not a general React-to-anything converter. Components outside the recorded contracts are outside the compiler's claim.

## Adding a target

A new target must:

1. define an adapter and native emitter against the existing contracts and algebra;
2. add target comparison pages;
3. earn the complete executable component-by-target matrix with the same packed SSR, hydration, and browser receipts.

An adapter, emitted tree, build, or comparison page alone does not establish support.
