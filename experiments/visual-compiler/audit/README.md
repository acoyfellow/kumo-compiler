# Wave-2 artifact audit

This directory is an independent, fail-closed audit of the current Vue, Svelte, Solid, and verification artifacts against `../contract.json`.

Run:

```sh
node experiments/visual-compiler/audit/audit.mjs
node experiments/visual-compiler/audit/self-check.mjs
```

`results.json` is deterministic: benchmark timings and machine-specific paths are deliberately excluded. The audit compiles generated Vue templates with `@vue/compiler-sfc`, Svelte components with the Svelte server compiler, and parses/transpiles Solid TSX with TypeScript. Compilation success is not treated as conformance.

## Verdict

Wave 2 is rejected.

* **Vue — retire.** It reads `trace.dom` and reconstructs state-specific templates from canonical observations. That is copied final HTML, explicitly forbidden by the contract. It is not lowering the synthetic IR topology.
* **Svelte — salvage shell only.** The generic tree emitter and build plumbing compile, but the synthetic fixture has no useful bindings/conditions/classes. Generated output does not represent canonical topology, states, presentation, or behavior.
* **Solid — salvage shell only.** Build plumbing compiles, but tag selection branches on part IDs, states are type declarations rather than behavior, and canonical classes/topology are absent.
* **Verifier — retire.** It never builds or runs generated framework output. It searches only for target `trace.json` files. Copying canonical traces into those paths passes every projection, so provenance and native execution are unproven. Its self-check also exits successfully for a failed receipt.

Exact machine-readable findings, per-cell canonical topology/class summaries, decisions, and the required repair sequence are in `results.json`.
