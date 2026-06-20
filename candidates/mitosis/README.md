# Mitosis bake-off candidate

Seven source exports live in `src/components.lite.tsx`. `scripts/generate.mjs` parses real Mitosis models and invokes React, Vue, Svelte, and Solid generators. Generated target files are committed.

## Adaptations and limitations

The generation driver is the sole adapter (all file/lines, low maintenance, sensitive to Mitosis parser/generator APIs). No post-processing, native wrappers, or manual target implementations are used. Mitosis 0.13.2 does not itself supply portals, focus management, compound/context contracts, packaging, SSR hosts, or hydration harnesses. Those dimensions are honestly `not-run`; they are not forced to pass. Refs, controlled/uncontrolled state, events/slots, and types exist in the richer source models but generated smoke models are intentionally minimal because the parser rejected a multi-export model. This parser adaptation applies to all 28 targets.
