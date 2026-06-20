# Deployment runbook

## Preconditions

- Release revision and change approval are recorded.
- `npm ci` and `npm run release:check` pass on Node 22.
- Generated migration status has no unexplained diff.
- Artifact and receipt revisions are recorded.
- Deployment owner, production target, credentials, approval path, health checks, and rollback mechanism are supplied by the operations authority.

The final item is **pending at this revision**. Without it, stop after local preparation.

## Prepare

```sh
npm run deploy:prepare
npm run release:check
```

Do not interpret preparation as deployment. `wrangler.jsonc` establishes only the Worker entry point and static asset directory.

## Execute

Pending: use the reviewed command from the operations authority. Record operator, command/tool version, target, start/end time, source revision, and artifact identity. Never place credentials in logs or receipts.

## Verify

Pending production URL and service-level checks. At minimum, the approved plan should check Worker health, Astro index/component/receipt routes, representative interaction routes, revision identity, and errors/latency.

## Abort or roll back

Stop on failed gates, target ambiguity, revision mismatch, or health regression. Follow [rollback](../how-to/rollback.md) and [incident response](incident-response.md).
