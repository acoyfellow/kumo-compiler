# Shootout v1

`shootout/v1` is a deterministic, evidence-bound comparison contract. It specifies a fair campaign; it does not implement candidates.

## Orthogonal axes

Every result selects exactly one axis. **Axis A** compares compiler implementation language: TypeScript, Go, Rust, or Zig. **Axis B** compares output architecture: internal compiler, Mitosis, or shared-core native. A result may not name both, and scores, combined rankings, and cross-axis winner claims are invalid. Run an otherwise fixed cohort for each axis.

## Fixtures and gates

Button is calibration. Its mandatory gates are simple emission, API, DOM, click, SSR, hydration, and package. Select is discrimination. Its mandatory gates are full contract, API, ARIA, keyboard, typeahead, controlled behavior, hydration, and package.

Each gate has one explicit status: `passed`, `failed`, `not-run`, or `blocked`; booleans are forbidden. Comparable scope is deterministic contract conformance and mandatory-gate outcomes. Effort, preferences, architecture-versus-language conclusions, and noisy timing are non-comparable. Canonical inputs and outputs are in `shootout/workloads.json`.

## Provenance

Every result binds candidate, framework, component, language *or* architecture, candidate/framework/component revisions, run ID, evidence SHA-256, environment-manifest SHA-256, and immutable-baseline SHA-256. Machine-local paths are prohibited.

The baseline records exact Kumo 2.5.2 package hash, npm integrity, `kumo.ir/v1` catalog digest, selected 164/164 authority manifest and per-framework digests, and environment digest. It snapshots existing authority; it does not mutate `generated/browser-evidence/authority.json`.

## Fail closed

Fan-in is blocked when a record is invalid or any comparable mandatory gate is `not-run`, `blocked`, or absent. A failed completed gate yields a failed cohort. No winner may be named unless every comparable mandatory gate is complete and passed. Validation is runtime-enforced by `shootout/validate.mjs`; JSON schemas document workload and output wire forms.
