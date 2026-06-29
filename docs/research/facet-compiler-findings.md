# Facet compiler findings: executable evidence as the type system

**Scope.** Every substantive claim is tagged **[proven]**, **[plausible]**, **[speculative]**, or **[probably-a-trap]**. External browsing was not used; comparisons rely on established prior-art concepts and the supplied spike/retro, so no claim of historical priority is made.

## Executive position

A facet compiler should **not** replace parsing, ordinary lowering, formatting, or optimization with LLMs. **[probably-a-trap]** Its useful form is a deterministic workflow runtime around a few bounded synthesis/repair nodes, where acceptance is decided only by independently executed contracts. **[plausible]** It is a **verified search graph**, not a classical compiler with chatbots substituted for passes. **[plausible]**

The spike proves the substrate: one Cloudflare `agents` parent dispatches 21 `(component, framework)` children in parallel; each has typed RPC and isolated SQLite, emits independently, and the parent collects in roughly 20–160 ms. **[proven]** Its emitter is deterministic and its `ok: true` is not a semantic gate, so it does not prove agentic synthesis, correctness, economics, or repair. **[proven]**

## Design-space map

```text
                 frozen sources + policy + toolchain digests
                                  |
                      [deterministic intake]
                                  |
             Contract IR: obligations + examples + assets
                                  |
                   partition into disjoint work units
                                  |
        +-------------------------+-------------------------+
        |                                                   |
 facet(component, Vue)                              facet(component, Svelte)
 isolated state/tools                               isolated state/tools
 propose -> build -> test                           propose -> build -> test
   | fail          | pass                             | fail          | pass
   v               v                                  v               v
 bounded repair  receipt + artifact             bounded repair  receipt + artifact
 retry / fork      digest                        retry / fork      digest
        |                                                   |
        +-------------------------+-------------------------+
                                  |
                deterministic fan-in / integration gate
                                  |
           artifact DAG + receipts + failures + cost ledger
                                  |
                                publish

Control plane: scheduler, budgets, leases, cancellation, cache, model policy
Evidence plane: pointer/keyboard events, DOM/a11y invariants, properties, diffs
Data plane: immutable Contract IR and content-addressed artifacts

Forbidden edge: a proposing facet may not declare its own output accepted.
```

Useful node kinds are deterministic extractors, generative facets, independent verifiers, and deterministic reducers. **[plausible]** Private facet memory is a search aid, never semantic authority. **[plausible]** Disjoint output ownership is required for safe fan-out; the retro’s shared-lowerer corruption and independent-package success demonstrate this locally. **[proven]**

## A. Compiler-as-agent-graph

### A1 — IR between facets

**POSITION: use a versioned, machine-checkable Contract IR whose semantic core is executable obligations; include code, examples, assets, and prose only as evidence or hints. Natural language is not authoritative IR.**

The content-addressed bundle should contain source/reference digests, target/toolchain versions, allowed dependencies, inputs/outputs, observable invariants, tests/fixtures, relevant DOM/a11y/visual snapshots, ownership boundaries, budget, and output schema. **[plausible]** Generated code is an artifact, not the contract. Traces and examples constrain behavior but are incomplete specifications. **[proven]** Single-state pixels and synthetic `.click()` examples admitted inert components in this project. **[proven]**

No practical IR makes arbitrary handoff lossless; optimize for **observable and falsifiable**, not lossless. **[plausible]** Keep concise prose because models use it well, but map each acceptance-relevant sentence to a gate assertion or mark it non-binding. **[plausible]** Tests alone are insufficient because they sample observations and may preserve accidental behavior. **[proven]** The IR is therefore structured contract + executable obligations + optional model context. **[plausible]**

### A2 — Scheduling stochastic passes

**POSITION: schedule facets as budgeted, idempotent DAG tasks with deterministic commit, not as a free-running society of agents.**

A node key should hash Contract IR, facet/prompt, model identity, toolchain/container, policy, and seed where supported. **[plausible]** Execute ready nodes in parallel only with disjoint write sets; retry transient infrastructure failures unchanged; repair semantic failures with failure evidence; fork only after classified failure; accept through a deterministic reducer. **[plausible]**

Use `READY -> RUNNING -> {PASS, TRANSIENT_FAIL, SEMANTIC_FAIL, NOVEL_BLOCKER}`. Retry transient failures under a cap; give semantic failures one evidence-guided repair and optionally one diverse fork; stop novel blockers for specification work; publish a passing artifact atomically by digest. **[plausible]** Unlimited conversations, shared branches, and dynamic graph mutation make cost and causality unintelligible. **[probably-a-trap]**

