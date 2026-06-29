# E-graphs and equality saturation: the formal bridge to speculative fan-out

The central claim of this project is easy to repeat and easy to misunderstand:

> **Optimization is search through equivalent programs, not improvement.**

“Improve this program” sounds directional, as though an optimizer can inspect one representation and monotonically polish it. That is not the general problem. An optimizer has a program `p`, a semantic equivalence relation `≈`, a set of allowed representations, and a cost function `C`. Its actual problem is:

```text
choose p* ∈ { q | q ≈ p } such that C(p*) is minimal (or acceptably small)
```

The phrase *better program* is therefore incomplete. Better on which target, under which workload, and subject to which observations remaining unchanged? `x * 2` may be cheaper than `x + x` on one machine and dearer on another. Reassociating floating-point arithmetic may improve vectorization while changing observable rounding. A browser component with fewer bytes is not better if keyboard focus no longer moves correctly. Cost determines preference; the equivalence oracle determines admissibility. Conflating them licenses miscompilation.

This formulation makes three facts explicit.

1. Optimization does not change intended meaning; it chooses a representative of a meaning.
2. “Equivalent” is relative to an observation model: the source-language semantics, a refinement relation, or this project’s browser behavior contract.
3. Search and acceptance are distinct. A candidate may be cheap and inadmissible, or correct and expensive.

E-graphs and equality saturation are the canonical machinery for making this view operational. They are also the cleanest formal bridge to the project’s claim that, on Cloudflare, `optimize` can become speculative facet fan-out. The bridge is an analogy, not an identity. Its exact boundary matters.

## 1. Why rewrite order is an optimization problem

A traditional rewrite optimizer repeatedly replaces a matched term with another term:

```text
(a * 1)  → a
(a + 0)  → a
(a * 2)  → a << 1
```

If every rewrite reduced a universal scalar cost, one could greedily apply reductions until none remained. Real rules interact. One rewrite can expose another, hide another, duplicate work, or move the term into a representation where a later rule no longer matches. This is the **phase-ordering problem**.

Consider these sound integer rewrites:

```text
distribute:  a * (b + c)  ↔  a*b + a*c
factor:      a*b + a*c    ↔  a * (b + c)
strength:    x * 2        ↔  x + x
```

Suppose the input is:

```text
2*x + 2*y
```

A local strength-reduction phase might rewrite both multiplications first:

```text
(x + x) + (y + y)
```

Now the syntactic factoring rule `a*b + a*c → a*(b+c)` cannot see the shared factor `2`; a later target-specific rule that cheaply implements `2*(x+y)` is lost unless the optimizer can reverse prior choices or perform additional, non-obvious normalization. If factoring runs first, it obtains:

```text
2 * (x + y)
```

which may then become one shift or one add around a shared subexpression. Neither rule is intrinsically “the optimization.” Their order selects which future terms are reachable.

The usual responses—carefully ordered passes, repeated pipelines, peephole cleanup, target-specific heuristics—are engineering compromises. They do not remove the underlying problem. A destructive rewrite commits to one representative and discards the old one. If that commitment was premature, recovering the optimum requires backtracking or rediscovery.

Equality saturation changes the question from **“which rewrite should run next?”** to **“what equalities are known, and which representative should be selected after those equalities have accumulated?”** Instead of replacing one term by another, it records that both terms belong to the same equivalence class. Choices are delayed until extraction.

## 2. What an e-graph represents

An **e-graph** is a compact data structure for many equivalent terms. It combines three ideas:

- An **e-node** is an operator whose children are references to equivalence classes, not directly to unique syntax-tree nodes. For example, `Mul([A], [B])` is an e-node.
- An **e-class** is a set of e-nodes known to denote equivalent terms. Every concrete term represented by any e-node in that class has the same meaning under the admitted equations.
- **Congruence closure** maintains the property that applying the same operator to equivalent children yields equivalent parents. If `a ≈ b`, then `f(a) ≈ f(b)`. Consequently, e-nodes with the same operator and equivalent child e-classes must be merged.

The implementation commonly uses **union-find** (disjoint-set union) to maintain e-class identities efficiently. A rewrite discovers an equality and requests a union of two classes. Union-find chooses a canonical representative for those classes. A rebuilding/canonicalization step updates parent links and hash-consed e-nodes; if two parent e-nodes become congruent after child classes merge, their classes merge too. Union-find supplies fast equivalence maintenance, while hash-consing and parent indexing make congruence closure practical.

This representation is compact because equivalent subterms and common contexts are shared. It does not enumerate every syntax tree separately. A small graph can denote a combinatorial number of terms.

### A worked example

Start with the term:

```text
2*x + 2*y
```

An initial e-graph has e-classes for constants and variables, classes for the two multiplications, and a root class for addition. In abbreviated form:

