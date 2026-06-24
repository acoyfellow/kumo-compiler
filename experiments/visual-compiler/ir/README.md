# Authority-derived core IR

The persisted `fixtures/components.json` is generated, not hand-authored. `evaluate.mjs` accepts only the passed TypeScript and Oxc frontend results plus tracer v2 results, verifies every referenced trace SHA256, and derives a part-first component/state/viewport model from those artifacts.

Each observed part retains topology, attributes, classes, text, computed style, geometry, state, viewport, behavior/focus, accessibility, and source/trace provenance. The model is platform-neutral and contains no target-framework lowering concepts.

`results.json` binds the exact bytes of tracer results, both frontend results, and both frontend facts. Candidate scores are percentages computed directly from named checks; every score equals its corresponding measurement.

```sh
node experiments/visual-compiler/ir/evaluate.mjs
node experiments/visual-compiler/ir/validate.mjs
node experiments/visual-compiler/authority/self-check.mjs
```

Limitations are explicit in `results.json`: browser facts only cover recorded cells, and Oxc symbol resolution remains syntax-only.