### A3 — Speculative / ensemble compilation

**POSITION: ensemble only after a first semantic failure or for high-value/high-ambiguity nodes; default to one candidate plus one evidence-guided repair.**

Diverse candidates can lower tail latency and escape correlated local mistakes. **[plausible]** They do not improve correctness under a weak oracle: a race selects the fastest false green, and a quorum of model opinions is not semantic evidence. **[proven]** Ensemble when expected failure/review cost exceeds extra generation and gate cost, or latency justifies racing. **[plausible]** Diversity must come from model family, decomposition, or tool strategy, not cosmetic prompt edits. **[plausible]** Rank by gates first, then deterministic policy/complexity/bundle-size/cost tie-breakers. **[plausible]**

## B. Verification as types

### B4 — Richest affordable gate

**POSITION: use a layered executable contract, with cheap checks first and real-environment interaction as the minimum bar for interactive UI. A facet may generate tests, but may never be the final judge.**

Order: schema/static policy -> parse/typecheck -> build/import -> unit/property tests -> real browser interaction and a11y assertions -> differential behavior -> targeted visual diff. **[plausible]** Visual comparison is secondary. **[proven]** Trusted pointer/keyboard events and postconditions are necessary because synthetic clicks and frozen state produced false greens. **[proven]**

A gate facet may propose invariants, fuzz cases, metamorphic relations, or failure minimizations. **[plausible]** Acceptance must be performed by sandboxed deterministic runners against frozen tests, including hidden tests where practical. **[plausible]** LLM-as-PASS-critic recreates self-certification. **[probably-a-trap]** Gate changes require separate review and cannot occur within the compile transaction. **[plausible]**

### B5 — Differential compilation

**POSITION: differential compilation is broadly useful for compatibility migrations, but is not general semantic compilation; compare observables under generated inputs, not snapshots.**

It applies to protocol clients, serializers, query engines, CLIs, numerical kernels with tolerances, transpilers, and language/library migrations when a reference can run in a sandbox. **[plausible]** It is strongest with generatable input domains and stable observables, and weak for nondeterministic, distributed, security-sensitive, timing-sensitive, or poorly observable systems. **[plausible]**

The reference is an oracle for compatibility, not correctness; it may contain bugs and implementation accidents. **[proven]** Compare normalized traces, properties, a11y semantics, and state transitions, explicitly deciding which quirks are contractual. **[plausible]** For Kumo, reuse Ark/Zag behavior and differentially verify presentation/integration rather than synthesizing inaccessible Base UI internals. **[proven]**

## C. Capabilities beyond classical compilers

### C6 — Self-extension

**POSITION: prohibit runtime self-registration into the trusted compiler. Permit facets to draft quarantined plug-ins/tests/rules for a separate promotion pipeline.**

Drafting may help long-tail migration domains where unknown constructs recur and executable examples are abundant. **[speculative]** A proposal needs a minimized trigger corpus, applicability predicate, implementation, regression/property tests, dependency manifest, and non-shadowing evidence. **[plausible]** Promotion requires independent held-out/adversarial evaluation and human approval. **[plausible]** Letting an agent fail, rewrite its own trusted pass or gate, register it, and retry enables specification laundering and supply-chain compromise. **[probably-a-trap]** Useful self-extension is compiler-assisted rule discovery, not live self-modification. **[plausible]**

### C7 — Repair instead of fail

**POSITION: repair only within an explicit taxonomy and budget; hard failure is often correct.**

1. Mechanical syntax/import/type errors: deterministic tools first. **[plausible]**
2. Contract-local failures: one model patch using precise evidence. **[plausible]**
3. Wrong API/library/decomposition: one approved alternate-strategy fork. **[plausible]**
4. Dependency/toolchain/flaky infrastructure: pin, retry, or route operationally. **[plausible]**
5. Missing/contradictory specification: stop for a human. **[plausible]**
6. Fan-in integration failure: dedicated integration facet with controlled writes. **[plausible]**
7. Policy/security failure: fail closed; no model repair loop. **[plausible]**

A degraded mode is acceptable only when predefined by contract and identified in the receipt; silently dropping behavior is false green. **[plausible]** Endless repair is stochastic test overfitting. **[probably-a-trap]**

### C8 — Provenance and receipts

**POSITION: require append-only, content-addressed receipts; they provide auditability and cacheability, not semantic truth.**

