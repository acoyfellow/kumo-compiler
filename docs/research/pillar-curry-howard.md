# Curry–Howard at the edge: types, proofs, and executable equivalence

The claim that “a type checker is a theorem prover in disguise” is not metaphorical. It is a precise correspondence—but only after naming the logic, the programming language, and the theorem being proved. Those qualifications matter for this project, because its central inversion is equally precise:

> The classical type checker is an equivalence oracle run early, cheaply, and conservatively. If the relevant behavior can instead be executed cheaply in a real isolate or browser, the edge can run a richer oracle directly.

That inversion does **not** turn tests into mathematical proofs. It trades a universal static judgment for exact observations of selected executions. The opportunity is real, but so is the loss.

## 1. Programs are proofs, constructively

Curry–Howard identifies propositions with types and proofs with programs. “Proving proposition `P`” means constructing a terminating value of type `P`. Checking the proof means type-checking the program.

Consider a small typed functional core:

| Logic | Type theory | Program evidence |
|---|---|---|
| proposition `P` | type `P` | value of type `P` |
| implication `P → Q` | function type `P -> Q` | function converting evidence of `P` into evidence of `Q` |
| conjunction `P ∧ Q` | product `P × Q` | pair containing both witnesses |
| disjunction `P ∨ Q` | sum `P + Q` | tagged witness of one side |
| truth `⊤` | unit type | sole value `()` |
| falsehood `⊥` | empty / `Never` type | no constructor |
| proof normalization | program evaluation | reduction to normal form |

### Implication is a function

To prove `P → P`, assume evidence `p : P` and return it:

```text
identity : P -> P
identity = λp. p
```

The function body is the proof. Application is modus ponens: given `f : P -> Q` and `p : P`, `f p : Q`.

A slightly richer theorem is `(P → Q) → (Q → R) → (P → R)`:

```text
compose : (P -> Q) -> (Q -> R) -> P -> R
compose f g p = g (f p)
```

The implementation is forced by the proposition up to irrelevant computational choices. No theorem-prover branding is required: ordinary type checking verifies the derivation.

### Products are conjunctions

A proof of `P ∧ Q` must contain evidence for both:

```text
pair : P -> Q -> (P × Q)
pair p q = (p, q)

left : (P × Q) -> P
left (p, q) = p
```

Pair construction is conjunction introduction; projection is elimination.

### Sums are disjunctions

A proof of `P ∨ Q` must identify which proposition holds and carry its witness:

```text
Either P Q = Left P | Right Q

case : (P -> R) -> (Q -> R) -> Either P Q -> R
case f g (Left p)  = f p
case f g (Right q) = g q
```

The tags are logically necessary. To consume a disjunction, both cases must establish the same conclusion.

### `Never` is false

An empty type has no constructors. If one somehow has `n : Never`, any proposition follows:

```text
absurd : Never -> P
absurd n = match n with {}
```

This is ex falso: false implies anything. A diverging expression complicates the reading. In a total language, no closed term inhabits `Never`. In a general-purpose language with nontermination or unchecked exceptions, a term may be assigned any result type without producing a value. Thus “inhabited type equals proved proposition” is cleanest for total, pure calculi; effects require a more careful logic.

This is why the theorem-prover claim is bulletproof yet bounded. A typing derivation is literally a proof in the logic induced by the language’s typing rules. Different type systems induce different logics and prove different propositions.

## 2. What “well typed cannot go wrong” means

Robin Milner’s slogan is formalized by **type soundness**, conventionally decomposed into two metatheorems:

- **Progress:** a closed, well-typed term is a value or can take an evaluation step (possibly with explicitly modeled effects).
- **Preservation:** if a well-typed term takes a step, the resulting term has the same type.

Together they rule out a specified class of stuck states: for example, adding a number to a function or projecting a field from a boolean. Induction over typing and evaluation derivations proves these properties. The type checker checks individual derivations; the language designer proves once that accepted derivations enjoy soundness.

But “won’t go wrong” means only **won’t enter the error states excluded by this type system and operational semantics**. It does not ordinarily mean:

- the algorithm returns the intended answer;
- the program terminates;
- it is race-free, secure, accessible, fast, or free of leaks;
- a dropdown transfers focus correctly;
- source and target have identical observable behavior;
- the specification itself is correct.

