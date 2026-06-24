# Hand-port baseline spec (Lane B)

You are implementing **expert-competent, hand-written native components** for a bake-off
against a generic compiler. This is NOT the compiler. Write the components the way a
normal skilled framework developer would, given the canonical reference.

## Components (exactly these four)

- `button` — states: default, disabled, loading
- `checkbox` — states: unchecked, checked, indeterminate
- `field` — states: default, error, disabled
- `popover` — states: closed, open, dismissed

Viewports for proof: 390, 768, 1440 (deviceScaleFactor 1).

## Canonical reference (authoritative, read-only)

The exact DOM/classes/attributes/geometry the canonical React Kumo renders are in:

```
experiments/visual-compiler/tracer/artifacts/<component>/<state>/<viewport>/trace.json
```

Each trace has `parts[]` with `{id, part, tag, role, attrs, classes, text, geometry, style}`,
plus `behavior.{action,before,after}` and `a11y[]`. Match the **visible** output and the
**meaningful-part** structure. You may read these to learn the target. You may NOT copy
the raw `dom` HTML string into your component output.

## Hard rules

- Use canonical Kumo CSS for presentation:
  `node_modules/@cloudflare/kumo/dist/styles/kumo-standalone.css`.
  Apply the same Tailwind/utility class lists the canonical parts carry.
- NO React runtime in output.
- Idiomatic, documented public API for the framework.
- Components accept `state` and `viewport` props for the harness; in real use they would
  accept normal props (e.g. `disabled`, `checked`, `indeterminate`). Expose both: real
  props drive behavior; the harness sets `state` to pick the scenario.
- Emit events the harness can log: call a `dispatch(type, value)` / `emit('operation', …)`
  channel so the proof harness records `{type, value?}`. The canonical click logs
  `{type:"click"}`; checkbox logs `{type:"checkedChange", value}`.
- Accessibility: replicate role/aria-checked/aria-expanded/etc. from the canonical `attrs`.
- Popover: render trigger + content; `open` shows content (a portal/teleport is fine),
  `closed`/`dismissed` hide it. Match visible trigger + content design. Invisible Base UI
  focus-guard wrappers are NOT required.
- Keep it small and readable. Track your own LOC.

## What to produce

In your framework directory:
1. Component source files (one per component).
2. A `capture.mjs` that: builds your components (Vite), SSRs them, serves over HTTP,
   launches Chrome headless, navigates each component×state×viewport, takes the trusted
   click/Tab action, and writes `outputs/<component>/<state>/<viewport>/{trace.json,screenshot.png}`
   in the SAME schema as `experiments/visual-compiler/lowering/<fw>/capture.mjs` (you may
   adapt that file's capture logic — copying the harness/capture machinery is fine; only
   copying *component implementation* is forbidden).
3. A `cost.json` recording: `{wallMinutes, filesChanged, locTotal, frameworkSpecificLoc,
   iterationsToPass, firstFailureClasses[], focusedBuildMs, notes}`. Be honest.

## Done when

- All 36 cells (4×3×3) capture without error.
- Your `capture.mjs` reports passed 36/36.
- `cost.json` written.

Do not touch any path outside your assigned framework directory and `baseline/shared`
(read-only for shared). Do not modify canonical React authority, protected files, or any
Lane A compiler files.