Bind input/contract/parent digests, facet/prompt/tool hashes, model/provider/version if available, lockfile, environment image, decoding controls/seed, timestamps, token/currency/latency usage, artifact digest, write set, gate results, and log/trace digests. **[plausible]** The DAG enables blame, incremental rebuild, duplicate suppression, policy audit, cost accounting, and deterministic-gate replay. **[plausible]** This exceeds a default `tsc` invocation, though conventional build systems and supply-chain attestations can offer similar provenance. **[proven]** Receipts prove a recorded process only under trustworthy runners/signing; signed lies remain lies. **[proven]**

## D. Economics and failure modes

### D9 — Cost

**POSITION: optimize cost per accepted artifact and escaped defect; use facets only where ambiguity or change volume makes deterministic implementation/review dearer.**

Per node: `E[cost] = candidates*(generation + sandbox + gate) + retries*repair + p_human*review + p_escape*defect`; wall time is the critical path, not total work. **[plausible]** Fan-out helps latency only until model, DO, install, browser, or rate limits saturate. **[plausible]** The spike measures deterministic orchestration, not model/gate economics, and the retro recorded no tokens. **[proven]**

Write deterministic passes for stable, enumerable, frequent, or security-critical mappings. **[plausible]** Use facets for sparse heterogeneous cases with strong oracles and valuable outputs. **[plausible]** For 41 one-off components, naive verified ports are cheaper; at hundreds changing repeatedly, mining deterministic rules from verified facet outputs may break even. **[plausible]** Default ensembles are economically unjustified. **[probably-a-trap]**

### D10 — Preventing false greens

**POSITION: separate producer, oracle author, and runner; design adversarial observable postconditions before implementation.**

Demonstrate that each gate rejects a known inert/broken implementation. **[plausible]** Exercise trusted events and assert transitions, focus, keyboard behavior, DOM/a11y semantics, and persistence. **[proven]** Run gates outside the producer with no test/baseline write access. **[plausible]** Include negative, metamorphic, property, hidden, and mutation cases. **[plausible]** Treat skips, timeouts, warnings, missing assertions, and unexecuted tests as failures; require fan-in gates. **[plausible]** Coverage numbers or model critics cannot rescue assertions of the wrong behavior. **[proven]**

### D11 — Determinism and reproducibility

**POSITION: recover reproducibility at the artifact-and-evidence boundary, not by pretending generation is deterministic.**

Freeze/hash inputs; pin locks, images, prompts, policies, tools, and model identifiers; record decoding and seeds; isolate network/clocks; cache accepted outputs by full key; rerun deterministic gates on artifacts. **[plausible]** Identical keys should resolve to the same published digest unless an explicit rebuild epoch is requested. **[plausible]** Hosted model names do not guarantee bitwise replay. **[proven]** Receipts support forensic repetition, not exact regeneration. **[plausible]** If exact source rebuild is mandatory, an external stochastic model cannot remain in the trusted path. **[plausible]**

## E12 — Prior art: borrowed versus new

The narrow candidate novelty is **persistent bounded sub-agents as graph nodes synthesizing disjoint artifacts, with executable admission/type checks and receipts forming the compilation DAG**. **[plausible]** Every ingredient has predecessors; no priority claim is established. **[proven]**

| Neighbor | Borrowed | Genuinely new in this composition |
|---|---|---|
| **Mitosis** | Framework-neutral representation and multi-target component generation. **[proven]** | Bounded agents synthesize difficult target residuals and are accepted independently by behavior gates rather than fixed emitters. **[plausible]** This loses structural guarantees, so deterministic emitters remain preferable where possible. **[proven]** |
| **SWE-agent / agentic coding loops** | Edit, run tools/tests, inspect failure, repair. **[proven]** | The loop is one keyed node in a compilation DAG with disjoint ownership, independent admission, receipts, and deterministic fan-in. **[plausible]** A facet alone is not novel. **[proven]** |
| **FlashFill** | Infer programs from examples. **[proven]** | Examples coexist with source, policy, traces, and interactions; outputs are ecosystem-scale artifacts. **[plausible]** Facets lose FlashFill’s constrained search and guarantees. **[proven]** |
| **Sketch** | Search under partial programs/constraints; counterexamples guide synthesis. **[proven]** | LLMs propose open-ended implementations across real libraries from rich runtime evidence. **[plausible]** This is less complete and has weaker guarantees. **[proven]** |
| **Superoptimizers** | Generate candidates, verify equivalence, extract by cost. **[proven]** | Candidates span framework/library/architecture choices. **[plausible]** Without equivalence proof this is test-guided search, not true superoptimization. **[proven]** |
| **E-graphs / equality saturation** | Preserve alternatives and delay extraction. **[proven]** | Facet forks are coarse artifact alternatives evaluated by executable environments. **[plausible]** They lack compact sharing and proven rewrite equivalence; replacing e-graphs with agents is a trap. **[probably-a-trap]** |
| **CompCert / verified compilers** | Treat compiler correctness as explicit evidence and minimize the trusted base. **[proven]** | Per-artifact empirical receipts can cover open ecosystems where proofs are impractical. **[plausible]** Tests are not proofs; “verified” here means gate-verified, not formally correct. **[proven]** |
| **Neural compilation** | Learned models propose code/translations where fixed rules struggle. **[proven]** | Neural generation is sandboxed inside conventional scheduling, tool use, executable rejection, provenance, and repair. **[plausible]** A model emitting target code alone is not new. **[proven]** |
| **AutoGen / LangGraph / CrewAI** | Agent graphs, roles, memory, tools, retries, routing. **[proven]** | Compiler-like immutable IR, content addressing, disjoint writers, semantic gates, and deterministic artifact commit are the contribution. **[plausible]** General orchestration already supplies most control-plane mechanics. **[proven]** |
| **Cloudflare ARC Ensemble Decision System** | Multiple critics and aggregation into PASS/WARN/FAIL. **[plausible]** | Candidate-producing facets are admitted by executable behavior, not critic consensus; receipts connect decisions to artifacts. **[plausible]** Use ARC-like critics to triage or generate tests, never as the sole semantic oracle. **[probably-a-trap]** |

