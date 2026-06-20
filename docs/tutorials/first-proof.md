# Produce a first proof

This tutorial verifies one existing component without changing source.

## 1. Prepare

From the repository root, use Node 22:

```sh
npm ci
npm test
```

## 2. Inspect the chain

Use `button` as the example. Find it in `generated/catalog.ir.json`, then inspect `generated/receipts/button.react.json`, `.vue.json`, `.svelte.json`, and `.solid.json`. The IR describes normalized semantics; each receipt binds a framework result to hashes and evidence.

## 3. Reproduce the family proof

```sh
npm run proof:button
```

This compiles and builds all four button fixtures, runs its browser proof, checks package contents, and validates the benchmark catalog. It changes generated/runtime output; use a clean worktree and inspect `git status` afterward.

## 4. Check the release view

```sh
npm run build:migration-status
npm run release:check
```

A successful command verifies the checked-in gate. Review the receipt and generated status diff before accepting it; success does not authorize deployment.

Next, read [evidence authority](../explanation/evidence-authority.md) before making a parity claim.
