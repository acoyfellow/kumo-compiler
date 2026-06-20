# ADR 002: Architecture bake-off remains open

- Status: Proposed / evidence gathering
- Date: 2026-06-20
- Scope: framework architecture for non-React Kumo packages

## Context

React `@cloudflare/kumo@2.5.2` is canonical. The internal TypeScript compiler's `kumo.ir/v1` path remains the 41-component, 164/164 browser-backed control. The durable boundary under evaluation is the Kumo contract and conformance kit, with three candidates: improved internal compilation, Mitosis generation, and shared behavior core with thin native views.

Current evidence does not select an architecture. Mitosis generates 28 targets and has real Button/Field/Tabs client evidence, with Tabs Arrow behavior absent and SSR rendering/hydration/node preservation blocked. Shared core has a real Button/Field/Tabs pilot with 9 passed targets and 3 Solid behavior failures; the other four components remain partial. Five upstream scenarios are rehearsed without browser proof. Consumer DX artifacts are contracts and prototypes, not completed journeys.

## Status decision

- Preserve the internal TypeScript 164/164 authority as control.
- Keep ADR 001's TypeScript language-reference decision; it is not an architecture winner.
- Treat hybrid architecture as the leading hypothesis only.
- Do not select a candidate until Select, Dialog, Popover and Date Picker have real native target evidence for API, behavior, AX, SSR/hydration/node preservation, packaging/types, intervention cost, upstream change and consumer experience.
- Use the rubric and immutable receipts in `docs/roadmap/compiler-bake-off.md`; generation/build/screenshot counts cannot establish parity.

## Requested checkpoint

Brandon and Brayden are asked to affirm the contract/conformance product boundary, approve the hard-component proof, retain TypeScript through that proof, nominate Vue/Svelte/Solid consumers, and require complete evidence before architecture selection.

The seven-minute narrative and evidence index are in [`presentations/kumo-bakeoff/`](../../presentations/kumo-bakeoff/).
