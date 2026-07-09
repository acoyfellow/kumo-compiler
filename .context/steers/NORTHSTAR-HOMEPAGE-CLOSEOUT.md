# OWNER STEER — NORTHSTAR HOMEPAGE CLOSEOUT

Continue the existing Northstar Kumo homepage campaign as the single authoritative writer. Do not start or permit a duplicate writer in the same worktree.

The latest owner-routed status is authoritative input: Vue had four newly discovered homepage defects and all four were fixed and screenshot-verified: NB1 unstyled→styled, NB2 open-at-load→closed, NB3 scaffold→presentable, NB4 menu-corner→anchored. Svelte and Solid replication is in flight.

Required next work:
1. Replicate the underlying fixes—not screenshot-specific hacks—into Svelte and Solid, preserving framework semantics.
2. Verify all three native runtimes independently against canonical React after hydration: styled, menus/popovers closed at initial load, presentable rather than scaffold UI, and overlays/menu anchored to their trigger.
3. Treat the prior claim that Svelte's far-left/top-left popup was an “accepted portal-order artifact” as superseded. It is not acceptable for this closeout. Anchoring must be visibly correct.
4. Run the real four-iframe homepage together (React + Svelte + Vue + Solid) at the same viewport/state. Capture one inspectable screenshot showing all four. Actually look at the rendered pixels; grep, DOM counts, HTTP 200, and agent self-report are not visual verification.
5. Also rerun the DOM/computed-style/pixel cascade and record all deltas. No silent masks, broad tolerances, screenshot-only CSS, or hiding failures. Initial state must be deterministic and closed.
6. Preserve the existing single-writer coordination lock and unrelated dirty work. Before edits, identify current owner/worktree state; if another writer is active, stop and coordinate rather than race.
7. Do not publish npm packages, push, deploy, or modify the public site without Jordan's explicit authorization. Local commits are okay only if consistent with the campaign's existing authority.

Stop gate:
- Vue, Svelte, and Solid are each independently screenshot-verified styled + closed + presentable + anchored;
- the real four-iframe screenshot exists and has been visually inspected;
- fresh cascade receipts pass or honestly enumerate any blocker;
- exact source commits/worktree state and artifact paths are reported;
- no duplicate writer and no unauthorized publication/deployment.

Send the completion push only after this gate. Include the four-iframe screenshot path and exact remaining deltas, even if zero.
