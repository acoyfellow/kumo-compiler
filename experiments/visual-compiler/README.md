# Kumo visual compiler spike

This bounded spike proves the missing compiler subsystem:

```text
canonical React TSX + runtime traces + existing behavior contracts
→ validated structure / behavior / presentation / hydration IR
→ generic Vue / Svelte / Solid lowering
→ exact package-backed behavior and pixel proof
→ incremental sub-second warm loop
```

`contract.json` is the definition of done. `state.json` is the resumable controller state. The proving set is Button, Checkbox, Field, and Popover across their required states and 390/768/1440 viewports.

## Waves

1. **Wave 1, maximum four parallel paths**
   - TypeScript canonical frontend
   - oxc canonical frontend
   - trusted runtime tracer
   - IR shootout/evaluator
2. **Wave 2**
   - choose frontend and IR quantitatively
   - generic Vue, Svelte, Solid lowerers in separate path scopes
   - differential verifier
3. **Wave 3**
   - content-addressed component shards
   - persistent dependency/browser harness
   - impact analysis and benchmarks
4. **Wave 4**
   - exact four-component matrix
   - final winner receipt
   - precise promotion plan into existing compiler paths

## Inner-loop policy

- Reconcile `state.json` before launching work.
- Never exceed four workers or allow two writers in one path.
- Run focused checks first; full current-repository gates only at checkpoint.
- Cache canonical traces by package, fixture, state, viewport, browser, CSS, and font digests.
- Record and retire losing approaches; never hide unsupported constructs.
- Commit only coherent, passing checkpoints.

## Commands

Commands will stabilize as the spike lands:

```sh
node experiments/visual-compiler/run.mjs status
node experiments/visual-compiler/run.mjs wave
node experiments/visual-compiler/run.mjs verify
```
