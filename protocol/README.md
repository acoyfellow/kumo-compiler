# Kumo compiler protocol v1

A compiler reads one JSON request from a file argument and writes one receipt JSON to stdout. The request names explicit absolute `inputRoot` and `outputRoot`, embeds or references a `kumo.ir/v1` catalog/component, and selects frameworks. The executable must never read/write outside these roots.

Receipts identify compiler version/toolchain, contain path-addressed diagnostics (`$` paths), a deterministic `(component, framework)` plan, and a sorted output tree manifest. Manifest paths are POSIX relative paths; `..`, absolute paths, symlinks, and duplicates are forbidden. SHA-256 is lowercase hex and byte counts are raw file bytes. Error receipts have diagnostics and no outputs.

`fixtures/current-catalog.fixture.json` is mechanically derived from `generated/catalog.ir.json`: it embeds that authoritative catalog plus source hash and expected 41×4 planning, without independently restating component semantics. Regenerate with `node scripts/compiler-protocol/fixture.mjs`.

Conformance runs the adapter twice in fresh output roots and checks schemas structurally, all components/targets, deterministic plans/manifests/content, containment, diagnostics, and manifest bytes/hashes. Benchmarking uses separate processes (startup included in wall time), ≥2 discarded warmups and ≥10 measurements; records cold/warm labels, wall and child CPU, peak RSS where the platform exposes it (otherwise null), environment/toolchain, raw samples, and median/p95/population variance. `startupMs` is null because portable process-ready telemetry is unavailable.
