# Kumo library IR

`manifest.json` is the sorted, canonical inventory of 41 framework-neutral component models derived from the external `kumo.observable/v1` contracts. Each model preserves the canonical exports, subpath, prop evidence and defaults while keeping contract vectors (fixtures) outside the component root.

`index.mjs` validates inventory, provenance, stable SHA-256 digests, the closed capability taxonomy, and the anti-lookalike boundary. Regenerate models solely from contract data; emitters should consume model structure and must never branch on component IDs.
