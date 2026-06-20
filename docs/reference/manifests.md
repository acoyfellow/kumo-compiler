# Manifests and receipts reference

## Canonical source

`audit/kumo-react-2.5.2.provenance.json` binds `@cloudflare/kumo@2.5.2`, npm integrity, package metadata hash, exports, and relevant file hashes. `generated/canonical-react-catalog.json` maps normalized IDs to package exports. `generated/react-audit-summary.json` currently reports 41 of 41 mapped entries passed.

## Framework receipts

`generated/receipts/<component>.<framework>.json` is the per-component result. React receipts currently use `kumo.receipt/v3` and bind canonical package/browser evidence. Non-React receipts currently use `kumo.receipt/v1` and include IR/emitter hashes and, where produced, screenshot/evidence hashes. Consumers must branch on `schemaVersion`; fields are not interchangeable across versions.

## Derived status

`generated/migration-status.json` declares `derivedOnlyFromReceipts: true`. It is a projection, not a primary proof. `benchmarks/catalog.json` supplies directory routes and recorded measurements; measurement presence is not canonical parity.

## Browser run summary

`generated/browser-evidence/run-summary.json` describes the most recent checked-in run, not necessarily every framework's latest proof. Follow each receipt's evidence pointer rather than treating this mutable summary as universal authority.

All these files are generated evidence. Regenerate through package scripts and review changes; do not manually edit a status or hash.
