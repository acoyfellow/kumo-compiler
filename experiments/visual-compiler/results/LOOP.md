# Solid-parity loop — contract

## Single objective
Bring **Solid to 36/36 product parity** (neutral scorer), run the **unseen-extension
test**, then write the **unconditional** bake-off verdict. Nothing else.

## The gate is law
`node experiments/visual-compiler/results/loop-gate.mjs` is the ONLY arbiter.
It re-runs the neutral scorer itself, so recorded numbers are never trusted.
Exit 0 = terminal. The loop may not declare done unless the gate exits 0.

## Allowed edit surface (everything else is FROZEN)
- `experiments/visual-compiler/lowering/solid/lower.mjs`   (the Solid emitter)
- `experiments/visual-compiler/lowering/solid/capture.mjs` (only if a capture bug, not to mask diffs)
- `experiments/visual-compiler/results/*` (loop bookkeeping, unseen-extension.json, final receipt)

## FROZEN — do not modify (gate enforces byte-equality vs LOOP_START_COMMIT)
- `ir/evaluate.mjs`, `ir/fixtures/components.json` (proven correct by two-framework parity)
- `lowering/core/core.mjs`, `tracer/tracer.mjs`
- `lowering/vue/lower.mjs`, `lowering/svelte/lower.mjs` (already 36/36 — must not regress)
- canonical React authority; protected files (status.json, react-checkbox.js, react-switch.js)

## Iteration protocol (every run)
1. `node results/loop-gate.mjs` — read `nextActionHint`. If exit 0 → finalize.
2. If solid < 36: edit ONLY `lowering/solid/lower.mjs` to fix the named failClasses.
   - `classAttr` (e.g. button:disabled emits cursor-pointer): fix state-conditioned class logic.
   - `geometry` (e.g. loading spinner width delta): fix SVG/icon emission, not the scorer.
   - `pixel`: usually downstream of class/geometry; fix the cause, never relax the threshold.
3. Regenerate: `node lowering/solid/lower.mjs` then re-capture: `node lowering/solid/capture.mjs`.
   (Stale capture = gate failure. Always re-capture after a lowerer edit.)
4. `node results/loop-gate.mjs --quick` to confirm progress; full gate before claiming done.
5. Commit ONLY when solid parity strictly improved or terminal reached. One coherent commit.

## Unseen-extension test (after solid 36/36)
Add ONE new state to ONE component in `ir/fixtures/components.json` TEMPORARILY in a
throwaway copy OR via a probe script — the point is to prove no lowerer edits are needed.
Re-run tracer+lower+capture+score for all three targets. Write
`results/unseen-extension.json` = `{status, lowererEditsRequired, before, after, notes}`.
`status:"passed"` REQUIRES `lowererEditsRequired === 0`. Then REVERT the fixture so the
frozen-file check passes. (The probe proves marginal-cost = fixture-only.)

## Hard anti-cheat rules
- Never relax `parity-score.mjs` thresholds or the gate. If you believe a threshold is
  wrong, STOP and surface it to the human — do not edit it to pass.
- Never copy canonical trace/screenshot bytes into outputs.
- Never add component-name branches (`if component==='solid-button'`) to any lowerer.
- Never skip/allowlist a failing cell.
- Never commit protected or frozen files.
- If two consecutive runs make zero parity progress on the same failClass, RETIRE that
  approach: record it in results/solid-attempts.json and try a structurally different fix.

## Terminal condition (gate exit 0)
vue 36/36 AND svelte 36/36 AND solid 36/36 (neutral scorer) AND no stale captures AND
frozen/protected untouched AND results/unseen-extension.json passed with 0 lowerer edits.
Then: write unconditional `results/bakeoff-final.json` (verdict promote-compiler,
confidence high), commit, and delete the loop.
