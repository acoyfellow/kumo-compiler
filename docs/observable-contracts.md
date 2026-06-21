# Observable component contracts

`contracts/kumo.observable/v1/` is the machine-readable authority for emitter output and proof expectations. Each contract is bound to the preserved `@cloudflare/kumo@2.5.2` type and runtime hashes in `audit/kumo-react-2.5.2.provenance.json`, and identifies its normalized input as `kumo.ir/v1`. It does not replace browser evidence or existing receipts.

The v1 schema records public props/defaults, semantic DOM/ARIA, initial state, transitions, keyboard/focus, SSR/hydration, styling/assets, executable render vectors, and explicit unknown/blocked observations. Claims come from canonical exports, declarations, and runtime; absence of evidence must be represented in `unknowns`, not guessed.

Emitters should validate first, select a vector, emit its props, and preserve the expected root, attributes, text, state, and styling observations. Proof runners should execute the same vectors against canonical and emitted implementations, then compare observable results. Validation is fail-closed: unsupported versions, missing fields, extra fields, invalid hashes, duplicate vectors, and inconsistent roots are rejected.

Run `node scripts/observable-contracts.mjs` to validate inventory and provenance, or `node --test test/observable-contracts.test.mjs` for deterministic contract tests. Future compiler support can add a typed loader, vector-to-framework fixture generation, canonical/emitter DOM comparators, and proof receipt references without changing browser authority.
