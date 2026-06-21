# Deterministic self-healing workflow

The planner is a pure, content-addressed decision layer. It reads observable status, workflow/gates, capability slot limits, ownership scopes, and timing/failure receipts. It never edits authority, workflow state, packages, deploy output, canonical evidence, or protected files.

## Recurring Pi protocol

1. **Plan:** put a complete input at `.workflow/planner/input.json`; run `npm run workflow:plan`. This is report-only. Review the input and plan digests.
2. **Guard:** compare baseline and candidate gate policy. The fail-closed guard rejects gate removal/optionalization, inventory below 41, new skips/suppressions/filters/exceptions/allowlists, and canonical-evidence mutation.
3. **Terrarium wave:** dispatch exactly one safe wave. Tasks carry exact owner/scopes, commands, budget, unique run/task receipt path, success and stop conditions, and forbidden actions. Path scopes are pairwise write locks. Declared capability slots bound parallel work; browser capacity defaults to one.
4. **Ingest:** store each completion at `.workflow/planner/receipts/<run>/<task>.json`, including status, fingerprint, input digest, and output digest. Never overwrite another run/task receipt.
5. **Replan:** rerun from observable facts and receipts. Use `npm run workflow:plan -- --write` only after review; it atomically writes `checkpoint.json` and `plan.json`.

Attempt one repairs. An identical second failure switches to diagnostics and reduced relevant parallelism. Attempt three escalates. The same harness fingerprint across independent components becomes one shared-capability task. Stop and escalate immediately for `unknown`, third-attempt, scope ambiguity, stale digest, malformed evidence, or any proposed gate weakening. Do not continue repeated failures manually.
