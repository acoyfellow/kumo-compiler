# Oxc TSX frontend spike

This install-free spike uses the repository's existing `rolldown/parseAst` API, which is backed by Oxc, to parse canonical TSX embedded in the source maps of immutable `@cloudflare/kumo@2.5.2`.

It extracts deterministic, source-provenanced syntax facts for Button, Checkbox, Field, and Popover: imports, exports, nested JSX elements and attributes, branches, parameter defaults, class expressions, and compound-part assignments. `facts.json` is content-addressed. The frontend deliberately labels symbol resolution as syntax-only: Oxc's parser surface does not resolve imported symbols or types.

## Run

From the repository root:

```sh
node experiments/visual-compiler/frontend/oxc/extract.mjs > experiments/visual-compiler/frontend/oxc/facts.json
node experiments/visual-compiler/frontend/oxc/benchmark.mjs
node experiments/visual-compiler/frontend/oxc/self-check.mjs
```

No package was installed and no files outside this directory are mutated. Benchmark figures in `results.json` include process startup, making them reproducible end-to-end measurements rather than parser-only claims. The warm benchmark repeats fresh processes against warm filesystem caches. Comparative speed against TypeScript is intentionally left unresolved until both spikes use equivalent inputs and measurement boundaries.

## Artifacts

- `extract.mjs`: deterministic parser and fact extractor
- `facts.json`: canonical extracted facts with byte offsets and line/column provenance
- `benchmark.mjs`: cold and ten-run warm benchmark
- `self-check.mjs`: repeated-byte and completeness assertions
- `results.json`: decision, exact commands, timings, diagnostics, and limitations
