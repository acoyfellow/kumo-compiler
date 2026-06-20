# Kumo compiler bake-off

## Product boundary

The durable product is the **Kumo contract and conformance kit**, not a universal React translator.

The current TypeScript implementation and its selected evidence remain the control:

- Live baseline: <https://kumo-compiler.coey.dev>
- Canonical package: `@cloudflare/kumo@2.5.2`
- Contract: `kumo.ir/v1`
- Executable scope: 41 components
- Baseline: 164/164 selected browser-backed surfaces across React, Vue, Svelte, and Solid

Bake-off evidence is additive. It must never overwrite or weaken the baseline authority.

## Architectural candidates

1. **Builder.io Mitosis**
   - Model Kumo components in Mitosis and generate framework packages.
   - Record every adaptation, plugin, generator patch, wrapper, post-process, or manual target implementation.
2. **Improved internal compiler**
   - Includes the TypeScript reference and Go/Rust/Zig implementation experiments.
   - Language benchmarks help select the implementation substrate; they do not independently establish framework parity.
3. **Shared behavior core with thin native views**
   - Share framework-neutral state machines, contracts, a11y rules, and test vectors.
   - Keep idiomatic native React, Vue, Svelte, and Solid views.

## Bake-off components

| Component | Main pressure tested |
|---|---|
| Button | rendering, variants, events, prop forwarding |
| Field / Input | labels, descriptions, errors, ARIA references, controlled state |
| Tabs | compound API, context, keyboard navigation, roving focus |
| Select | collections, values, overlay behavior, keyboard and focus |
| Dialog | portals, focus trap/restoration, dismissal, SSR/hydration |
| Popover | anchoring, positioning, outside interaction, focus lifecycle |
| Date Picker | complex state, constraints, grid semantics, keyboard behavior |

Command Palette is the first follow-up if the initial seven are complete.

## Scoring rubric

Every candidate is scored on:

- public API fidelity;
- accessibility and DOM semantics;
- component behavior;
- real target SSR;
- hydration without warnings;
- server-node preservation;
- native framework ergonomics;
- type quality;
- bundle size and tree-shaking;
- generated-code maintainability;
- upstream-update cost;
- escape-hatch frequency and severity.

Screenshot similarity is never sufficient evidence.

## Evidence contract

Reuse the existing conformance and browser evidence pipeline. The unit of evidence is:

```text
candidate × implementation × component × framework × check
```

Every check is one of:

```text
passed | failed | not-run | blocked
```

Receipts bind:

- architectural candidate;
- implementation/source language;
- component;
- framework;
- canonical Kumo revision;
- candidate revision;
- selected run ID;
- evidence digest;
- adaptations and escape hatches.

Unsupported or missing checks remain visible and count against readiness. No optimistic booleans or hidden waivers.

## Mitosis questions

For every component/framework target, prove whether Mitosis preserves:

- compound and context APIs;
- portals;
- public/internal refs;
- controlled and uncontrolled behavior;
- events, payloads, ordering, and cancellation;
- slots and children;
- focus semantics;
- actual target SSR;
- warning-free hydration and node preservation;
- useful target-native types;
- package exports, styles, assets, and tree-shaking.

Every intervention is recorded as one of:

```text
adaptation | plugin | generator-patch | post-process | native-wrapper |
manual-target | unsupported | blocked
```

Cost records include reason, owned files/lines, maintenance scope, upstream sensitivity, and linked evidence.

## Site deliverables

Keep the current baseline at `/typescript/`. Add:

- `/go/`
- `/rust/`
- `/zig/`
- `/mitosis/`
- `/shared-core/`
- `/comparison/`

Each page reports implementation status, toolchain, architecture, conformance, diagnostics, raw benchmark samples, cold/warm timing, CPU/RSS where available, output bytes/hash, browser gates, limitations, adaptations, and exact reproduction commands.

The comparison page includes full matrices by architectural candidate and implementation language. It explains what is generated, what is native, where escape hatches exist, and why each result passed or failed.

## Expected decision shape

The leading hypothesis is hybrid, but evidence decides.

Likely shared assets:

- contracts and normalized semantics;
- tokens and CSS;
- state machines;
- accessibility rules;
- interaction vectors and fixtures;
- proof and upgrade infrastructure.

Likely generated assets:

- presentational components;
- simple controls and composition;
- repetitive types, exports, and package scaffolding.

Likely native framework implementations:

- Dialog and Popover;
- Select and Combobox;
- Date Picker;
- portal, focus, and overlay-heavy compound components.

## Ordered work

1. Finish language-neutral compiler protocol and TypeScript baseline.
2. Implement and benchmark Go, Rust, and Zig protocol candidates.
3. Add Mitosis and shared-core candidate fixtures for the seven bake-off components.
4. Run the exact conformance/browser gates and adaptation accounting.
5. Build candidate and comparison pages without replacing baseline evidence.
6. Write the selection decision record.
7. Design Svelte/Vue/Solid consumer DX and agent workflows.
8. Rehearse additive, behavioral, styling, and breaking upstream Kumo changes.
9. Prepare the seven-minute Brandon/Brayden proposal. Do not send it automatically.

## Completion gate

A candidate is complete only when its claimed scope has immutable selected receipts, reproducible commands, raw benchmark data, explicit limitations, and no unrecorded escape hatches.
