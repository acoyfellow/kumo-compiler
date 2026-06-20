# Axis A language parity

This campaign compares only planner implementation language for the exact Button and Select entries in `shootout/workloads.json`. It makes no architecture, browser, or winner claim. The immutable baseline and environment manifest are bound through `proof/shootout/baseline/baseline.json`, and each embedded result is validated as `shootout/v1`.

```sh
node scripts/shootout/languages/run.mjs
```

The runner checks normalized semantic correctness and a common artifact schema before reporting performance. Raw output byte metadata remains separate. It runs candidates serially with two discarded warmups and ten measured samples, using fresh/clean output roots from both repository and external CWDs. Requests have one portable semantic digest; absolute runtime roots are excluded from it. Receipts contain no machine-local paths.

CPU and peak RSS are blocked when a reliable common macOS measurement mechanism is unavailable; they must not be inferred from wall time. Wall variance is approved measured metadata only, not a ranking. Cold setup/build, incremental behavior, diagnostics, source LOC/maintenance, and binary/distribution size are recorded explicitly. Prebuilt candidates leave cold build blocked rather than fabricating a value. Mandatory product gates remain blocked because this runner proves planner protocol parity, not browser/product correctness; therefore it declares no winner.