A value of TypeScript type `Dropdown` is not a proof that pointer and keyboard interactions satisfy ARIA behavior. TypeScript also has deliberate unsoundness and escape hatches such as `any` and assertions. Soundness is a property of a formal system, not a vibe conferred by syntax.

Type-system strength varies. **Hindley–Milner** infers principal polymorphic types for a pure functional core and has decidable inference, but its propositions are intentionally coarse. **Refinement types** attach predicates such as `{n : Int | n > 0}` and discharge verification conditions, often through an SMT solver; expressiveness depends on a decidable refinement logic. **Dependent types** allow types to mention values—such as vectors indexed by length—and can encode deep functional correctness, but proof obligations and termination become substantial engineering work. **Gradual typing** mixes static and dynamic regions: unknown types defer obligations to runtime checks, typically inserting casts and blaming boundaries. These are points on a design spectrum, not ascending labels for “more correct.”

The checker is also not usually proving source/target semantic equivalence. It proves membership in a static discipline. Calling it an “equivalence oracle running early” is therefore a productive project-level compression: both typing and semantic verification are admission judgments intended to reject meaning-invalid artifacts. Strictly, their relations differ unless the project defines its admission type as behavioral equivalence.

## 3. Why classical checking moved left

Arbitrary semantic properties of arbitrary programs are undecidable in general. Rice’s theorem and the halting problem prevent a checker that always terminates and exactly decides every nontrivial behavioral property. Even decidable properties can be computationally prohibitive. Historically, running every program over every input was not merely expensive; “every input” is generally impossible.

Classical compilers therefore choose tractable static abstractions. A type checker maps unbounded runtime behavior into finite judgments, rejects programs it cannot establish as safe, and runs before deployment. This creates three characteristic properties:

1. **Decidability:** the compiler is expected to terminate.
2. **Conservatism:** a sound checker rejects some safe programs because its abstraction cannot prove them.
3. **Universality within scope:** when it accepts, its theorem covers every execution admitted by the formal assumptions, not only executions observed during compilation.

Hindley–Milner exemplifies this bargain: powerful inference with predictable decidability, purchased by limiting what types express. Refinement and dependent systems move the frontier but do not abolish cost, solver incompleteness, trusted axioms, or undecidability.

The boundary between static and dynamic is continuous. Static types prove before execution; contracts check values at runtime; gradual typing allocates obligations across both; symbolic execution explores path conditions; model checking exhausts finite-state models; testing samples concrete runs. A browser interaction gate sits toward the dynamic, concrete end. Its advantage is that it need not approximate browser semantics: it invokes them.

## 4. Replacing a static approximation with an executable oracle

For Kumo’s migration problem, the desired proposition is closer to:

```text
for all admissible interactions i,
  observe(reference, i) ≈ observe(candidate, i)
```

Here `observe` may include DOM state, accessibility semantics, focus, keyboard behavior, event traces, and selected visual output; `≈` must explicitly normalize irrelevant differences.

A conventional static checker cannot cheaply prove this proposition across framework runtimes and browser behavior. The project’s inversion is to execute both sides in the real environment and compare them. For a particular input and trace `i₀`, this yields something stronger than a coarse static approximation:

```text
observe(reference, i₀) ≈ observe(candidate, i₀)
```

The evidence is **exact with respect to the chosen instrumentation, environment, observation function, and run**. It catches facts ordinary types do not express: whether opening transfers focus, Escape closes, selection emits the right transition, or ARIA state changes.

But quantifiers cannot be wished away. One passing run proves the observed instance, not `∀i`. Environmental nondeterminism, timing, omitted observables, and an incorrect reference further constrain the claim. A receipt establishes “artifact hash `A` passed gate `G` in environment `E` on cases `C`,” not semantic equivalence in the CompCert sense.

Three techniques partially recover the lost universal force:

- **Property-based testing** generates many inputs and event sequences from a declared domain, checks invariants, and shrinks failures. It broadens quantified sampling but is only as good as its generators and properties.
- **Differential testing** compares reference and candidate under identical generated interactions. It is excellent for compatibility, while inheriting reference bugs and potentially preserving accidental behavior.
- **Mutation testing** deliberately injects known faults and requires the gate to reject them. It tests the sensitivity of the checker itself: inert controls, broken focus, omitted keyboard handling, or altered state transitions should not receive a false green.

