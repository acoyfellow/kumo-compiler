# Research Brief — Facets as Compiler Nodes: New-Age, Agent-Native Compilation

**Status:** OPEN RESEARCH. Provocative on purpose. The goal is to map an
unexplored design space, not to ship. Bias toward odd, unconventional ideas.

## The seed idea

A classical compiler is a fixed pipeline of deterministic passes over an AST:
parse → typecheck → lower → optimize → emit. Each pass is a pure function.

**What if each pass were instead a bounded LLM sub-agent (a "facet") — a little
node in a graph — with its own memory, prompt, tools, and a verification gate as
its type-checker?** We have a working spike (`facet-compiler-spike/`) where a
parent Cloudflare agent fans out one `subAgent()` facet per (component, framework),
each compiling independently with isolated SQLite state. That is a compiler whose
nodes are agents.

This brief asks: **how far does that go, and what becomes possible that a classical
compiler cannot do?**

## Hard grounding (what we actually proved, so research stays honest)

- Real primitive exists: `@cloudflare/agents` `subAgent()` = colocated child DO,
  typed RPC, isolated SQLite, `runFiber()` durable execution. `@cloudflare/think`
  layers an agent harness (sessions, memory, tools) on top. Verified, running.
- Spike: 21 facets (7 components × 3 frameworks) fan out in parallel, each persists
  its own output, parent collects. ~20–160ms. Deterministic transform today; the
  one swap to make it a real compiler is replacing the emit with a model call +
  interaction-test gate.
- Hard-won lesson: **the verification gate IS the type-checker.** A facet may only
  report "done" if its output passes a real, executable check (for us: a browser
  interaction test). No self-certification.

## Research questions (the unexplored route)

### A. The compiler-as-agent-graph model
1. What is the right **IR between facets**? Classical compilers pass typed ASTs.
   Agent facets could pass natural-language specs, structured contracts, code,
   traces, or *examples*. What IR makes facet-to-facet handoff lossless AND
   lets a model do its best work? Is the IR even text, or is it executable tests?
2. Classical passes are **pure and ordered**. Facets are **stochastic and
   parallel**. What does a "pass schedule" look like when passes can fail
   non-deterministically and be retried, forked, or run as an ensemble?
3. **Speculative / ensemble compilation:** run N facets on the same node with
   different prompts/models, keep the one that passes the gate (race/quorum).
   Classical compilers can't do this. What does it buy? When is it worth the cost?

### B. The verification-as-types insight
4. If the gate is the type-checker, what is the **richest executable gate** we can
   afford per node? Interaction tests, property tests, differential tests vs the
   canonical, visual diffs, a11y trees. Can the gate itself be a facet?
5. **Differential compilation:** the oracle is the canonical implementation (React
   Kumo). Every facet's output is checked against the canonical's observable
   behavior. This is "compile by example / by reference." How general is this beyond
   UI? (compilers from reference impls in any language?)

### C. What becomes possible that classical compilers cannot do
6. **Self-extending compilers:** a facet that hits an unknown construct writes a new
   facet (a new pass) to handle it, registers it, retries. (Think supports
   self-authored tools at runtime.) Where does this help vs. become chaos?
7. **Repair instead of fail:** classical compilers error out. A facet graph can
   *repair* — re-prompt, fork, try another library, downgrade gracefully — and only
   surface a genuinely novel blocker to a human. What is the repair taxonomy?
8. **Provenance & receipts native to the graph:** each facet emits an immutable
   receipt (input digest, model, gate result). The whole compile is a verifiable
   DAG of receipts. What guarantees does that give that `tsc` cannot?

### D. The economics and the failure modes
9. **Cost.** Classical passes are ~free. Facet passes are LLM calls. What's the
   real cost model of fan-out? When does speculative/ensemble pay off? Where is the
   break-even vs. just writing the deterministic pass by hand?
10. **The false-green trap** (we lived it): a facet reports done, the gate was weak,
    output is theater. What gate-design discipline prevents this structurally?
11. **Determinism & reproducibility:** classical compilers are reproducible. Agent
    compilers are not, by default. How do receipts + content-addressing + frozen
    inputs + pinned models recover enough reproducibility to trust the output?

### E. Prior art to map (find the real neighbors of this idea)
12. Survey and HONESTLY position against: Mitosis / framework-agnostic compilers;
    LLM "agentic coding" loops (SWE-agent, etc.); program synthesis &
    sketch-based / example-based synthesis (FlashFill, Sketch); superoptimizers;
    e-graphs / equality saturation; verified compilers (CompCert); "neural
    compilation"; multi-agent orchestration (AutoGen, LangGraph, CrewAI);
    Cloudflare's own ARC "Ensemble Decision System" (multi-critic PASS/WARN/FAIL).
    For each: what does the facet-compiler idea borrow, and what is genuinely new?

## Deliverable

A single document: `docs/research/facet-compiler-findings.md` that:
- Maps the design space (the agent-graph compiler model) with a clear diagram.
- Answers each research question with a position (not a hedge), grounded where
  possible in the spike and prior art.
- Names the 3 most promising *and* 3 most dangerous directions, bluntly.
- Proposes ONE concrete next experiment that would teach us the most for the least
  cost, building on `facet-compiler-spike/`.
- Stays honest: distinguishes "proven", "plausible", "speculative", "probably a
  trap". No hype.

## Tone

Odd and unconventional is encouraged. This is a research probe into a route almost
nobody has walked: compilers whose nodes are reasoning agents and whose type system
is executable verification. Be concrete, be skeptical, be imaginative.