## Three most promising directions

1. **Verified migration of disjoint artifacts with existing native behavior substrates. [plausible]** Ark/Zag supplies behavior; facets translate presentation/integration; real interactions reject theater. This matches the proven local shape.
2. **Evidence-guided one-shot repair with immutable receipts. [plausible]** A precise failing trace is more valuable than autonomous conversation, and receipts expose quality, cost, and recurring rules.
3. **Mining deterministic compiler rules from a verified facet corpus. [speculative]** Use expensive agents as temporary explorers, then distill repeated mappings into cheap deterministic passes; agents handle only the residual.

## Three most dangerous directions

1. **Self-modifying trusted passes or gates. [probably-a-trap]** This lets the system redefine success after failure and creates a supply-chain attack surface.
2. **Weak-oracle ensembles. [probably-a-trap]** Parallelism manufactures confident false greens faster and at higher cost.
3. **LLM-everywhere replacement of classical passes. [probably-a-trap]** It adds nondeterminism, latency, cost, and weaker guarantees to already solved transformations.

## One cheapest-highest-learning next experiment

**POSITION: convert exactly one existing spike facet—`dropdown-menu.vue`—from deterministic emission to one model call plus the existing real CDP interaction gate, then run a controlled 10-compile experiment.** **[plausible]**

Why this one: dropdown-menu is small but behaviorally diagnostic; the retro records focus-on-open failure, Ark reuse success, and an existing gate at `experiments/fanout/northstar/gate.mjs`. One target avoids 21-way cost while exercising the missing synthesis-to-verification boundary. **[proven]**

Minimal protocol:

1. Freeze a Contract IR bundle: React source, Kumo classes, Ark Vue module/exemplar, output schema, lockfile, and assertions for real pointer open, visible content, focus transfer, keyboard close/selection as supported, and a11y role/state. **[plausible]**
2. Replace only that facet’s emitter with one model proposal; write only to its isolated artifact path/state. Keep parent fan-out and other deterministic facets unchanged. **[plausible]**
3. Run the gate independently; on failure allow exactly one repair using the machine-readable trace. No ensemble. **[plausible]**
4. Repeat ten times from frozen inputs, retaining every candidate and receipt. Record tokens, currency estimate, latency, first-pass rate, repaired-pass rate, distinct output digests, gate failure classes, and human review minutes. **[plausible]**
5. Mutation-check the gate once with an intentionally inert dropdown and once with broken focus; abort the experiment if either passes. **[plausible]**

Success is **not** “10 green runs.” Success is learning whether an independently gated model facet can produce useful artifacts, whether one repair raises acceptance, whether the gate catches known defects, and what accepted-artifact cost/variance actually is. **[plausible]** If the gate misses either mutation, the result is that the oracle—not the facet—must be improved. **[proven]** If generation repeatedly reproduces the same mapping, implement that mapping deterministically and reserve facets for harder residuals. **[plausible]**

## Bottom line

The defensible route is not an autonomous compiler organism. It is a conservative build system that spends stochastic reasoning only at ambiguous boundaries, distrusts every proposal, and treats executable evidence as the admission type. **[plausible]** The Cloudflare facet substrate and parallel isolation are real. **[proven]** The central research question still unproven is whether a model-generated artifact can pass a mutation-tested interaction gate at an acceptable, reproducible cost. **[proven]**