Metamorphic properties, coverage-guided generation, hidden cases, and deterministic replay add further pressure. None converts finite testing into a universal proof. They make the empirical admission judgment harder to fool and expose blind spots.

Thus “run the oracle for real” should mean: run the highest-fidelity affordable semantics for carefully generated cases, not “runtime checking is magically complete.” The edge changes economics—cheap isolates, parallelism, browsers, caching—not computability theory.

## 5. Interaction is the admission type

For interactive components, static shape and a single rendered frame are under-specified propositions. The meaningful type is behavioral:

```text
InteractiveDropdown = artifact satisfying
  pointer-open ∧ focus-transfer ∧ keyboard-navigation
  ∧ close-semantics ∧ accessibility-invariants
```

No ordinary constructor gives this type. The introduction rule is execution by an independent gate. Trusted pointer and keyboard events drive the artifact; postconditions inspect state and semantics. In this operational sense, **interaction is the type check** and a passing artifact is a witness admitted to publication.

This is an analogy to proof-carrying admission, not a claim that test execution is Curry–Howard proof construction. The gate defines a test-indexed proposition. The immutable receipt records the derivation inputs: artifact, contract, environment, observations, and result. Content addressing allows that judgment to be replayed and cached.

The project should state the admission type precisely. “Looks equivalent” is not a type. A versioned Contract IR should specify domains, event traces, observables, normalization, allowed nondeterminism, and required negative cases. Otherwise the executable oracle merely makes an ambiguous specification run faster.

## 6. The forbidden edge and who checks the checker

A proposing facet may not accept its own output. This **forbidden edge** is a soundness boundary.

In logic, a proof checker must validate evidence against fixed inference rules; allowing a proof to rewrite its checker makes acceptance circular. In secure compilation, the trusted computing base is separated from untrusted producers. Here, stochastic facets are proof search: they propose candidate witnesses. The independent runner checks those witnesses against frozen obligations. If a facet can weaken tests, alter baselines, suppress failures, or declare `ok`, the system proves only “the producer approves of itself.”

Separation is necessary but insufficient. Who checks the checker?

1. Freeze and content-address the gate, dependencies, environment, and contract independently of the compile transaction.
2. Deny proposing facets write access to tests, baselines, runners, and acceptance state.
3. Mutation-test each important obligation with known-bad artifacts; fail closed on skips, timeouts, absent assertions, and unexecuted tests.
4. Review gate changes through a separate promotion path, with held-out and adversarial cases.
5. Record receipts, but remember that provenance does not make a defective runner truthful.
6. Keep the trusted base small: deterministic orchestration and runners should decide acceptance; models may propose tests or diagnose failures but should not be the sole judge.

This mirrors a classic result: no verification stack eliminates trust; it relocates and minimizes it. A machine-checked proof trusts a kernel, formalization, and toolchain. An executable gate trusts the runner, environment, observations, test generation, and specification. Mutation testing does not prove the gate sound, but it supplies concrete evidence that claimed distinctions are detectable.

## 7. The disciplined thesis

The project’s weak claim is established: Workers can host transformations, durable content-addressed IR, and parallel isolated facets. The stronger Curry–Howard-inspired design is:

- facets search for inhabitants of a behavioral admission type;
- the executable gate applies the introduction rule;
- receipts retain the evidence and provenance;
- independent verification prevents circular acceptance;
- property, differential, and mutation testing strengthen a necessarily sampled oracle.

**[Speculative]** Cheap edge execution may make this empirical type system economical enough for request-path or frequently repeated compilation. The substrate supports the experiment; acceptable cost, reproducibility, and escaped-defect rates remain unproven.

**[Speculative]** A corpus of independently admitted artifacts may reveal repeated transformations that can later be distilled into deterministic passes. That would use stochastic facets as temporary proof search, then recover classical speed and stronger static structure where regularity emerges.

The unconventional compiler expert should preserve the distinction that makes the thesis credible:

> Static typing gives a universal theorem about a deliberately limited semantics. Executable verification gives high-fidelity facts about deliberately sampled executions. The edge does not erase that tradeoff; it makes a different point on the tradeoff frontier practical.

That is the rigorous meaning of the central inversion. The type checker was always an early, economical admission oracle. Kumo can afford to move selected obligations later and make them concrete—running actual interactions in actual runtimes—provided it names the quantifiers it lost, mutation-checks the oracle it gained, and never lets the proposer certify its own proof.
