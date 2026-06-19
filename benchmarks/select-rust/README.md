# Select Rust compiler prototype benchmark

A deliberately narrow Rust prototype that reads `specs/select.json` and emits the same Vue, Svelte, and Solid component source as the production Node compiler. It benchmarks source generation only: **it does not install framework tooling or run framework builds**.

## Run

Requirements: stable Rust/Cargo and Node 22+.

```sh
node benchmarks/select-rust/benchmark.mjs
# optional (minimum 5)
BENCH_ITERATIONS=50 node benchmarks/select-rust/benchmark.mjs
```

The harness performs a release build outside the timed samples, then executes both compilers serially. The Node compiler and all generated sources are placed in an isolated temporary directory, so running this benchmark does not modify production files. Each sample deletes previous output and includes process startup, spec parsing, directory creation, and three file writes. `results.json` stores raw samples plus nearest-rank median/p95/min/max.

## Correctness and interpretation

Every iteration compares all three generated files byte-for-byte. `summary.byteEquivalent` must be `true`; `outputBytes` is the combined raw size of the Vue, Svelte, and Solid sources. The Rust prototype derives option labels and the trigger class from the Select spec while intentionally implementing no other component.

Wall-clock results are machine-specific. Compare results only on the same machine under similar load. Cargo compilation is excluded, and neither side performs Vue/Svelte/Solid compilation or bundling.
