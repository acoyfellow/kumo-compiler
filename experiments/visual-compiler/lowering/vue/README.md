# Operation-driven Vue lowerer

Consumes only the accepted authority-derived `kumo.core-ir/v2` part-first fixture and the target-neutral `kumo.lowering-plan/v1` produced by `lowering/core`. Plan operations are lowered generically into deterministic native Vue SFC shards; component and part identifiers never select behavior.

The output preserves plan topology, state transitions, attributes, classes, events, and portals. Each shard includes source, lowerer, IR, and content-addressed plan provenance. It does not read canonical trace DOM, copy HTML, reconstruct DOM after mount, or use a React runtime.

`capture.mjs` compiles the SFCs with the Vue Vite plugin, performs Vue SSR, serves the build over HTTP, hydrates it, drives trusted CDP mouse/keyboard input, and independently captures all 36 trace-v2 cells with build-bound provenance. `self-check.mjs` runs `lowering/core`'s `guardSource`, checks byte determinism and provenance digests, performs a real SSR build of every SFC with `@vue/compiler-sfc`, and validates the capture receipt.

```sh
node experiments/visual-compiler/lowering/vue/lower.mjs
node experiments/visual-compiler/lowering/vue/capture.mjs
node experiments/visual-compiler/lowering/vue/self-check.mjs
node experiments/visual-compiler/lowering/vue/benchmark.mjs
```

`benchmark.mjs` records cold generation and 25 warm in-memory runs in `results.json`.
