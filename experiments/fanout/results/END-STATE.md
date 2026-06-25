# True end state — the path from here

No theater. No over-documentation. A clean homepage that simply shows: here's what
the compiler did, and it works — with a live, pixel-perfect (as close as the web
standard allows) dog-food demo. No hiding.

## Guiding principle (human-set)

When a blocker is a rendering edge case, **trust the web standard's semantics +
accessibility over library-author pixel quirks**. Judge correctness by what is
semantic and accessible, not by matching a transient/inconsistent capture artifact.

## Phase 1 — Native packages (fan-out codegen)  [IN PROGRESS]

Every behavior component in codegen-state.json order[] reaches FULL product parity
(tier C, neutral scorer) across native Vue/Svelte/Solid on Ark/Zag behavior + Kumo
presentation, no React runtime.

```
order: dropdown-menu[DONE], select, dialog, popover, combobox, autocomplete,
       command-palette, menu-bar, date-picker, date-range-picker, sidebar, toasty
```

Gate: experiments/fanout/gate.mjs exits 0 for all targeted; reconcile complete.

## Phase 2 — Unify all components (presentational + form + overlay)

The 33 presentational/form components already pass on the trace-reconstruction
exact tier (visual-compiler). Phase 2 assembles the COMPLETE native package per
framework = presentational/form components + the Ark-backed overlay components,
with one consistent build and index per framework. Produce a single
`experiments/fanout/packages/<fw>/index.*` exporting every component.

## Phase 3 — Live dog-food homepage

A single, clean homepage (Astro route or a small static page) that:
 - states plainly what the compiler does (1-2 sentences, no walls of text)
 - renders the LIVE native packages (Vue + Svelte + Solid) side by side for a
   handful of representative components (button, checkbox, field, dropdown-menu,
   select, dialog) — actually mounted and interactive, dog-fooding the output
 - shows the parity result honestly (e.g. "Vue/Svelte/Solid · N/N components ·
   product parity vs canonical React") sourced from the real gate/reconcile JSON,
   not hardcoded
 - no theater: if something is partial or blocked, it says so

## Phase 4 — Proof + deploy

 - Browser-proof the homepage renders the live packages with no console/network
   errors (reuse the existing browser-smoke approach).
 - Build clean, deploy, verify production serves the live demo.
 - A single terminal receipt: gate JSON + reconcile JSON + production URL.

## TERMINAL

```
fanout gate exit 0 (all order[] full parity, 3 frameworks)
+ unified per-framework packages with index
+ homepage renders live native packages, parity shown from real JSON, no errors
+ deployed and production-verified
+ one honest terminal receipt
```

Then write results/fanout-final.json and stop.