```text
[c2] = { 2 }
[cx] = { x }
[cy] = { y }
[mx] = { Mul([c2], [cx]) }
[my] = { Mul([c2], [cy]) }
[root] = { Add([mx], [my]) }
```

Apply the factoring equality:

```text
Add(Mul(a,b), Mul(a,c))  ↔  Mul(a, Add(b,c))
```

The rule does not delete the original root e-node. It adds e-nodes/classes for `x+y` and `2*(x+y)`, then unions the latter with `[root]`:

```text
[s]    = { Add([cx], [cy]) }
[root] = {
  Add([mx], [my]),
  Mul([c2], [s])
}
```

Apply `2*z ↔ z+z` and the same root class can also contain:

```text
Add([s], [s])
```

Thus `[root]` simultaneously represents at least:

```text
2*x + 2*y
2*(x+y)
(x+y) + (x+y)
```

No phase has committed to one. If some other rule later proves `x+y ≈ y+x`, congruence closure ensures that contexts containing either child are recognized as equal without separately proving every contextual instance.

Two cautions are essential. First, the e-graph contains only equalities justified by its rewrite theory; it is not a bag of vaguely related candidates. Second, “all equivalent forms” means all forms reachable under the encoded equations and resource limits, not every semantically equivalent program in existence.

## 3. Equality saturation and delayed extraction

**Equality saturation** repeatedly matches equality-preserving rewrite rules against an e-graph and adds the resulting equivalent forms. A simplified loop is:

```text
insert input term
repeat:
  find all rewrite matches
  add their right-hand forms
  union classes established equal
  rebuild to restore congruence closure
until no new information is added, or a resource budget is exhausted
extract a preferred representative
```

At a true fixpoint, applying the rules adds no new e-nodes or unions: the graph is saturated with respect to that rule set. In practice, unrestricted equations can grow the graph enormously or never reach a useful finite fixpoint. Systems therefore stop on iteration, node, memory, or time budgets, and use scheduling heuristics to control rule application. Saturation is a method, not a promise of termination.

Only after exploration comes **extraction**. Given a cost model, an extractor finds a low-cost concrete term represented by the root e-class. For additive tree costs, it can compute something like:

```text
cost(op(children)) = local_cost(op) + Σ cheapest_cost(child)
```

and retain backpointers to reconstruct the selected term. More sophisticated extraction may account for sharing, latency, code size, target instructions, or multiple objectives; those models can require harder optimization techniques. The important point is that adding equality and choosing a representative are separate operations.

This separation resolves phase ordering in a precise sense: rewrites contribute alternatives without immediately destroying alternatives, and the target-dependent cost model decides after interactions among rewrites are visible. It does not make rule design or costing easy. A bad semantic rule makes the whole class unsound; an inaccurate cost model chooses a poor but still equivalent member.

The Rust library **egg** popularized efficient, extensible equality saturation with e-graphs, rebuilding, analyses, rewrite scheduling, and extraction. **egglog** combines the e-graph approach with a Datalog-like rule language, supporting relational reasoning and fixpoint computation. They are real tools for implementing this architecture, not metaphors for generic search.

## 4. Mapping extraction to the project’s oracle—and where the map breaks

The project describes compilation as a verified mapping and its gate as the executable equivalence oracle. That invites a mapping:

| Equality saturation | Facet compiler |
|---|---|
| rewrite match | candidate-generation strategy |
| alternative e-node/term | generated artifact candidate |
| saturation/budget | bounded fan-out and repair budget |
| extractor | deterministic fan-in/admission policy |
| cost model | gate plus policy, cost, latency, and size criteria |
| extracted term | accepted artifact |
| extraction backpointers | immutable receipt/provenance DAG |

This table is useful only with a correction: in a sound e-graph, **the cost model is not the equivalence oracle**. Rewrites have already established that every represented alternative is equivalent. Extraction merely ranks admissible terms. In this project, generated facet outputs are not known equivalent in advance. The executable gate must first establish empirical admissibility, then a policy can rank passing candidates. So the project’s “oracle/gate” occupies two roles often collapsed in casual speech:

```text
admission: does candidate q satisfy the observable contract for p?
selection: among admitted candidates, which has the preferred cost?
```

For classical equality saturation, admission occurs when trusted, meaning-preserving equations add the term; extraction handles selection. For facet fan-out, admission occurs by executing the candidate against an independently defined gate. Only then can bundle size, complexity, latency, generation cost, or other policy choose a winner.

This is the rigorous analogy:

> Both systems preserve multiple alternatives, delay commitment, spend a bounded search budget, and select a representative only after exploration. Equality saturation explores alternatives by symbolic equations; facet compilation explores alternatives by parallel synthesis and executable rejection.

