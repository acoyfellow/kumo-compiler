# Evidence authority

Kumo separates a claim from a demonstration that resembles it.

The canonical React authority is the pinned package provenance: package identity, integrity, exports, and byte hashes. Normalized IR then gives emitters a common source. A framework receipt binds a component result to that IR/emitter and its proof evidence. Migration status and Astro display those receipts downstream.

Authority therefore flows in one direction:

```text
pinned package → normalized IR → emitted outputs → proof evidence → receipt → derived status/UI
```

A later layer cannot strengthen a missing earlier link. A screenshot can support visual equality but not package identity, accessibility completeness, or behavioral equivalence. A build proves compilation for its inputs, not canonical provenance. An Astro label reports a receipt; it is not itself proof.

Evidence is revision-specific and schema-specific. Stale hashes, absent files, failed checks, or an unbound package make the corresponding claim unproved. Preserve failures and limitations rather than replacing them with narrative confidence.

The project scope is 45 components: 41 represented in current IR, 2 pending, and 2 excluded. The selected `kumo.browser-proof-run/v2` authority covers exactly 164 targets: 41 represented components across four frameworks. A complete run is promoted only after all 24 shards fan in; receipts and status remain downstream of that authority.
