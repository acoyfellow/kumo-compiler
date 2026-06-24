# Incremental engine spike

A dependency-free Node prototype consuming only the accepted TypeScript frontend receipt/facts and real trusted tracer receipt. Rejected synthetic IR/lowering outputs are deliberately absent from the graph.

`engine.mjs` creates content-addressed component/state/target shards and an atomically replaced deterministic manifest under ignored `.cache/`. The reverse impact graph schedules only descendants of changed inputs. Workspace entries reserve persistent target dependency directories keyed by target/lock policy. `harness.mjs` is a long-lived JSON-lines page/session ownership protocol intended to wrap one Chrome/CDP process rather than restart Chrome per proof.

Commands:

```sh
node experiments/visual-compiler/engine/self-check.mjs
node experiments/visual-compiler/engine/engine.mjs
printf '%s\n' '{"id":1,"op":"hello"}' '{"id":2,"op":"page.acquire","key":"button:390"}' | node experiments/visual-compiler/engine/harness.mjs
```

The benchmark separates cold materialization from 20 warm planning/cache lookups and fails at warm p95 >= 100ms. Cache artifacts are reproducible and may be deleted safely.
