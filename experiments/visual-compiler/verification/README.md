# Differential verification scheduler

This verifier accepts only independently recaptured output from a served **native Vue, Svelte, or Solid build**. A candidate cell lives at:

`lowering/outputs/<target>/<component>/<state>/<viewport>/`

and must contain `trace.json`, `screenshot.png`, and `provenance.json`. Provenance schema `kumo.native-harness-provenance/v1` binds the artifacts to SHA-256 digests for generated source, lowerer, real framework compiler, native build, served harness, and browser capture. It also binds the served harness and capture to the same native build. Missing or malformed evidence fails closed.

Comparison and diagnostics are ordered: provenance, IR digest, topology, attributes/classes, geometry, computed styles, pixels, trusted behavior. Part diagnostics are sorted by stable `data-part` address.

A trace or screenshot byte-identical to canonical evidence is rejected unless provenance independently establishes a distinct generated build and explicitly records that canonical artifacts were not used by capture. Cache keys include canonical and recaptured artifacts plus every provenance digest.

```sh
node experiments/visual-compiler/verification/verifier.mjs
node experiments/visual-compiler/verification/self-check.mjs
node experiments/visual-compiler/authority/self-check.mjs
```

The self-check includes mandatory missing-output and canonical-copy attacks. A red verification matrix is expected until native framework harnesses and their evidence exist; self-check validates verifier safety and must not be interpreted as a green differential result.
