# Speaker notes

## Delivery

- Keep the opening concrete: React is canonical; downstream teams need native framework packages.
- Say “control” rather than “legacy.” The 164/164 baseline is the strongest current proof.
- On planner numbers, pause on the caveat: Go/Rust/Zig emit planning artifacts, not complete framework packages.
- Define “blocked” precisely for Mitosis SSR: module bundle succeeded; target renderer/hydration integration was not supplied.
- State the Tabs issue plainly: clicks pass; Arrow-key behavior does not exist in the generated model.
- For shared core, lead with 9/12, then explain all three failures are Solid callback behavior. Do not generalize beyond this fixture.
- “Partial” for the four hard components means core contracts/tests, not complete native components.
- The hybrid is a hypothesis to test, not a compromise already selected.
- End on the six asks. Stop after the decision gate; use the appendix only for questions.

## Likely questions

**Why not simply ship the current compiler?** It is the control and may remain part of the answer, but the bake-off tests whether its emitter maintenance can be reduced without losing behavior or native ergonomics.

**Why not choose Mitosis now?** Generation succeeded, and simple client execution is encouraging. The hard portal/focus/collection components, SSR integration, package quality and adaptation cost are not proved.

**Why did Solid fail in shared core?** The target built, SSR/hydration/node preservation and DOM/ARIA passed; callback sentinels did not update. Diagnose the adapter/reactivity boundary before drawing broader conclusions.

**What is “consumer DX/AX”?** Real install/import/SSR/style/type/upgrade journeys plus automated and manual accessibility behavior, not API documents alone.

**What can be claimed now?** TypeScript is the language reference for the next phase. No architecture candidate has won.
