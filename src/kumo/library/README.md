# Kumo library IR

`manifest.json` is the sorted, canonical inventory of 41 framework-neutral component models derived from the external `kumo.observable/v1` contracts. Each model preserves the canonical exports, subpath, prop evidence and defaults while keeping contract vectors (fixtures) outside the component root.

`index.mjs` validates inventory, provenance, stable SHA-256 digests, the closed capability taxonomy, readiness, and the anti-lookalike boundary. `algebra.mjs` defines the strict framework-neutral expression, node, and operation grammar. Component roots are implementation data only; contract fixtures remain external.

Regenerate deterministically with `node src/kumo/library/generate.mjs`. The declarative foundation-family definitions are the sole source for ready implementations. An unready model has no implementation tree and instead records explicit missing operations. Emitters should consume algebra structure and must never branch on component IDs.