The equally important **disanalogy** is:

> An e-graph explores a sound equivalence class, assuming sound rewrite rules and implementation. Facets propose candidates that are not a priori equivalent. The executable gate replaces the semantic-preservation guarantee that rewrite rules supplied.

This replacement gains expressive reach. A rewrite engine generally needs a formal term language and valid equations. A facet can propose a cross-framework port, change libraries, restructure component boundaries, adapt APIs, or synthesize glue code for transformations whose complete correctness theorem is unavailable or prohibitively expensive. **[Plausible]** This lets search cross representational boundaries where no compact, proven rewrite theory exists.

It also loses free soundness. Passing finite tests is not semantic equivalence in general. A gate observes only what its contract, fixtures, environment, and instrumentation expose. Interactive UI equivalence may require trusted pointer and keyboard events, focus transitions, accessibility state, DOM invariants, and differential traces; a screenshot or synthetic `.click()` is too weak. Extraction can no longer just sum local operator costs over a graph. Each coarse artifact may need to build and execute in a real sandbox or browser, and interactions among artifacts require a fan-in gate. Tests are evidence, not proof.

Nor do facets inherit e-graphs’ compact sharing. An e-graph can represent many terms by shared e-classes. Separate agent outputs often duplicate source, dependency installation, builds, and tests. “Replacing e-graphs with agents” would therefore discard both formal soundness and structural efficiency. The disciplined design uses deterministic rewriting or conventional optimization wherever formal structure exists, reserving stochastic facets for ambiguous residuals.

## 5. `optimize = speculative fan-out`

Within those limits, speculative execution is a defensible operational analogue of delayed extraction. A scheduler can generate independent candidates with disjoint writes, execute their gates, and commit an accepted digest atomically.

A `spawn_batch` **race** can reduce tail latency by taking the first candidate that passes a sufficiently strong gate. It must race on *verified completion*, not generation completion. A **quorum** can be useful for operational confidence or for gathering diverse evidence, but agreement among agents is not semantic equivalence. N similar models may share the same blind spot. If the gate accepts inert behavior, a race selects the fastest false green; a quorum manufactures a confident false green.

The probability can become worse with fan-out. If each independently proposed bad candidate has probability `f` of slipping through a weak gate, racing `n` candidates gives probability `1-(1-f)^n` that at least one false green is available for selection, absent compensating policy. Correlated candidates make the exact calculation different but do not provide safety. More search increases correctness only when acceptance evidence is discriminating.

Therefore the sequence must be:

```text
propose candidates in parallel
→ build and execute each under an independent, mutation-tested gate
→ reject failures
→ rank passing artifacts by deterministic policy
→ commit one artifact and its receipt
```

A **receipt** is the extraction record for this less formal search. It should bind the source and Contract IR digests, candidate/facet identity, model and prompt/toolchain versions, artifact digest, gate version, executed observations, result, cost, and selected winner. Like extractor backpointers, it explains why this representative was chosen. Unlike an e-graph proof trail, it does not establish universal semantic equivalence. A receipt can faithfully record a weak or compromised gate. Signed lies remain lies.

The gate must therefore be mutation-tested before an ensemble is trusted: known inert and known broken implementations must fail; skipped assertions, timeouts, missing interactions, and warnings must fail closed. Generator, oracle author, and runner should be separated, and a proposing facet must not edit the gate or certify itself. These are not workflow niceties. They define the trusted boundary that sound rewrite rules supplied automatically in the e-graph setting.

## 6. The bridge, stated precisely

Equality saturation makes the classical optimization thesis concrete:

```text
meaning-preserving equations
→ compactly retain reachable equivalent programs
→ delay irreversible choice
→ extract the cheapest representative
```

The project generalizes the search shape while weakening the proof regime:

```text
stochastic, parallel proposals
→ retain coarse candidate programs
→ execute an independent behavioral oracle
→ select a passing representative by policy
→ publish artifact plus receipt
```

**[Speculative]** On Cloudflare primitives, content-addressed IR, isolated Durable Object facets, parallel scheduling, browser/isolate gates, and cached receipts could make that second loop a practical compilation architecture for heterogeneous migrations. The substrate and analogy do not prove the central economics or correctness claim. The decisive experiment remains whether model-generated artifacts pass a mutation-tested executable gate at acceptable and reproducible cost.

The unconventional compiler expert should hold both ideas at once. First, optimization has never fundamentally meant “make code better”; it means search an equivalence class and choose under cost. Second, speculative facet fan-out is not equality saturation with agents. It is a riskier generalization in which candidate generation outruns formal equivalence and the gate must earn back, by execution, the admissibility that sound equations provided by construction.

That distinction is the formal bridge—and the safety rail.