# IR design: the protagonist of the edge compiler

A compiler is often introduced through its source language: C, Rust, TypeScript. That framing makes syntax look central and intermediate representation (IR) look like plumbing. In practice, the durable center of a compiler ecosystem is the representation on which independent tools agree. Frontends translate diverse sources into it; analyses and transformations reason over it; backends translate it into diverse targets. The language is one entrance. The IR is the meeting place.

For Kumo, this distinction is decisive. The project is not merely translating one component syntax into another. It is coordinating deterministic extraction, potentially stochastic synthesis, framework-specific emission, browser execution, and independent admission. Its central representation therefore cannot be only an abstract syntax tree. It must say what a component is obliged to do, how those obligations will be falsified, which immutable evidence and assets are inputs, and what produced each accepted artifact. This document calls that representation **Contract IR**.

## 1. Why the IR, not the language, is the protagonist

Suppose there are `N` source languages and `M` target architectures. Without a shared representation, direct translators produce an `N × M` integration problem: every frontend must understand every backend. With a stable IR boundary, each frontend lowers once and each backend consumes once, yielding roughly `N + M` integrations. The middle-end can then improve all combinations without either side knowing the other.

That arithmetic is simplified—real targets expose capabilities that can leak upward, and not every source maps cleanly—but it captures the architectural leverage. An IR makes coupling explicit and local. A frontend promises to produce well-formed IR with defined semantics. A backend promises to preserve those semantics while selecting target instructions or constructs. Passes operate against the same contract.

LLVM is the strongest practical evidence for “own the IR, own the ecosystem.” LLVM IR is not successful because it is a pleasant source language. It is successful because many language implementers can target one typed, SSA-based representation, while many architecture implementers can consume it. Analyses, optimization passes, debuggers, link-time machinery, and tooling accumulate around that boundary. A new frontend inherits mature backends; a new backend inherits mature frontends and middle-end passes. Compatibility with the IR becomes access to the ecosystem’s compound investment.

This is not proof that one universal IR is always desirable. LLVM IR deliberately lowers away source concepts that some tools need, and projects often retain multiple dialects or levels. It is proof of the governance claim: the party that defines a useful, stable interchange representation determines which semantics are first-class, which extensions compose, and where ecosystem investment accrues. **Own the IR, and you own the terms of interoperability.**

For an agent-native compiler, the same leverage applies beyond code generators. A deterministic extractor, a model-backed facet, a browser gate, a cache, and a provenance viewer should not coordinate through prompt conventions or shared filesystem folklore. They should exchange versioned objects. The compiler’s extensibility then comes from implementing that contract, not from joining an unstructured conversation.

## 2. The design axes of an IR

There is no context-free “best IR.” Design follows from the consumers and the semantic questions they must answer.

### Level: high versus low

A high-level IR preserves domain constructs: components, parts, states, event obligations, accessibility roles, perhaps framework-neutral styling. It gives transformations semantic handles and avoids forcing every pass to reconstruct intent from low-level effects. A low-level IR exposes control flow, memory operations, primitive calls, or concrete DOM operations. It is easier to execute uniformly and optimize mechanically but has discarded many distinctions.

Compilers commonly use several IRs because one level cannot serve every purpose. Kumo’s extracted substrate is visibly high-level: `extract.mjs` records a component’s states and viewports, then parts with structural identity, tags, roles, parent/order information, classes, attributes, and text per state/viewport cell. That representation is useful for styling and structural comparison. It is not sufficient to prove interaction behavior.

### Explicitness

An implicit convention is cheap for the producer and expensive for every consumer. A good IR makes acceptance-relevant facts explicit: target framework, allowed dependencies, state transitions, write ownership, environment version, gate identity, and output schema. Explicitness improves validation and scheduling, but excess detail can freeze implementation choices. The rule is not “encode everything”; it is “encode every distinction on which correctness, compatibility, caching, or policy depends.”

### Preserving source intent

Lowering can preserve what the source *does* while losing why it does it. Names, component boundaries, accessibility intent, expected focus behavior, and distinctions between contractual and incidental quirks may disappear. Preserving intent enables better diagnostics and higher-level rewrites. Conversely, retaining every source accident burdens all consumers and prevents normalization.

Contract IR should preserve intent selectively. “Focus moves to menu content after a trusted pointer opens it” is valuable intent. “The reference happened to contain this generated DOM identifier” may be incidental. The contract author must classify that distinction rather than silently treating all captured observations as semantics.

### Properties that unlock passes: SSA as the classical example

