# Target-neutral lowering core

This stage consumes part-first, state-specialized core IR and produces generic operation shards. It does not emit framework code and does not read canonical trace DOM. Trace and frontend artifacts remain evidence for upstream IR repair, not lowering templates.

## Contract

`lower(ir)` emits deterministic `kumo.lowering-plan/v1` data. Each component is independently hashed from state, inputs, and operations; its filename is `sha256-<digest>.json`. The sorted manifest is hashed separately. Component and part names are opaque data (`key` and `part`) and never select lowering behavior.

Operations cover node creation/text, state initialization/transitions, portals, attributes, classes, and events. Bindings are dispatched only by their schema `type`. Target lowerers can translate these generic operations later.

`guard.mjs` rejects component/part identifier string literals on branch-bearing source lines. It permits IDs as data. This deliberately conservative static check supplements review; target lowerers should run it with IDs collected from their input IR.

`validatePlan` checks version, operation vocabulary, state/part references, shard content addresses, and manifest digest. The JSON Schema documents the interchange shape; semantic digest/reference checks remain in the validator.

## Commands

```sh
node experiments/visual-compiler/lowering/core/self-check.mjs
node experiments/visual-compiler/lowering/core/benchmark.mjs
```

The benchmark writes deterministic `results.json`; timing fields are observational and excluded from content addresses.
