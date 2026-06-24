# Generic Solid target lowerer

This target consumes only the accepted authority-derived part-first core IR and the target-neutral `kumo.lowering-plan/v1` produced by `lowering/core`. It translates plan operations generically into native Solid JSX: topology, attributes, classes, states, transitions, events, and portals are emitted without component- or part-ID dispatch.

Outputs are deterministic, content-addressed SSR/hydratable shards under `generated/`. Their provenance points to the core plan shard and authority receipt; canonical source and trace files are neither read nor copied. `guardSource` rejects identifier-specific branches, and the self-check performs a real Solid/Vite SSR compilation.

```sh
node experiments/visual-compiler/lowering/solid/lower.mjs
node experiments/visual-compiler/lowering/solid/self-check.mjs
node experiments/visual-compiler/lowering/solid/benchmark.mjs
node experiments/visual-compiler/lowering/solid/native-harness.mjs
node experiments/visual-compiler/lowering/solid/capture.mjs
```

`native-harness.mjs` defines the fail-closed 36-cell capture matrix and trusted-CDP contract. A valid capture is produced from independently rendered pixels and browser-observed state only: compile the generated JSX with the real Solid/Vite toolchain in SSR and client modes, serve SSR markup over HTTP, hydrate it, and drive interactions with CDP `Input`. Canonical evidence may be opened by the verifier for comparison, but must never be an input to build or capture. Every output cell must contain `trace.json`, `screenshot.png`, and `provenance.json`; provenance binds SHA-256 digests for generated source, lowerer, compiler packages, build, served harness, capture, trace, and screenshot.