Single static assignment (SSA) gives each variable exactly one definition and represents control-flow merges explicitly, usually with phi-like semantics or block arguments. SSA is more than formatting. It makes def-use relationships direct, simplifies data-flow reasoning, enables sparse conditional constant propagation, dead-code elimination, value numbering, and many other passes. An IR property changes which analyses are cheap and reliable.

Contract IR needs analogous enabling properties. Stable obligation identifiers let gate failures point to one semantic requirement. Content-addressed inputs make node keys and memoization reliable. Explicit ownership makes parallel writes safe. Normalized observables make differential comparison possible. These are not metadata niceties; like SSA, they determine which compiler operations become tractable.

## 3. Classical requirements, adapted carefully

### Well-formedness and verification

An IR is well formed when it satisfies structural rules: required fields exist, references resolve, identifiers are unique, types and versions agree, and graph invariants hold. A verifier should reject malformed IR before expensive work. For Contract IR, verification should include schema checks, digest checks, declared gate availability, valid target/toolchain references, disjoint write sets, and resolvable obligation-to-gate mappings.

Structural verification must not be confused with semantic acceptance. A valid contract may describe impossible or contradictory obligations. A generated artifact may conform to its output schema while failing every interaction. Cheap checks establish that the question is coherent enough to run; executable gates answer whether the candidate meets it.

### Lossless versus lossy and round trips

Some IRs aim to round-trip source faithfully; others deliberately canonicalize and discard syntax. Lossless forms support refactoring and source rewriting. Lossy forms can simplify analysis and code generation. No practical Kumo handoff can preserve all source implementation detail, runtime timing, browser state, visual perception, and human design intent.

The project should therefore reject “lossless” as its primary success criterion. The stronger useful criterion is **observable and falsifiable**: every acceptance-relevant claim names an observation and a gate capable of rejecting a counterexample. This is not mathematical completeness. Tests sample behavior, references contain bugs, and hidden environmental differences remain. It is, however, an operational contract with a defined failure surface.

### Human-readable versus machine-checkable

Readable IR improves review, debugging, model consumption, and governance. Rigid binary or over-normalized formats can hide meaning. Yet prose-only representations invite ambiguity, nonlocal assumptions, and incompatible interpretations.

The solution is layered rather than compromised: a small canonical machine-checkable semantic core; human-readable rendered views; prose attached as non-binding context; executable gates referenced by immutable digest; and receipts that explain judgments. Canonical encoding matters for hashing, but canonical bytes need not be the only authoring interface.

## 4. The key move: Contract IR between facets

A classical AST represents program syntax. Kumo’s facet boundary represents a different object: a bounded synthesis problem plus its admission criteria. Its authoritative IR should be a bundle of:

1. **Structured obligations**: inputs, outputs, states, transitions, accessibility invariants, target constraints, ownership, and policy.
2. **Executable gates**: deterministic programs and fixtures that attempt to falsify those obligations in a real environment.
3. **Content-addressed assets**: reference source, extracted traces, screenshots, exemplars, lockfiles, and toolchain images, all named by digest.
4. **Optional model context**: concise prose, examples, and hints useful for proposal generation but not authoritative for acceptance.

Natural language must remain non-authoritative. This is not because models cannot use prose; they can. It is because prose lacks a stable decision procedure. “Dropdown behaves like the reference” leaves open trusted versus synthetic events, focus transfer, keyboard operation, accessibility state, timing, and which visual differences matter.

This project already encountered the consequence. Frozen captures admitted components that looked correct in one state but did not behave. Synthetic `.click()` admitted inert or incorrectly wired interactions that real pointer and keyboard paths exposed. Those were not merely bad implementations. They were false greens created by an under-specified oracle. Examples and prose described a neighborhood of intended behavior but did not define admission.

Executable gates improve this only if disciplined. The proposer cannot certify itself. Gate code and baselines cannot be writable inside the compile transaction. Each gate must be mutation-tested against known-inert and known-broken candidates; otherwise an executable test can still encode the wrong question. Skips, timeouts, missing assertions, and warnings should fail closed where they affect admission. “Executable” is not synonymous with “correct,” but it makes claims inspectable, repeatable, and falsifiable.

### Concrete Contract IR bundle sketch

The following is illustrative, not a finalized schema. Fields marked speculative represent design proposals rather than implemented project behavior.

