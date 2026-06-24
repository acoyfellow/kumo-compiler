# Fan-out build pipeline (Zag/Ark behavior + compiled Kumo presentation)

A parallel-then-reconcile build for native Vue/Svelte/Solid Kumo packages. Replaces the
trace-reconstruction behavior layer with native Zag/Ark primitives; keeps Kumo's
presentation (classes/tokens/structure) as a compiled, content-addressed token map.

## Why fan-out is safe here

Each component is an INDEPENDENT package = (Ark/Zag behavior primitive) + (Kumo class map
onto data-part anchors). There is no shared mutable lowerer/tracer/IR during the build, so
(component, framework) pairs are disjoint writers. This is the structural property that
makes parallelism safe — unlike the trace-reconstruction pipeline, where every component
shared the same tracer arrays + lowerers and parallel runs corrupted captures.

## Stages

```
Wave 0  substrate/extract.mjs   single-threaded, run once, then FROZEN + read-only
        -> contracts/<component>.json : framework-neutral part->class/attr/text map
           (distilled from the canonical React traces; no reconstruction)

Wave 1  spawn.mjs               fan out build-component jobs, ≤N workers
        jobs/build-component.mjs : ONE (component, framework); reads frozen substrate;
           writes ONLY packages/<fw>/<component>/. Records the Ark binding plan +
           style contract. Pure, isolated, parallel-safe.

Wave 2  (captures)              parallel with ISOLATED browsers (own port+profile+output)
                                or serial through the cloud browser pool. Disjoint output
                                paths make parallel browsers safe.

Wave 3  reconcile.mjs           SINGLE-THREADED. The ONLY assembler of shared artifacts:
                                merges per-component manifest fragments, writes per-fw
                                index, runs the reconcile gate over the union.
```

## Invariants (the rules that keep speed honest)

1. One writer per exact path. Jobs own `packages/<fw>/<component>/*` only.
2. No shared mutable state during fan-out. Substrate is frozen + read-only.
3. Reconcile is the only assembler. Index/exports written single-threaded at fan-in.
4. The gate decides truth. No job self-certifies; reconcile gates the union.
5. Worker cap + isolated resources (own Chrome port/profile for captures).

## Validated

```
fan-out:   99 jobs (33 components x 3 frameworks) / 8 workers / ~1.7s / 0 failures / 0 collisions
reconcile: 33/33 complete x 3 frameworks / gate exit 0
```

## What remains (the real per-component work)

The build-component job currently emits a package DESCRIPTOR (Ark binding plan + style
contract). The remaining work is the per-framework CODEGEN that turns each descriptor into
real Vue/Svelte/Solid source by wrapping the named Ark primitive and attaching the class
map onto its data-part anchors, then Wave-2 captures + product-parity scoring. Because
descriptors are independent, that codegen also fans out cleanly.
