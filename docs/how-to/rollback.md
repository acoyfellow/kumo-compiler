# Roll back

1. Stop releases and select the retained, known-good Worker version.
2. Dry-run: `CLOUDFLARE_WORKER_VERSION_ID=… npm run rollback:dry-run`.
3. With production authorization, run `CLOUDFLARE_WORKER_VERSION_ID=… npm run rollback`.
4. Probe the public `https://kumo-compiler.coey.dev` routes and run the production proof; no Access credentials are required.
5. Record version IDs, source revisions, artifact identities, operator, timing, probes, and Cloudflare Ray IDs.

Do not rebuild an old source revision as a substitute for its retained immutable artifact. A live rollback rehearsal remains an external operational blocker. Follow [incident response](../runbooks/incident-response.md) if probes fail.
