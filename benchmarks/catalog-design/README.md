# Benchmark catalog design: Select kitchen sink

This directory specifies a data contract and dashboard for a benchmark catalog. It is a design artifact only: it does not add routes, alter the compiler, or prescribe that machine-dependent numbers be checked in as universal claims. The first catalog entry is the Select kitchen sink; the same contract can later hold other components and scenarios.

`catalog.schema.json` validates a complete, immutable benchmark run. Producers should write one run document per commit/environment rather than update a global aggregate. A dashboard can compare compatible runs and compute trends without discarding raw evidence.

## Goals

The catalog should answer, for each component:

- Does every framework expose a directly loadable, isolated iframe?
- Is visual output reproducible, and does it match the React reference?
- What JavaScript/CSS/assets are shipped, raw and gzip-compressed?
- How quickly does server output arrive and become interactive?
- Does the publishable package contain the expected generated artifacts?
- Is an alternative compiler faster while generating equivalent source?

Every measurement names its method, unit, samples, and summary. Missing or inapplicable measurements are omitted, never encoded as zero. Timings are comparable only when `environment.fingerprint` and the metric method/configuration match.

## URL structure

The proposed public surface separates human pages, embeddable examples, immutable data, and artifacts:

```text
/benchmarks/                                      catalog dashboard
/benchmarks/components/select/                    Select overview
/benchmarks/components/select/runs/<run-id>/      one run
/benchmarks/components/select/compare/?base=<id>&head=<id>
/benchmarks/embed/select/react/kitchen-sink/       isolated React iframe
/benchmarks/embed/select/vue/kitchen-sink/         isolated Vue iframe
/benchmarks/embed/select/svelte/kitchen-sink/      isolated Svelte iframe
/benchmarks/embed/select/solid/kitchen-sink/       isolated Solid iframe
/benchmarks/data/runs/<run-id>.json                schema-valid run document
/benchmarks/data/latest/select.json                pointer/redirect, not mutable evidence
/benchmarks/artifacts/<run-id>/<framework>/<file>  screenshots, traces, bundle manifests
```

URLs in a run document are root-relative and are resolved against `siteBaseUrl`. Artifact hashes remain authoritative if a deployment host changes. Existing `/select/<framework>/` pages may be used by an initial producer, but canonical catalog iframe URLs should use the `/benchmarks/embed/...` namespace so navigation chrome cannot contaminate measurements.

The **kitchen sink** fixture must exercise all meaningful Select states in one stable viewport: closed, open, focused, selected, disabled, long label, and overflow/scroll behavior. State placement, viewport, fonts, reduced-motion setting, device scale, locale, and color scheme belong in `scenario.captureConfig`; changing any of them creates a different scenario revision.

## Run document

A run has provenance (`runId`, commit, timestamps, environment), one or more component records, package proof, and optional compiler-language comparisons. The Select record contains:

- `scenario`: fixture revision, iframe routes, viewport and deterministic capture settings.
- `frameworks`: React, Vue, Svelte, and Solid observations.
- `frameworks[].metrics.ssr`: request-to-complete-body samples. A `kind` distinguishes true SSR from static response timing.
- `frameworks[].metrics.hydration`: navigation-to-hydrated-marker samples. The marker and browser timing expression are recorded; browser process startup must not be silently mixed with in-page hydration.
- `frameworks[].metrics.screenshot`: PNG dimensions, SHA-256, artifact URL, and optional comparison to a named reference framework. `pixelDiff` records changed pixels and total pixels; exact parity is `changedPixels: 0`.
- `frameworks[].metrics.bundle`: a file manifest plus totals. Raw and deterministic gzip byte counts are integers; sourcemaps are explicitly included or excluded.

React is normally `reference: true`, but the schema does not hard-code that policy. A framework status may be `measured`, `failed`, or `unsupported`; failures carry a reason rather than fabricated metric values.

### Package proof

`packageProof` records the exact `npm pack --dry-run --json`-style evidence for the repository package: package name/version, tarball filename and SHA-256, packed/unpacked sizes, total files, and a path/size/hash manifest. `requiredArtifacts` expresses auditable expectations (for example, generated Select sources for Vue/Svelte/Solid) and whether each matched. The command, package manager version, working tree cleanliness, and optional raw proof artifact URL make the claim reproducible. A proof passes only when the command succeeds and every required artifact matches.

### Compiler language comparison

`compilerComparisons` compares named implementations, initially Node and Rust, for the same component/spec and scope. Each implementation records language/runtime, command, executable hash when available, wall-time samples, and output bytes. `equivalence` identifies the baseline, algorithm (`byte-for-byte` initially), compared paths, hashes, and result. Build time is excluded unless explicitly listed in `timingScope`; exclusions are first-class fields. Ratios should be derived by the dashboard from medians, not stored as claims.

The current narrow Rust prototype should therefore identify source generation as its scope and exclude Cargo release build, framework builds, bundling, SSR, and hydration.

## Dashboard layout

### Catalog

- Header: run selector, commit, environment fingerprint, timestamp, and a prominent comparability warning.
- Component grid: status, framework count, screenshot parity, median SSR/hydration, total gzip bundle size, and package-proof status.
- Filters: component, framework, branch/commit, OS/architecture, runtime/browser version, and pass/fail.

### Component detail

1. **Fixture strip** — live framework iframes in synchronized, sandboxed panels; links open each route directly. The dashboard itself is never the measured page.
2. **Visual parity** — screenshot thumbnails, hashes, changed-pixel count, viewport/config, and downloadable originals/diffs.
3. **Runtime timing** — median and p95 SSR/response and hydration cards with expandable raw samples and method definitions.
4. **Payload** — grouped bars for raw/gzip totals and an expandable per-file bundle manifest.
5. **Package proof** — pass/fail summary, tarball identity, packed/unpacked bytes, required-artifact checks, and full file manifest.
6. **Compiler comparison** — Node/Rust distributions, median/p95, output bytes, timing scope/exclusions, and equivalence proof.
7. **Provenance** — commit, dirty-tree flag, commands, tool versions, machine fingerprint, and links to immutable run JSON/artifacts.

### Compare view

Show base and head values, absolute deltas, and percentages only for compatible metrics. Mark environment/method mismatches as **not comparable** instead of coloring them as regressions. Screenshot hash changes are evidence to inspect, not automatically failures; the explicit parity policy determines status.

## Producer and validation rules

1. Generate a unique `runId` (recommended: UTC timestamp plus short commit SHA).
2. Build and serve each iframe route from the same commit represented by the run.
3. Run serial samples after warm-up; retain all accepted samples and state the summary method.
4. Hash artifact bytes with lowercase SHA-256 hex. Use deterministic gzip (`level=9`, `mtime=0`) for bundle values.
5. Capture package and compiler proofs in isolated temporary directories so production output is not modified.
6. Validate before publishing:

   ```sh
   npx ajv validate -s benchmarks/catalog-design/catalog.schema.json -d <run.json> --spec=draft2020
   ```

7. Publish run JSON and artifacts immutably; update `latest` only after validation and all required checks pass.

The schema deliberately requires raw timing samples and explicit summary statistics. It does not enforce policy thresholds (for example, a maximum hydration p95); those belong in a separately versioned policy so historical evidence remains valid when budgets change.