```yaml
schemaVersion: kumo.contract/v1
component:
  id: dropdown-menu
  sourceDigest: sha256:...
  referenceRuntime: { asset: sha256:..., framework: react }
target:
  framework: vue
  versionRange: "^3.5"
  toolchainDigest: sha256:...
  allowedDependencies:
    - { package: "@ark-ui/vue", version: "...", integrity: "sha512:..." }
ownership:
  writePaths: ["packages/vue/src/dropdown-menu/**"]
inputs:
  substrate: { asset: sha256:..., schema: kumo.fanout-substrate/v1 }
  states: [closed, open]
  viewports: [390, 768, 1440]
obligations:
  - id: pointer-opens
    kind: transition
    stimulus: trusted-pointer
    from: closed
    to: open
    observables: [content-visible, aria-expanded-true]
    gates: [gate:pointer-open]
  - id: focus-transfer
    kind: accessibility
    after: pointer-opens
    observables: [focus-within-menu]
    gates: [gate:focus]
  - id: styling-contract
    kind: structural
    asset: sha256:...
    gates: [gate:parts-and-classes]
gates:
  - id: gate:pointer-open
    runnerDigest: sha256:...
    environmentDigest: sha256:...
    fixtureDigest: sha256:...
    timeoutMs: 5000
  - id: gate:focus
    runnerDigest: sha256:...
    environmentDigest: sha256:...
output:
  schema: kumo.artifact/v1
  requiredFiles: ["index.ts", "DropdownMenu.vue"]
budget:                         # speculative
  maxCandidates: 1
  maxRepairs: 1
  maxTokens: 50000
modelContext:                   # explicitly non-authoritative
  prose: "Reuse Ark behavior; preserve Kumo presentation."
  exemplarAssets: [sha256:...]
contractDigest: sha256:...
```

The canonical digest should exclude the digest field itself and cover a normalized encoding plus all referenced immutable assets. Gate mappings make prose auditable: an acceptance-relevant sentence either becomes an obligation with a gate or is visibly only context.

## 5. Edge-native IR and the compile’s own IR

The project thesis extends IR from an in-process data structure to a durable, content-addressed substrate. Contract bundles, artifacts, traces, and receipts can live in Durable Object SQLite and/or R2, addressed by cryptographic hash. The location is an implementation choice; immutability and identity are semantic choices.

A compilation node key can hash the contract, facet/prompt, model identity, decoding policy, toolchain, dependency lock, and rebuild epoch. If an accepted result exists for that full key, the system can reuse the artifact and rerun deterministic gates according to policy rather than regenerate it. If one referenced asset changes, the dependency DAG identifies affected nodes. This enables incremental compilation, duplicate suppression, and memoized compilation across requests.

Content addressing does not prove correctness. It proves identity of bytes. A weak gate cached perfectly yields durable false greens. Nor does a hosted model identifier guarantee bitwise regeneration. The reliable boundary is the accepted artifact plus replayable evidence, not the fantasy that stochastic generation is pure.

Receipts are therefore the **IR of the compile itself**. Where Contract IR describes what should be produced, a receipt DAG describes what actually produced what. Each receipt should bind parent and input digests, contract digest, facet/prompt/tool/model identifiers, environment and lockfile digests, artifact digest, write set, timestamps, cost and latency, individual gate results, and log/trace digests. Parent edges form a provenance DAG from frozen source through extraction and synthesis to integration and publication.

That DAG supports blame, audit, policy enforcement, replay of deterministic gates, cost analysis, and incremental invalidation. It also restores a practical form of reproducibility: not necessarily “generate identical bytes again,” but “retrieve the published bytes and inspect the recorded process and evidence that admitted them.” Receipts still depend on trustworthy runners and storage; a signed receipt can faithfully preserve a lie.

**[Speculative]** At Cloudflare scale, durable hash-addressed Contract IR could let the first request compile a missing target and subsequent requests reuse a globally available accepted artifact. Whether latency, model cost, cache distribution, and gate execution make request-path compilation economical is unproven. The architectural requirement is narrower and defensible: persist immutable IR and evidence so scheduling location and time do not alter semantic identity.

## 6. Design doctrine

The Kumo compiler should treat its IR as a constitution, not a transcript. Keep deterministic transformations deterministic. Spend stochastic search only where the mapping is genuinely ambiguous. Give every facet bounded inputs, explicit writes, and a versioned output. Never let a producer redefine or self-approve its gate. Preserve source intent when consumers need it; discard incidental detail deliberately. Make semantic claims observable, and make observables falsifiable. Hash every authoritative input, then record the derivation as a receipt DAG.

LLVM shows why the center wins: frontends, backends, and tools compound around a representation that gives them stable leverage. Kumo’s corresponding center is not a universal component AST. It is a Contract IR that joins obligations, executable admission, immutable evidence, and provenance. If that boundary is precise, new frameworks, models, gate runners, caches, and human review tools can evolve independently. If it is vague prose between agents, the system remains an orchestration demo regardless of how sophisticated its generators become.
