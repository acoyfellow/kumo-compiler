# Select Node baseline benchmark

A dependency-free Node/TypeScript harness for the Select compiler baseline. It records five or more independent samples and reports nearest-rank median and p95 values in `results.json`.

## Run

```sh
node --experimental-strip-types benchmarks/select-node/benchmark.ts
# Optional:
BENCH_ITERATIONS=10 CHROME=/path/to/chrome node --experimental-strip-types benchmarks/select-node/benchmark.ts
```

Requirements: Node 22+, npm dependencies installed, macOS Google Chrome at the default location (or `CHROME` set), and `ps`. Run from any directory; the harness resolves the repository root itself. Benchmark artifacts are removed unless `KEEP_BENCH_ARTIFACTS=1`.

## Metrics

- **compile**: wall time for `node src/compiler.mjs`.
- **build**: wall time for the complete `build:runtimes` script (compiler plus all Vite runtime builds).
- **SSR/response**: fresh HTTP request and complete body read for each framework route. React is server-rendered; generated framework pages are served static, so this is intentionally named `ssrMs` in the stable schema but should be interpreted as server response latency for Vue/Svelte/Solid.
- **hydration**: Chrome process wall time to navigate, execute modules, and dump the hydrated DOM. It includes browser startup and is best used for same-machine regressions, not as pure in-page hydration CPU time.
- **screenshot**: Chrome process wall time to navigate and write a deterministic 900×600 PNG.
- **pixel diff**: exact PNG parity against React. `0` is emitted only when PNG bytes (and therefore pixels) are identical; `null` means images differ and no misleading compressed-byte percentage is reported. SHA-256 values make every sample auditable.
- **package size**: npm's `pack --dry-run --json` packed/unpacked byte counts.
- **bundle size**: raw and deterministic gzip (`level=9`, `mtime=0`) bytes for every runtime output file.
- **memory**: best-effort peak child RSS sampled with `ps` every 20 ms for compile and build. Very short processes can produce `null`.

## Reproducibility and interpretation

The harness runs serially, uses a fresh server port per sample, fixed Chrome viewport/device scale, loopback networking, and deterministic gzip settings. Close CPU-heavy applications and avoid comparing results across different machines, Node/Chrome versions, or power modes. The JSON captures relevant environment values and retains all raw runs in addition to summaries.

`results.json` is the checked-in baseline. Re-running updates its timestamp and machine-dependent measurements. The harness does not modify production routes.
