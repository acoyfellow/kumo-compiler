# Observable component contracts

`contracts/kumo.observable/v1/` is the machine-readable authority for emitter output and proof expectations. Each contract remains bound to preserved `@cloudflare/kumo@2.5.2` type and runtime hashes in `audit/kumo-react-2.5.2.provenance.json`, and identifies normalized input as `kumo.ir/v1`. It does not replace browser evidence or existing receipts.

## Creating a fail-closed scaffold

Use `npm run contract:new -- <component-id>` to print a deterministic JSON scaffold to stdout. The ID must be one of the exact 41 entries in `benchmarks/catalog.json`. The command reads the package declaration entry point and binds the scaffold to the exact export path, type/runtime paths, and SHA-256 values recorded in `audit/kumo-react-2.5.2.provenance.json` for `@cloudflare/kumo@2.5.2` and `kumo.ir/v1`.

The generated document deliberately does **not** infer props, defaults, semantics, state, interactions, focus, or styling. Its public export placeholder is marked `UNRESOLVED`, unknown sections are explicit, and its starter vector is blocked rather than passing evidence. Resolve these fields from authoritative observations before asking the contract validator or runner to accept it.

Review stdout first, then use `npm run contract:new -- <component-id> --write` to create `contracts/kumo.observable/v1/components/<component-id>.json`. Creation uses exclusive writes and never overwrites an existing contract. `--check` (alias `--dry-run`) performs all catalog, provenance, declaration, and existing-file checks without output or writes. `npm run contract:new -- --all-missing` emits a JSON report in catalog order and never creates contracts. Path syntax, unknown IDs, malformed provenance, unavailable declarations, conflicting modes, and existing destinations fail closed.

## Generic assertion DSL

Every vector has an `expected.root` node assertion. Node assertions support `tag`, exact `text`, `attributes.exact`, `attributes.includes`, `classes.exact`, and `classes.includes`. `descendants` uses a deliberately strict selector subset (tag, `.class`, or `#id`), a required exact `count`, and the same node observations. Expectations may additionally describe JSON-compatible `state`, ordered event names in `events`, and `focus` (`root`, `none`, or a supported selector). These operators are generic DOM observations; component-specific assertion keys are forbidden.

Exact attributes ignore the separately asserted root class, while exact classes are order-sensitive to preserve deterministic rendering. Unknown operators, malformed selectors, missing counts, extra fields, and invalid value types fail closed in both schema and runtime validation.

## Runner authority

`scripts/observable-runner.mjs` is the canonical React vector authority. It dynamically imports each contract's `@cloudflare/kumo` export path, server-renders every action-free vector with React, observes markup, and compares the complete DSL expectation. Vectors with actions are routed through an explicit browser adapter interface; none of the current ten vectors require actions. State, events, and focus intentionally require that browser adapter rather than being guessed from SSR.

Run `node scripts/observable-contracts.mjs` to validate inventory and provenance, `node scripts/observable-runner.mjs` to execute canonical vectors, or `node --test test/observable-contracts.test.mjs` for deterministic validation, execution, negative-comparison, provenance, and serialization tests. Browser evidence and immutable receipts remain separate authorities and are unchanged.
