# ADR 004: Compiler Shootout v1 remains fail-closed

## Decision

No engine-language or output-architecture winner is selected. The axes are reported separately and never combined into a score.

Axis A selects exactly eight `shootout/v1` records (four planners × Button/Select). Planner correctness and deterministic distribution pass, and wall-time samples are disclosed. Reliable CPU and peak RSS are blocked; all product gates are blocked. Therefore **Engine Language winner supported? no**.

Axis B selects exactly 32 cells (four candidates × two components × four frameworks): **87 passed / 5 failed / 212 blocked / 80 not-run**. Its mandatory weight profile covers API, DOM/ARIA, behavior, client, SSR, hydration, node preservation, packaging, types, exports, styles, and consumer readiness. Critical cells are incomplete, so weights are not applied, no score is produced, and the winner is `null`.

Consumer receipts are separately summarized as **10 passed / 0 failed / 21 blocked / 6 not-run**. They do not fill Axis B cells by implication.

## Evidence rules

`proof/shootout/fan-in/selected.json` pins selected source files by SHA-256. Fan-in rejects duplicate, missing, unexpected, stale, or mixed contract/baseline/environment/browser/source-tree identities. Drill-downs expose source receipts. `mapped` and `prepared` evidence are honest provenance modes, not executed parity.

The immutable **164/164** selected browser-backed authority remains the TypeScript control and is not a shootout result or score. This decision is local-only and authorizes no deployment.
