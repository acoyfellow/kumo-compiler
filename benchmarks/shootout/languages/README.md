# Axis A language parity

This campaign compares only planner implementation language. It makes no framework architecture, browser, or winner claim.

`fixtures.json` is a temporary, byte-hashed projection of Button and Select from the existing canonical `kumo.ir/v1` fixture because `campaign/shootout-spec` is not merged. Integration must rebind it to `shootout/workloads.json` after that branch lands and verify unchanged semantic work.

Run after building all existing compilers:

```sh
node scripts/shootout/languages/run.mjs
```

The runner uses identical semantic request JSON (only the required fresh absolute output root differs), one normalized plan schema, canonical comparisons, two discarded warmups, ten measured executions, and one CPU/RSS/time measurement mechanism. It records serialized raw samples, environment/toolchain/binary/output sizes, revision/fixture/environment/run bindings, retries, CWD and clean state. Build/setup is deliberately excluded from warm execution and must be measured independently by the producer; absent build measurements prohibit build-performance claims. If Node does not expose child `resourceUsage`, CPU/RSS fields remain explicit `null`/zero and `measurementStatus` is blocked; no CPU/RSS equivalence or ranking may then be claimed.
