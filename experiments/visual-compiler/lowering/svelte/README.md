# Generic Svelte 5 target lowerer

Consumes only the authority-accepted part-first core IR and the target-neutral `kumo.lowering-plan/v1` produced by `lowering/core`. It translates the operation vocabulary generically into deterministic, content-addressed Svelte 5 shards while preserving node topology, attributes, classes, state conditions, events, and portal intent. Component and part identifiers are opaque output data and never control lowering.

The manifest records core-IR and lowering-plan provenance. Canonical traces/frontend artifacts are not read or copied, and no React runtime is used. `capture.mjs` compiles the generated shards with Svelte 5 and Vite, renders native Svelte SSR, hydrates over served HTTP, instantiates all 36 required component/state/viewport cells, drives trusted CDP Input, and writes independently captured traces and PNGs under `../outputs/svelte/`. Each cell binds source, lowerer, compiler, build, served harness, trace, screenshot, and capture digests in verifier-compatible provenance. The self-check validates generation and all capture receipts.

```sh
node experiments/visual-compiler/lowering/svelte/lower.mjs
node experiments/visual-compiler/lowering/svelte/capture.mjs
node experiments/visual-compiler/lowering/svelte/self-check.mjs
node experiments/visual-compiler/lowering/svelte/benchmark.mjs
```
