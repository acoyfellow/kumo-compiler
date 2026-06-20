# Kumo beyond React: architecture bake-off

**Audience:** Brandon and Brayden · **Length:** seven minutes · **Status:** decision checkpoint, not a winner announcement

## 0:00–0:45 — The problem

Kumo’s canonical implementation is React: `@cloudflare/kumo@2.5.2`. Teams also need native Vue, Svelte, and Solid consumption. The risk is framing that demand as “translate React.” The durable product should instead be a **versioned Kumo contract plus a conformance kit**: normalized semantics, tokens, accessibility and interaction vectors, evidence receipts, and upgrade tooling. Framework implementations are replaceable outputs against that contract.

The current internal TypeScript architecture is the control, not a strawman: 41 components × 4 frameworks = **164/164 selected browser-backed surfaces** under `kumo.ir/v1`. Bake-off work must be additive and cannot overwrite that authority.

## 0:45–1:30 — What is already decided

The planner comparison is useful but deliberately asymmetric:

| Planner | Current scope | Median | p95 | Output |
|---|---|---:|---:|---:|
| TypeScript | Full product baseline + protocol adapter | 202.041 ms | 266.759 ms | 16,067 B |
| Go | Planner artifacts | 52.897 ms | 57.269 ms | 322,487 B |
| Zig | Planner artifacts | 116.474 ms | 133.965 ms | 128,507 B |
| Rust | Planner artifacts | 879.296 ms | 1,284.361 ms | 425,543 B |

These are not equivalent full-emitter timings. ADR 001 keeps **TypeScript as the reference compiler** because only it owns the complete source-generation and browser-proof path. That is the only winner claim today. Go and Zig remain plausible future core substrates; a rewrite now would freeze the wrong boundary.

## 1:30–2:20 — The three architecture candidates

1. **Improved internal compiler:** preserve explicit IR and emitters; strongest existing coverage, but emitter branches may become a maintenance tax.
2. **Builder.io Mitosis:** model once and generate framework source; promising for repetitive/presentational code, but interventions and target limitations must be counted.
3. **Shared behavior core + thin native views:** share state machines, contracts, a11y rules and vectors while keeping framework-native rendering, reactivity, portals and focus.

The seven components increase pressure deliberately: **Button; Field/Input; Tabs; Select; Dialog; Popover; Date Picker.** Score public API, DOM/a11y, behavior, real SSR, warning-free hydration, server-node preservation, native ergonomics, types, bundle/tree-shaking, maintainability, upstream cost and escape hatches. A build or screenshot is not parity.

## 2:20–4:10 — Exact evidence today

### Mitosis

- **28 generated targets**: seven models × React/Vue/Svelte/Solid.
- **Button:** real target client builds and Chromium click/callback checks across all four frameworks.
- **Field:** real client build/browser checks across all four; implicit label and controlled callback work, but descriptions, errors and ARIA references are absent.
- **Tabs:** real client build/browser checks across all four; roles, selection, panel and click work. **Arrow navigation fails/is absent**, and the model lacks compound/context API and id relationships.
- For Button, Field and Tabs, all 12 SSR module bundles build, but **server render, hydration and node preservation are blocked** because no framework-specific SSR/hydration adapter exists.
- Select, Dialog, Popover and Date Picker remain generated-source evidence only; package/types/styles and portal/focus claims are unproved.

### Shared core

The real native pilot covers Button, Field and Tabs in 12 target executions. **9 passed; 3 Solid behavior checks failed.** Solid still built, SSR-rendered, hydrated without console/network errors, preserved the SSR node and passed DOM/ARIA; callbacks did not update sentinels. That is a useful real failure, not a waiver.

Select, Dialog, Popover and Date Picker are **partial**: core/type/ARIA behavior exists, but real native views, browser behavior, SSR/hydration, packaging and ergonomics are not established. The summary records 221 passed gates, 3 failed and 112 not-run; gate totals are not candidate scores.

### Change and consumer readiness

Five deterministic upstream rehearsals exist: additive component, additive prop, behavior change, CSS token rename and export rename. Browser evidence is intentionally not run in those rehearsals. DX work currently defines contracts only: schemas, manifests, ownership/drift/mutation receipts, CLI/MCP shape, package prototypes and consumer test plans. It is not yet validated consumer experience.

## 4:10–5:10 — Working hypothesis, not conclusion

The evidence supports testing a **hybrid boundary**:

- share contract, normalized semantics, tokens/CSS, state machines, a11y rules, fixtures, proof and upgrade infrastructure;
- generate presentational/simple controls plus repetitive types, exports and package scaffolding;
- use native framework views for Select/Combobox, Dialog, Popover and Date Picker where portals, focus, positioning, collections and reactivity dominate.

Do **not** conclude that Mitosis has parity because 28 files generate; that shared core wins because nine pilot targets pass; that Solid is generally unsuitable because three callback sentinels fail; or that TypeScript architecture wins because it is the language reference. We have not selected an architecture.

## 5:10–6:10 — Next proof: the four hard components

For **Select, Dialog, Popover and Date Picker**, build idiomatic React/Vue/Svelte/Solid consumers for each viable candidate and run the same gates:

- canonical API, controlled/uncontrolled state and event ordering;
- keyboard/focus behavior and complete ARIA/DOM relationships;
- collections for Select; portal, trap, restore and dismissal for Dialog; anchor positioning/outside interaction for Popover; constraints, grid semantics and date keyboard behavior for Date Picker;
- real target SSR, warning-free hydration and server-node preservation;
- emitted types, package exports/styles/assets, tree-shaking and bundle measurements;
- intervention ledger: adaptation, plugin, patch, wrapper, post-process, manual target, unsupported or blocked;
- one upstream behavior-change rehearsal through each path.

## 6:10–7:00 — Consumer DX/AX plan and asks

Run one small Vue, Svelte and Solid consumer per candidate. Test installation, imports, SSR app integration, styling/tokens, typed authoring, accessible keyboard/screen-reader flows, upgrade/drift reporting and agent-readable mutation plans. Pair automated AX checks with manual keyboard and screen-reader review; capture immutable receipts. Contracts become product evidence only after these journeys run.

**Decisions requested from Brandon and Brayden:**

1. Affirm the product boundary: Kumo contract + conformance kit, not universal React translation.
2. Keep TypeScript as reference through this bake-off; do not fund a language port yet.
3. Approve a time-boxed hard-component proof for Select, Dialog, Popover and Date Picker across Mitosis and shared-core/native boundaries, measured against the internal control.
4. Require the existing rubric and immutable receipts; no winner from generation/build counts.
5. Nominate one Vue, one Svelte and one Solid consumer for DX/AX review.
6. Set the decision gate: choose an architecture only after hard-component, packaging, upstream-cost and consumer evidence is complete.
