# Session Retro — 2026-06-25 — Kumo → native frameworks, the compiler detour, and the facet pivot

A deep, honest retro mined from telemetry, commits, run logs, and artifacts.
Goal: extract reusable insight, not narrate. Read the BLUNT TRUTHS first.

---

## 0. The five blunt truths (read these even if you read nothing else)

1. **We built an academic visual compiler that measured the wrong objective.**
   It got pixel parity (29/41 components) but produced **non-interactive output**.
   Pixel-perfect ≠ working. The capture components rendered one frozen state and
   ignored clicks. We mistook rendering fidelity for a working component for too long.

2. **The naive loop would have been faster.** "Here's the React source + a
   screenshot, build it in Vue/Svelte/Solid with Ark + Kumo classes, click it to
   test, iterate" — the unglamorous approach — is what actually worked once we
   pivoted to it. The compiler was premature optimization for a problem (41
   components ported once) that didn't need a compiler.

3. **The oracle was wrong, not the engine.** Every false-green this session traced
   to testing the wrong thing: synthetic `.click()` (Base UI/Ark ignore it),
   `props.state`-frozen variants, pixel diffs of single states. The moment we made
   **real interaction the gate**, truth fell out immediately.

4. **Reuse beats reconstruct.** Trace-reconstruction of Base UI behavior failed on
   the very first hard component (dropdown-menu focus-on-open). Reusing Ark/Zag
   (which already implement that behavior natively, cross-framework) made it trivial.
   We spent days reconstructing what we could have imported.

5. **Parallelism is only safe with disjoint writers.** The fan-out worked because
   each component is an independent package (disjoint paths, frozen substrate,
   single-threaded reconcile). The shared-lowerer compiler corrupted under
   parallelism. Architecture determines whether parallel agents help or thrash.

---

## 1. Telemetry (the hard numbers)

| Metric | Value | Source |
|---|---|---|
| Session wall span | ~12.5h (00:07 → 12:37 UTC) | terrarium run timestamps |
| Terrarium worker runs (today) | 32 | `~/.terrarium/runs/ter_20260625*` |
| Worker outcomes | 25 exit:0, 5 exit:1, 2 exit:128 | grepped logs |
| Parallel batches | 7 (mostly 3-worker fan-outs) | shared spawn prefixes |
| Git commits (kumo-compiler, today) | 10 | `git log --since` |
| Token usage | **NOT RECORDED** — Terrarium doesn't log tokens | mre logs |
| visual-compiler files created | ~5,312 | `find` (mostly capture artifacts) |
| fanout files created | ~1,104 (excl node_modules/dist) | `find` |

**The 5 exit:1 runs** are the "rate-limit-at-final-write" pattern: deliverable
completed, LLM rate-limited on the wrap-up write, artifacts intact. Lesson learned
mid-session: **synthesize/verify the artifact, don't re-run.** Re-running wastes a
full worker and risks clobbering good work.

**Token usage is invisible.** We cannot retro on cost because Terrarium logs no
token counts. ACTION: if cost matters, add token capture to the Terrarium run
record, or we are flying blind on the economics of fan-out forever.

---

## 2. Timeline of approaches (what we tried, in order, and why each died/lived)

```
Approach                          Outcome        Why it died / lived
─────────────────────────────────────────────────────────────────────────────
A. Observable contracts (prior)   LIVED          Real, immutable authority. Good.
B. Library IR emitters (prior)    LIVED          41/41 static surfaces. But static.
C. Visual compiler (trace→IR→3fw) DIED (kept as   Pixel parity 29/41 but produced
   "research artifact")            research)      NON-INTERACTIVE output. Wrong oracle.
D. Trace-reconstruct behavior     DIED fast       Failed on dropdown-menu focus ring.
                                                   Reconstructing Base UI from traces
                                                   is reconstructing the unobservable.
E. Zag/Ark reuse + Kumo classes   LIVED (winner)  Behavior already exists cross-fw.
                                                   Compile only presentation. 7/12 overlays.
F. Frozen capture homepage        DIED            props.state + v-if = theater. Clicks
                                                   do nothing. The defining false-green.
G. Uncontrolled-Ark + real gate   LIVED (winner)  hello/ test proved 3/3 interactive.
                                                   northstar/ proved 4/4 iframes truthful.
H. Facet compiler spike (Think/   LIVED (new)     21 facets parallel, isolated state,
   agents subAgent)                               on real CF primitive. The future.
```

---

## 3. What we did NOT do (and should have, sooner)

