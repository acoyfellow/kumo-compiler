# IR shootout

This experiment compares three representations over the same Button, Checkbox, Field, and Popover facts:

- **DOM-first:** simple tree lowering, but structural edits make coarse cache boundaries and diagnostics drift from semantic parts.
- **Part-first:** stable semantic parts own behavior, presentation, and provenance; explicit parent relations retain the DOM tree.
- **Dialect:** compact and quick to parse, but introduces grammar complexity and weaker source diagnostics.

## Winner

**Part-first** wins the contract-weighted evaluation. The selected core IR is `fixtures/components.json`. It deliberately contains only platform-neutral structure, semantics, state transitions, bindings, presentation tokens, and provenance. It contains no React, Vue, Svelte, or Solid concepts. Target lowerers can walk parts and state machines generically without component IDs.

Candidate JSON files are evaluation descriptors; each normalizes to the same core fixture, making information parity directly checkable. `schemas/core-ir.schema.json` documents the persisted boundary, while the executable validator enforces required components/states, graph integrity, and framework neutrality.

## Commands

```sh
node experiments/visual-compiler/ir/evaluate.mjs
node experiments/visual-compiler/ir/validate.mjs
```

`evaluate.mjs` performs 200 warm validation/normalization iterations per candidate, computes scores using the exact contract weights, records cache and diagnostic analysis, and deterministically rewrites `results.json`. This is a synthetic IR microbenchmark, not a claim about browser proof or target compiler latency.
