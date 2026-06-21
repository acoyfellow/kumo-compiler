# ADR 001: Keep TypeScript as the reference compiler during the architectural bake-off

- Status: Accepted for the next phase
- Date: 2026-06-20
- Scope: implementation language for the current Kumo compiler

## Context

Four implementations satisfy the shared planning protocol for the current 41-component catalog and 164 component/framework targets:

| Implementation | Current scope | Median wall | p95 wall | Output |
|---|---|---:|---:|---:|
| TypeScript | Full product baseline plus protocol adapter | 202.041 ms | 266.759 ms | 16,067 B |
| Go | Protocol planner artifacts | 52.897 ms | 57.269 ms | 322,487 B |
| Zig | Protocol planner artifacts | 116.474 ms | 133.965 ms | 128,507 B |
| Rust | Protocol planner artifacts | 879.296 ms | 1,284.361 ms | 425,543 B |

The timing numbers are not equivalent full-emitter benchmarks. TypeScript is the only implementation that currently owns the product path from the Kumo contract through Vue, Svelte, and Solid source generation and the browser-backed 164-surface baseline. Go, Rust, and Zig currently validate the protocol and emit deterministic IR-derived planning artifacts.

The durable product is the Kumo contract and conformance kit, not any one implementation language.

## Decision

Keep TypeScript as the reference compiler for the architectural bake-off.

Do not port the complete framework emitters to Go, Rust, or Zig yet. Preserve the native planner implementations as evidence and as executable protocol clients.

Use the next engineering cycle to compare three architectural strategies on seven representative components:

1. improved internal compiler;
2. Builder.io Mitosis;
3. shared framework-neutral behavior core with thin native views.

Revisit the implementation-language decision only after the winning architectural boundary is known. If the selected architecture still has a substantial language-neutral compilation core, Go and Zig are the leading native implementation candidates for a full-emitter trial. Rust remains available but its current process/build costs need explanation before further investment.

## Rationale

- **Correctness and scope:** TypeScript has the only complete source-emission and browser-proof path.
- **Ecosystem integration:** generated Vue/Svelte/Solid packages are built and debugged in the Node framework ecosystem.
- **Iteration cost:** changing the normalized contract and framework emitters is currently simplest in TypeScript.
- **Performance:** framework builds dominate the full workflow; planner-only speed is not enough to justify a rewrite.
- **Go result:** strong startup and median performance justify keeping it as a serious future core candidate.
- **Zig result:** small binary and good planner performance justify continued feasibility work.
- **Rust result:** correctness is good, but clean build and current process timings are materially more expensive in this experiment.
- **Risk:** a premature language rewrite would preserve undocumented emitter branches before the Mitosis/shared-core bake-off determines which code should exist.

## Consequences

- The 164/164 TypeScript authority remains the control and is never replaced by planner receipts.
- Go/Rust/Zig pages remain transparent protocol-planner comparisons.
- New bake-off evidence binds architectural candidate, implementation language, component, framework, revision, run, and adaptations.
- No native candidate is described as a full Kumo framework compiler until it emits framework source and passes the same browser gates.
- This decision is reversible after architectural evidence exists.

## Revisit gate

Reopen this ADR when all three architectural candidates have evidence for Button, Field/Input, Tabs, Select, Dialog, Popover, and Date Picker, including native SSR, warning-free hydration, node preservation, package/type quality, upstream-change cost, and escape-hatch accounting.