- **Did not write an interaction gate first.** We built captures, scorers, a whole
  tier-C pixel framework — before ever asserting "does it open when clicked?" That
  one assertion would have killed the frozen-capture path on day one.
- **Did not check if the behavior library already existed** before reconstructing
  it. `@ark-ui/{vue,solid,svelte}` existed the whole time. One `npm view` would
  have saved the trace-reconstruction detour.
- **Did not look up "facets"** when the user said it — took it figuratively, got
  lucky it mapped to a real CF primitive. Look first, assume never.
- **Did not record tokens / cost.** Cannot retro the economics.

---

## 4. Reusable assets this session produced (inventory — don't rebuild these)

| Asset | Path | Reuse for |
|---|---|---|
| Interaction gate (CDP real pointer) | `experiments/fanout/northstar/gate.mjs` | THE oracle. Any "is it interactive" check. |
| Isolated hello interactivity test | `experiments/fanout/hello/test.mjs` | Per-framework smoke test, parallel. |
| 4-iframe truthful page builder | `experiments/fanout/northstar/{build,render}.mjs` | The northstar demo pattern. |
| Facet compiler spike | `/Users/jcoeyman/cloudflare/facet-compiler-spike/` | Parallel per-component compile on CF agents. |
| Substrate extractor | `experiments/fanout/substrate/extract.mjs` | Framework-neutral part→class contracts. |
| Fan-out spawner/reconciler | `experiments/fanout/{spawn,reconcile,gate}.mjs` | Disjoint-writer parallel codegen. |
| Worker brief template | `experiments/fanout/WORKER-BRIEF.md` | One-shot airtight component briefs. |
| Neutral parity scorer + tier C | `experiments/visual-compiler/results/parity-score.mjs` | Pixel/overlay scoring (secondary to interaction). |

---

## 5. Durable principles confirmed/created this session

- **Interaction is the type-check.** Parity-by-pixel ≠ working. Gate every "live"
  claim on a real pointer-event interaction test. (Confirmed hard.)
- **Web-standard over library pixel quirks.** Judge transient affordances (focus
  rings) by a11y semantics, not by matching an inconsistent capture artifact.
- **Reuse native behavior primitives; compile only presentation.** Base UI is
  React-only; Zag/Ark are cross-framework with identical `data-part` contracts.
- **Disjoint writers make parallelism safe.** One writer per path, frozen inputs,
  single-threaded fan-in. Shared mutable state + parallel agents = corruption.
- **Per-framework iframe isolation** solves cross-framework mount collisions
  (Solid `useXContext undefined` on a combined page — gone with iframes).
- **Look up the real primitive before reconstructing or assuming.** ("facets",
  "@ark-ui/*" both existed; we assumed/reconstructed instead of checking.)
- **A compiler is justified at scale (500 components changing weekly), not at 41
  ported once.** Build the verified corpus first (naive loop), mine the compiler
  from it later if volume demands ("compile by example").

---

## 6. Process learnings (Terrarium / workers / loops)

- **Worker model flag breaks routing.** `--model claude-opus-4-8` → "No API key for
  anthropic". Spawn WITHOUT model override; inherits working gateway. (Confirmed.)
- **Rate-limit-at-write is benign.** exit:1 after deliverable done = artifacts
  intact. Synthesize, don't re-run.
- **Kill zombie Chrome at the start of every run.** `pkill -9 -f "Chrome.*headless"`.
  Overlapping loop ticks accumulate Chrome and corrupt captures.
- **3-worker fan-outs were the sweet spot.** 7 parallel batches today, mostly 3-up
  (one per framework). Clean, no collisions, ~minutes each.
- **Loops only fire on a user tick.** Real parallel work happens via background
  `terrarium_spawn` between ticks, not autonomous loops.

---

## 7. Time-of-day / focus notes

- Heavy parallel fan-out batches clustered 00:18–01:30 and 08:41–09:55 UTC.
- The decisive *insight* (pivot away from the compiler; interaction-is-the-gate)
  came late, after the long compiler investment — i.e., after sunk cost was large.
  LESSON: schedule a "are we measuring the right thing?" checkpoint EARLY, before
  building the measurement apparatus, not after.

---

## 8. The one-sentence session summary

**We took the scenic, academic route (a visual compiler that measured pixels) to
discover the unglamorous truth — reuse Ark/Zag behavior, compile only Kumo
presentation, and gate on real interaction — then proved it with a truthful
4-iframe northstar and a facet-compiler spike on real Cloudflare primitives.**
